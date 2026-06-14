/* Self-contained GitHub activity widget.
   Hits GitHub's official public REST API (CORS-enabled, no auth needed,
   60 req/hr per IP). No third-party rendering service to rot. */
(function () {
  var USER = 'trans';
  var MAX = 12;

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function ago(iso) {
    var s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return s + 's ago';
    var m = Math.floor(s / 60); if (m < 60) return m + 'm ago';
    var h = Math.floor(m / 60); if (h < 24) return h + 'h ago';
    var d = Math.floor(h / 24); if (d < 30) return d + 'd ago';
    var mo = Math.floor(d / 30); if (mo < 12) return mo + 'mo ago';
    return Math.floor(mo / 12) + 'y ago';
  }

  function describe(e) {
    var repo = e.repo && e.repo.name;
    var p = e.payload || {};
    switch (e.type) {
      case 'PushEvent':
        var n = p.size || (p.commits && p.commits.length) || 0;
        var msg = p.commits && p.commits.length
          ? p.commits[p.commits.length - 1].message.split('\n')[0] : '';
        return { verb: n ? 'pushed ' + n + ' commit' + (n === 1 ? '' : 's') + ' to' : 'pushed to', repo: repo, extra: msg };
      case 'ReleaseEvent':
        return { verb: 'released', repo: repo, extra: p.release && p.release.tag_name };
      case 'CreateEvent':
        if (p.ref_type === 'repository') return { verb: 'created repository', repo: repo };
        if (p.ref_type === 'tag') return { verb: 'tagged', repo: repo, extra: p.ref };
        return null; /* skip branch creates -- noise */
      case 'WatchEvent': return { verb: 'starred', repo: repo };
      case 'ForkEvent': return { verb: 'forked', repo: repo };
      case 'PullRequestEvent': return { verb: (p.action || 'updated') + ' a pull request in', repo: repo };
      case 'IssuesEvent': return { verb: (p.action || 'updated') + ' an issue in', repo: repo };
      case 'IssueCommentEvent': return { verb: 'commented in', repo: repo };
      default: return null;
    }
  }

  function fallback() {
    var body = $('gh-body');
    if (body) {
      body.innerHTML = '<p style="color:#888;font-size:13px;margin:0;">' +
        'Couldn\'t load activity right now. ' +
        '<a href="https://github.com/' + USER + '" style="color:orange;font-weight:bold;text-decoration:none;">' +
        'View @' + USER + ' on GitHub &rarr;</a></p>';
    }
  }

  function render(profile, events) {
    var body = $('gh-body');
    if (!body) return;

    var stats = '';
    if (profile && !profile.message) {
      var year = profile.created_at ? new Date(profile.created_at).getFullYear() : '';
      stats = '<div style="color:#aaa;font-size:12px;margin:0 0 14px;">' +
        '<b style="color:#fff;">' + profile.public_repos + '</b> repos &nbsp;&middot;&nbsp; ' +
        '<b style="color:#fff;">' + profile.followers + '</b> followers' +
        (year ? ' &nbsp;&middot;&nbsp; since ' + year : '') +
        '</div>';
    }

    var lastKey = null, items = [], i;
    for (i = 0; i < events.length && items.length < MAX; i++) {
      var e = events[i];
      var d = describe(e);
      if (!d || !d.repo) continue;
      /* collapse only CONSECUTIVE repeats of the same action on the same repo
         (e.g. a burst of releases) -- a repo returned to later still shows */
      var key = e.type + '|' + d.repo;
      if (key === lastKey) continue;
      lastKey = key;
      items.push(
        '<li style="margin:0 0 11px;font-size:13px;line-height:1.35;">' +
          '<span style="color:#ccc;">' + esc(d.verb) + '</span> ' +
          '<a href="https://github.com/' + esc(d.repo) + '" style="color:#fff;text-decoration:none;font-weight:bold;">' +
            esc(d.repo) + '</a>' +
          (d.extra ? ' <span style="color:#888;">&mdash; ' + esc(d.extra) + '</span>' : '') +
          ' <span style="color:#666;font-size:11px;white-space:nowrap;">' + ago(e.created_at) + '</span>' +
        '</li>'
      );
    }

    if (!items.length) { fallback(); return; }

    body.innerHTML = stats +
      '<ul style="list-style:none;margin:0 0 14px;padding:0;">' + items.join('') + '</ul>' +
      '<a href="https://github.com/' + USER + '" style="color:orange;font-size:13px;font-weight:bold;text-decoration:none;">' +
        '@' + USER + ' on GitHub &rarr;</a>';
  }

  function load() {
    if (!$('gh-body')) return;
    var api = 'https://api.github.com/users/' + USER;
    Promise.all([
      fetch(api).then(function (r) { return r.ok ? r.json() : null; }),
      fetch(api + '/events/public?per_page=100').then(function (r) { return r.ok ? r.json() : []; })
    ]).then(function (res) {
      var events = Array.isArray(res[1]) ? res[1] : [];
      render(res[0], events);
    }).catch(fallback);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
