/* Custom rotating "ads" for my own projects. No third-party anything.
   Set the container's data-mode="four" (a 2x2 grid) or "one" (a single
   large card). The set rotates on a timer. Curate the list below. */
(function () {
  // --- Edit me: each entry is one little ad. Add/remove/reorder freely. -- //
  var ADS = [
    { name: 'C0DATA',      tag: 'Super-fast structured serialization',       url: 'https://github.com/trans/c0data', img: 'assets/images/ad-c0data.jpg' },
    { name: 'YAM',         tag: 'Fast YAML 1.2 parser & emitter in C11',     url: 'https://github.com/trans/yam', img: 'assets/images/ad-yam.webp' },
    { name: 'Ruby Facets', tag: 'The Ruby super-library of core extensions', url: 'https://github.com/rubyworks/facets', img: 'assets/images/ad-facets.webp' },
    { name: 'Jargon',      tag: 'JSON Schema as a CLI interface',            url: 'https://github.com/trans/jargon', img: 'assets/images/ad-jargon.webp' },
    { name: 'ruby.cr',     tag: 'A Ruby compatibility layer for Crystal',    url: 'https://github.com/trans/ruby.cr' },
    { name: 'Arcana',      tag: 'An interface to AI',                        url: 'https://github.com/trans/arcana', img: 'assets/images/ad-arcana.webp' },
    { name: 'bai',         tag: 'Ask an AI for the bash command you need',   url: 'https://github.com/trans/bai' }
  ];
  var INTERVAL = 7000; // ms between rotations
  // ---------------------------------------------------------------------- //

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function card(ad) {
    if (ad.img) {
      // image creative: picture fills the card, caption over a gradient
      return '<a class="myad myad-img" href="' + esc(ad.url) + '" target="_blank" rel="noopener" ' +
          'style="background-image:url(' + esc(ad.img) + ')">' +
          '<div class="myad-cap">' +
            '<div class="myad-name">' + esc(ad.name) + '</div>' +
            (ad.tag ? '<div class="myad-tag">' + esc(ad.tag) + '</div>' : '') +
          '</div>' +
        '</a>';
    }
    return '<a class="myad" href="' + esc(ad.url) + '" target="_blank" rel="noopener">' +
        '<div class="myad-name">' + esc(ad.name) + '</div>' +
        '<div class="myad-tag">' + esc(ad.tag) + '</div>' +
        '<div class="myad-cta">View on GitHub &rarr;</div>' +
      '</a>';
  }

  function start() {
    var box = document.getElementById('ads');
    if (!box || !ADS.length) return;

    // data-mode pins one layout ("four" = 2x2, "rows" = 4 stacked, "one" =
    // single big card); anything else ("oscillate") cycles through them.
    var MODES = ['four', 'rows', 'one'];
    var setting = box.getAttribute('data-mode');
    var fixed = MODES.indexOf(setting) !== -1;
    var idx = fixed ? MODES.indexOf(setting) : 0;
    var mode = MODES[idx];

    function perPage(m) { return m === 'one' ? 1 : 4; }

    var at = 0;
    function paint() {
      var n = perPage(mode);
      var html = '';
      for (var i = 0; i < n; i++) html += card(ADS[(at + i) % ADS.length]);
      var cls = 'ads-' + mode;
      box.style.opacity = '0';
      // swap class + content together (after the fade) so there are no
      // transient mismatched layouts mid-transition
      setTimeout(function () { box.className = cls; box.innerHTML = html; box.style.opacity = '1'; }, 250);
      at = (at + n) % ADS.length;
    }

    paint();
    if (ADS.length > 1) {
      setInterval(function () {
        if (!fixed) { idx = (idx + 1) % MODES.length; mode = MODES[idx]; }
        paint();
      }, INTERVAL);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
