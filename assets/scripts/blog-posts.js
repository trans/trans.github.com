/* Recent blog posts widget. Fetches the blog's own JSON feed
   (same origin: /blog/recent.json) and lists the latest posts. */
(function () {
  var FEED = '/blog/recent.json';
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function fmtDate(s) {
    var p = String(s).split('-');
    if (p.length !== 3) return '';
    return MONTHS[(+p[1]) - 1] + ' ' + (+p[2]) + ', ' + p[0];
  }

  function fallback() {
    var b = $('blog-body');
    if (b) {
      b.innerHTML = '<p style="color:#888;font-size:13px;margin:0;">Visit the ' +
        '<a href="/blog/" style="color:#FFC72C;font-weight:bold;text-decoration:none;">blog &rarr;</a></p>';
    }
  }

  function render(posts) {
    var body = $('blog-body');
    if (!body) return;
    if (!posts || !posts.length) { fallback(); return; }

    var items = posts.map(function (p) {
      return '<li style="margin:0 0 13px;font-size:14px;line-height:1.3;">' +
          '<a href="' + esc(p.url) + '" style="color:#fff;text-decoration:none;">' + esc(p.title) + '</a>' +
          '<br/><span style="color:#888;font-size:11px;">' + fmtDate(p.date) + '</span>' +
        '</li>';
    }).join('');

    body.innerHTML =
      '<ul style="list-style:none;margin:0 0 14px;padding:0;">' + items + '</ul>' +
      '<a href="/blog/" style="margin-top:auto;padding-top:12px;color:#FFC72C;font-size:13px;font-weight:bold;text-decoration:none;">' +
        'All posts on the blog &rarr;</a>';
  }

  function load() {
    if (!$('blog-body')) return;
    fetch(FEED).then(function (r) { return r.ok ? r.json() : []; }).then(render).catch(fallback);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
