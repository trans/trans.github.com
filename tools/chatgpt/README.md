# ChatGPT export → static pages

Turns a ChatGPT data export into styled, static HTML conversation pages for the
site. Plain Node, no dependencies (uses only `fs`/`path`/`zlib`, including a
small built-in reader for the export `.zip`).

## ⚠️ Privacy

Published pages are **public and crawlable**. ChatGPT logs often contain real
names, your email/employer/location, pasted private code, **API keys**, and
half-formed thoughts. So:

- `build` **refuses to run without an explicit allowlist** (or `--all`).
- Every build runs a PII/secret scan and writes `chats/scrub-report.txt`.
- **Read the report and skim every page before you commit `chats/`.**
- Pages are emitted with `<meta name="robots" content="noindex">`, but that is a
  request, not a guarantee — don't rely on it for anything truly sensitive.

## Get the export

ChatGPT → **Settings → Data controls → Export data → Export**. You'll get an
email with a download link (a `.zip`, expires ~24h). The tool reads the `.zip`
directly (or an unzipped folder, or the inner `conversations.json`).

## Use

```sh
# 1. See what's in it (newest first); pick what to publish.
node convert.js list path/to/export.zip
node convert.js list path/to/export.zip --min-messages 4   # hide tiny chats

# 2. List the ids (or EXACT titles) to publish, one per line:
#      printf '%s\n' "Designing a Ruby DSL" "abc123-conversation-id" > allow.txt
node convert.js build path/to/export.zip --ids-file allow.txt

#    ...or inline:
node convert.js build path/to/export.zip --ids "Exact Title,abc123-id"

# 3. Review chats/scrub-report.txt. Optionally auto-mask high-confidence
#    secrets (emails, sk-/AKIA/gh*/JWT/bearer tokens) and rebuild:
node convert.js build path/to/export.zip --ids-file allow.txt --redact
```

Output lands in `../../chats/` (the repo's `chats/` dir) by default; override
with `--out`. Each conversation becomes `chats/<slug>/index.html`, plus a
`chats/index.html` listing and shared `chats/chats.css`.

### Options

| flag | meaning |
|------|---------|
| `--ids "a,b"` | publish these conversation ids or exact titles |
| `--ids-file F` | same, one per line (`#` comments allowed) |
| `--all` | build everything (overrides the allowlist guard — careful) |
| `--out DIR` | output directory (default: repo `chats/`) |
| `--redact` | auto-mask high-confidence secrets in the output |
| `--include-tools` | include tool/function messages (hidden by default) |
| `--min-messages N` | (list) hide conversations shorter than N |

## Notes

- The exporter stores messages as a tree (edits/regenerations branch it); the
  tool follows `current_node` up to the root to reconstruct the active thread.
- System messages and ones flagged `is_visually_hidden_from_conversation` are
  dropped; uploaded images become `[image omitted]`.
- Markdown is rendered by a small built-in converter (headings, bold/italic,
  inline + fenced code, lists, safe links) over HTML-escaped text.

## Wire it into the site (after you build)

Add a link from the main menu or footer in `index.html`, e.g.
`<a href="/chats/">Conversations</a>`.
