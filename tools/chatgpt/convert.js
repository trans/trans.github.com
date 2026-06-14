#!/usr/bin/env node
/*
 * Convert a ChatGPT data export into static HTML pages for the site.
 *
 * Privacy first. This NEVER bulk-publishes by default: `build` requires an
 * explicit allowlist of conversations, and every build runs a PII scan and
 * writes a report (scrub-report.txt) for you to review BEFORE committing.
 *
 * Flow:
 *   node convert.js list  export.zip
 *   node convert.js build export.zip --ids-file allow.txt
 *   node convert.js build export.zip --ids "Exact Title,abc123-id" --redact
 *
 * The export may be the .zip, an unzipped directory, or conversations.json.
 * Pure Node (no dependencies).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const HERE = __dirname;
const REPO_ROOT = path.normalize(path.join(HERE, '..', '..'));
const DEFAULT_OUT = path.join(REPO_ROOT, 'chats');

const ROLE_LABEL = { user: 'You', assistant: 'ChatGPT', system: 'System', tool: 'Tool' };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function die(msg) { console.error(msg); process.exit(1); }

// --------------------------------------------------------------------------- //
// Minimal zip reader: pull one named file out of a .zip via the central dir.
// --------------------------------------------------------------------------- //
function readFromZip(buf, wantBasename) {
  // End Of Central Directory record: signature 0x06054b50, scan from the end.
  let eocd = -1;
  for (let i = buf.length - 22; i >= 0 && i >= buf.length - 22 - 65536; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) die('Not a readable zip (no end-of-central-directory record).');
  const count = buf.readUInt16LE(eocd + 10);
  let off = buf.readUInt32LE(eocd + 16);

  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(off) !== 0x02014b50) break; // central dir header
    const method = buf.readUInt16LE(off + 10);
    const compSize = buf.readUInt32LE(off + 20);
    const nameLen = buf.readUInt16LE(off + 28);
    const extraLen = buf.readUInt16LE(off + 30);
    const commentLen = buf.readUInt16LE(off + 32);
    const localOff = buf.readUInt32LE(off + 42);
    const name = buf.toString('utf8', off + 46, off + 46 + nameLen);
    off += 46 + nameLen + extraLen + commentLen;

    if (name.split('/').pop() !== wantBasename) continue;

    // Local file header at localOff: name/extra lengths can differ from central.
    if (buf.readUInt32LE(localOff) !== 0x04034b50) die('Corrupt zip local header.');
    const lNameLen = buf.readUInt16LE(localOff + 26);
    const lExtraLen = buf.readUInt16LE(localOff + 28);
    const dataStart = localOff + 30 + lNameLen + lExtraLen;
    const data = buf.subarray(dataStart, dataStart + compSize);
    if (method === 0) return Buffer.from(data);          // stored
    if (method === 8) return zlib.inflateRawSync(data);  // deflate
    die(`Unsupported zip compression method ${method}.`);
  }
  die(`No ${wantBasename} inside the zip.`);
}

function loadConversations(p) {
  let raw;
  try {
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      const j = path.join(p, 'conversations.json');
      if (!fs.existsSync(j)) die(`No conversations.json found in directory: ${p}`);
      raw = fs.readFileSync(j);
    } else {
      const head = Buffer.alloc(4);
      const fd = fs.openSync(p, 'r');
      fs.readSync(fd, head, 0, 4, 0);
      fs.closeSync(fd);
      const isZip = head.readUInt32LE(0) === 0x04034b50 || p.toLowerCase().endsWith('.zip');
      raw = isZip ? readFromZip(fs.readFileSync(p), 'conversations.json') : fs.readFileSync(p);
    }
  } catch (e) {
    if (e.code === 'ENOENT') die(`No such file: ${p}`);
    throw e;
  }
  let data;
  try { data = JSON.parse(raw.toString('utf8')); }
  catch (e) { die(`conversations.json is not valid JSON: ${e.message}`); }
  if (data && !Array.isArray(data) && Array.isArray(data.conversations)) data = data.conversations;
  if (!Array.isArray(data)) die('Unexpected conversations.json structure (expected a list).');
  return data;
}

// --------------------------------------------------------------------------- //
// Walking the message tree
// --------------------------------------------------------------------------- //
function linearize(convo) {
  // Messages form a tree (edits/regenerations branch it). current_node is the
  // active leaf; walk parents to the root and reverse.
  const mapping = convo.mapping || {};
  let node = convo.current_node;
  if (!node || !(node in mapping)) {
    const leaves = Object.keys(mapping).filter((id) => !(mapping[id].children || []).length);
    node = leaves.length ? leaves[leaves.length - 1] : null;
  }
  const chain = [];
  const seen = new Set();
  while (node && mapping[node] && !seen.has(node)) {
    seen.add(node);
    chain.push(mapping[node]);
    node = mapping[node].parent;
  }
  chain.reverse();
  return chain;
}

const role = (msg) => (msg.author || {}).role;
const isHidden = (msg) => !!((msg.metadata || {}).is_visually_hidden_from_conversation);

function extractText(msg) {
  const content = msg.content || {};
  const ctype = content.content_type;
  if (ctype === 'text') return (content.parts || []).filter((p) => typeof p === 'string').join('\n');
  if (ctype === 'code' || ctype === 'execution_output') return '```\n' + (content.text || '') + '\n```';
  if (ctype === 'multimodal_text') {
    return (content.parts || [])
      .map((p) => (typeof p === 'string' ? p : '_[image omitted]_'))
      .join('\n');
  }
  return '';
}

function visibleMessages(convo, includeTools) {
  const out = [];
  for (const node of linearize(convo)) {
    const msg = node.message;
    if (!msg) continue;
    const r = role(msg);
    if (r === 'system') continue;
    if (isHidden(msg)) continue;
    if (r === 'tool' && !includeTools) continue;
    const text = extractText(msg).trim();
    if (!text) continue;
    out.push([r || 'assistant', text]);
  }
  return out;
}

const convoTitle = (c) => (c.title || '').trim() || 'Untitled';
const convoId = (c) => c.conversation_id || c.id || '';
const convoTime = (c) => c.create_time || c.update_time || 0;

// --------------------------------------------------------------------------- //
// PII / secret scanning
// --------------------------------------------------------------------------- //
const PII_PATTERNS = [
  ['email',        /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g],
  ['openai_key',   /\bsk-[A-Za-z0-9_-]{20,}\b/g],
  ['aws_key',      /\bAKIA[0-9A-Z]{16}\b/g],
  ['github_token', /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g],
  ['slack_token',  /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g],
  ['jwt',          /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g],
  ['bearer',       /\bbearer\s+[A-Za-z0-9._-]{10,}/gi],
  ['phone',        /(?<!\d)(?:\+?\d[\d\-\s().]{7,}\d)(?!\d)/g],
  ['ip',           /\b(?:\d{1,3}\.){3}\d{1,3}\b/g],
  ['credit_card',  /\b(?:\d[ -]?){13,16}\b/g],
  ['secret_word',  /\b(api[_\- ]?keys?|secrets?|passwords?|passwd|private[_\- ]?keys?)\b/gi],
];
// Only these are auto-masked by --redact; the noisy ones are report-only.
const AUTO_REDACT = new Set(['email', 'openai_key', 'aws_key', 'github_token', 'slack_token', 'jwt', 'bearer']);

function mask(s) {
  s = String(s);
  return s.length <= 6 ? '*'.repeat(s.length) : s.slice(0, 3) + '…' + s.slice(-2);
}

function scanPii(text) {
  const hits = [];
  for (const [kind, pat] of PII_PATTERNS) {
    for (const m of text.matchAll(pat)) hits.push([kind, m[0]]);
  }
  return hits;
}

function redactText(text) {
  for (const [kind, pat] of PII_PATTERNS) {
    if (!AUTO_REDACT.has(kind)) continue;
    text = text.replace(pat, (m) => mask(m));
  }
  return text;
}

// --------------------------------------------------------------------------- //
// Minimal, safe Markdown -> HTML (operates on already-escaped text)
// --------------------------------------------------------------------------- //
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inline(s) {
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\x00${codes.length - 1}\x00`; });
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, url) =>
    /^(https?:|mailto:)/i.test(url)
      ? `<a href="${url}" rel="noopener nofollow" target="_blank">${text}</a>`
      : m);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  s = s.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');
  s = s.replace(/\x00(\d+)\x00/g, (_, i) => `<code>${codes[+i]}</code>`);
  return s;
}

function renderMarkdown(rawText) {
  const lines = esc(rawText).split('\n');
  const out = [];
  let para = [];
  let listBuf = [];
  let listType = null;
  let inCode = false;
  let codeBuf = [];

  const flushPara = () => { if (para.length) { out.push('<p>' + inline(para.join('<br>')) + '</p>'); para = []; } };
  const flushList = () => {
    if (listBuf.length) {
      out.push(`<${listType}>` + listBuf.map((x) => `<li>${inline(x)}</li>`).join('') + `</${listType}>`);
      listBuf = []; listType = null;
    }
  };

  for (const line of lines) {
    const fence = /^\s*```/.test(line);
    if (inCode) {
      if (fence) { out.push('<pre><code>' + codeBuf.join('\n') + '</code></pre>'); codeBuf = []; inCode = false; }
      else codeBuf.push(line);
      continue;
    }
    if (fence) { flushPara(); flushList(); inCode = true; continue; }
    if (!line.trim()) { flushPara(); flushList(); continue; }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { flushPara(); flushList(); const lvl = Math.min(h[1].length + 2, 6); out.push(`<h${lvl}>` + inline(h[2]) + `</h${lvl}>`); continue; }

    const ul = line.match(/^\s*[-*+]\s+(.*)$/);
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ul) { flushPara(); if (listType && listType !== 'ul') flushList(); listType = 'ul'; listBuf.push(ul[1]); continue; }
    if (ol) { flushPara(); if (listType && listType !== 'ol') flushList(); listType = 'ol'; listBuf.push(ol[1]); continue; }
    para.push(line);
  }
  if (inCode) out.push('<pre><code>' + codeBuf.join('\n') + '</code></pre>');
  flushPara(); flushList();
  return out.join('\n');
}

// --------------------------------------------------------------------------- //
// Output
// --------------------------------------------------------------------------- //
function slugify(title, fallback) {
  const s = (title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s.slice(0, 60) || fallback;
}

function fmtDate(ts) {
  if (!ts) return '';
  const d = new Date(Number(ts) * 1000);
  if (isNaN(d.getTime())) return '';
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, '0')}, ${d.getUTCFullYear()}`;
}

const CHATS_CSS = `/* Generated by tools/chatgpt/convert.js */
body { background:#000; color:#eee; margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; line-height:1.5; }
a { color:#FFC72C; }
.wrap { max-width:760px; margin:0 auto; padding:30px 18px 80px; }
.crumbs { font-size:13px; margin:0 0 24px; color:#888; }
.crumbs a { text-decoration:none; }
h1.title { font-size:26px; margin:0 0 4px; color:#fff; }
.meta { color:#888; font-size:12px; margin:0 0 28px; }
.note { background:#111; border:1px solid #333; border-left:3px solid #FFC72C; padding:10px 14px; font-size:12px; color:#aaa; margin:0 0 28px; }
.msg { margin:0 0 22px; padding:14px 16px; border-radius:8px; border:1px solid #222; }
.msg.user { background:#10161d; border-color:#1c2a38; }
.msg.assistant { background:#121212; }
.msg .who { font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#FFC72C; margin:0 0 8px; }
.msg p { margin:0 0 10px; }
.msg p:last-child { margin-bottom:0; }
.msg pre { background:#0a0a0a; border:1px solid #2a2a2a; border-radius:6px; padding:12px; overflow:auto; font-size:13px; }
.msg code { background:#0a0a0a; border:1px solid #2a2a2a; border-radius:3px; padding:1px 4px; font-size:13px; }
.msg pre code { border:0; padding:0; background:none; }
.index-list { list-style:none; padding:0; margin:0; }
.index-list li { border-bottom:1px solid #222; padding:14px 0; }
.index-list a { font-size:17px; font-weight:bold; text-decoration:none; color:#fff; }
.index-list .meta { margin:4px 0 0; }
`;

function renderPage(title, date, messages) {
  const blocks = messages.map(([r, text]) => {
    const who = ROLE_LABEL[r] || (r.charAt(0).toUpperCase() + r.slice(1));
    return `    <div class="msg ${esc(r)}">\n` +
           `      <div class="who">${esc(who)}</div>\n` +
           `      ${renderMarkdown(text)}\n` +
           `    </div>`;
  });
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>${esc(title)} &middot; 7R4N5</title>
  <link rel="shortcut icon" href="/assets/images/crown.png">
  <link rel="stylesheet" href="../chats.css">
</head>
<body>
  <div class="wrap">
    <p class="crumbs"><a href="/">7R4N5</a> &rsaquo; <a href="../">Conversations</a></p>
    <h1 class="title">${esc(title)}</h1>
    <p class="meta">${esc(date)} &middot; ${messages.length} messages</p>
    <div class="note">A selected, lightly-edited conversation with ChatGPT.</div>
${blocks.join('\n')}
  </div>
</body>
</html>
`;
}

function renderIndex(items) {
  const noun = items.length === 1 ? 'chat' : 'chats';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Conversations &middot; 7R4N5</title>
  <link rel="shortcut icon" href="/assets/images/crown.png">
  <link rel="stylesheet" href="chats.css">
</head>
<body>
  <div class="wrap">
    <p class="crumbs"><a href="/">7R4N5</a> &rsaquo; Conversations</p>
    <h1 class="title">Conversations</h1>
    <p class="meta">${items.length} selected ${noun} with ChatGPT.</p>
    <ul class="index-list">
${items.join('\n')}
    </ul>
  </div>
</body>
</html>
`;
}

// --------------------------------------------------------------------------- //
// Selection
// --------------------------------------------------------------------------- //
function select(convos, ids) {
  const byId = new Map(convos.map((c) => [convoId(c), c]));
  const byTitle = new Map();
  for (const c of convos) if (!byTitle.has(convoTitle(c))) byTitle.set(convoTitle(c), c);
  const chosen = [];
  const missing = [];
  for (let tok of ids) {
    tok = tok.trim();
    if (!tok) continue;
    if (byId.has(tok)) chosen.push(byId.get(tok));
    else if (byTitle.has(tok)) chosen.push(byTitle.get(tok));
    else missing.push(tok);
  }
  return { chosen, missing };
}

function readIdsFile(p) {
  return fs.readFileSync(p, 'utf8').split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'));
}

// --------------------------------------------------------------------------- //
// Commands
// --------------------------------------------------------------------------- //
function cmdList(opts) {
  const convos = loadConversations(opts.export);
  convos.sort((a, b) => convoTime(b) - convoTime(a));
  console.log(`${convos.length} conversations (newest first):\n`);
  console.log(`${'DATE'.padEnd(13)} ${'MSGS'.padStart(4)}  ${'ID'.padEnd(38)} TITLE`);
  console.log('-'.repeat(100));
  for (const c of convos) {
    const n = visibleMessages(c, opts.includeTools).length;
    if (opts.minMessages && n < opts.minMessages) continue;
    console.log(`${fmtDate(convoTime(c)).padEnd(13)} ${String(n).padStart(4)}  ${convoId(c).padEnd(38)} ${convoTitle(c)}`);
  }
}

function cmdBuild(opts) {
  const convos = loadConversations(opts.export);

  let ids = opts.ids ? opts.ids.split(',') : [];
  if (opts.idsFile) ids = ids.concat(readIdsFile(opts.idsFile));

  let chosen;
  if (opts.all) {
    console.log('!! --all: building EVERY conversation. Make sure you have reviewed');
    console.log('!! the privacy implications -- these become public.\n');
    chosen = convos.slice();
  } else {
    if (!ids.length) {
      die('Refusing to build without a selection (privacy).\n' +
          'Run `list` first, then pass --ids / --ids-file (or --all to override).');
    }
    const r = select(convos, ids);
    chosen = r.chosen;
    if (r.missing.length) {
      console.log('WARNING: no match for these ids/titles:');
      for (const m of r.missing) console.log(`  - ${m}`);
      console.log('');
    }
    if (!chosen.length) die('Nothing matched; aborting.');
  }

  const out = opts.out;
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'chats.css'), CHATS_CSS);

  const report = [];
  const indexItems = [];
  const used = new Set();
  chosen.sort((a, b) => convoTime(b) - convoTime(a));

  for (const c of chosen) {
    const title = convoTitle(c);
    const date = fmtDate(convoTime(c));
    let messages = visibleMessages(c, opts.includeTools);
    if (!messages.length) { console.log(`skip (no visible messages): ${title}`); continue; }

    const flags = [];
    for (const [r, text] of messages) {
      for (const [kind, snippet] of scanPii(text)) flags.push([r, kind, snippet]);
    }
    if (flags.length) report.push([title, convoId(c), flags]);

    if (opts.redact) messages = messages.map(([r, t]) => [r, redactText(t)]);

    let slug = slugify(title, (convoId(c) || 'chat').slice(0, 8));
    const base = slug;
    let k = 2;
    while (used.has(slug)) slug = `${base}-${k++}`;
    used.add(slug);

    const cdir = path.join(out, slug);
    fs.mkdirSync(cdir, { recursive: true });
    fs.writeFileSync(path.join(cdir, 'index.html'), renderPage(title, date, messages));

    indexItems.push(
      `      <li><a href="${esc(slug)}/">${esc(title)}</a>` +
      `<div class="meta">${esc(date)} &middot; ${messages.length} messages</div></li>`);
    console.log(`built: chats/${slug}/  (${messages.length} msgs)${flags.length ? '  [PII flagged]' : ''}`);
  }

  fs.writeFileSync(path.join(out, 'index.html'), renderIndex(indexItems));

  const reportPath = path.join(out, 'scrub-report.txt');
  let reportText;
  if (!report.length) {
    reportText = 'No PII/secret patterns detected. Still, skim the pages before publishing.\n';
  } else {
    reportText = 'POTENTIAL PII / SECRETS -- review before publishing.\n' +
      '(snippets are masked; phone/ip/credit_card/secret_word are noisy)\n\n';
    for (const [title, cid, flags] of report) {
      reportText += `## ${title}  [${cid}]\n`;
      for (const [r, kind, snippet] of flags) reportText += `  - ${kind.padEnd(12)} (${r}): ${mask(snippet)}\n`;
      reportText += '\n';
    }
  }
  fs.writeFileSync(reportPath, reportText);

  console.log(`\nindex: ${path.join(out, 'index.html')}`);
  console.log(`report: ${reportPath}`);
  if (report.length) {
    const total = report.reduce((s, [, , f]) => s + f.length, 0);
    console.log(`\n*** ${total} potential PII/secret hits across ${report.length} conversations. ` +
                'Read the report before committing. ***');
    if (!opts.redact) console.log('    (re-run with --redact to auto-mask high-confidence secrets)');
  }
}

// --------------------------------------------------------------------------- //
// CLI
// --------------------------------------------------------------------------- //
function parseArgs(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--all') opts.all = true;
    else if (a === '--include-tools') opts.includeTools = true;
    else if (a === '--redact') opts.redact = true;
    else if (a === '--ids') opts.ids = argv[++i];
    else if (a === '--ids-file') opts.idsFile = argv[++i];
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--min-messages') opts.minMessages = parseInt(argv[++i], 10);
    else if (a.startsWith('--')) die(`Unknown option: ${a}`);
    else opts._.push(a);
  }
  return opts;
}

function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  const opts = parseArgs(rest);
  opts.export = opts._[0];
  if (opts.out == null) opts.out = DEFAULT_OUT;

  const USAGE = 'usage:\n' +
    '  node convert.js list  <export.zip|dir|conversations.json> [--include-tools] [--min-messages N]\n' +
    '  node convert.js build <export.zip|dir|conversations.json> [--ids "a,b"] [--ids-file F]\n' +
    '                        [--all] [--out DIR] [--include-tools] [--redact]';

  if (cmd === 'list') { if (!opts.export) die(USAGE); cmdList(opts); }
  else if (cmd === 'build') { if (!opts.export) die(USAGE); cmdBuild(opts); }
  else die(USAGE);
}

main();
