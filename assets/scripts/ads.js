/* Custom rotating "ads" for my own projects. No third-party anything.
   Set the container's data-mode="four" (a 2x2 grid) or "one" (a single
   large card). The set rotates on a timer. Curate the list below. */
(function () {
  // --- Edit me: each entry is one little ad. Add/remove/reorder freely. -- //
  var ADS = [
    { name: 'c0data',  tag: 'Super-fast structured serialization',       url: 'https://github.com/trans/c0data', img: 'assets/images/ad-c0data.jpg' },
    { name: 'jargon',  tag: 'JSON Schema as a CLI interface',            url: 'https://github.com/trans/jargon' },
    { name: 'ruby.cr', tag: 'A Ruby compatibility layer for Crystal',    url: 'https://github.com/trans/ruby.cr' },
    { name: 'arcana',  tag: 'An interface to AI',                        url: 'https://github.com/trans/arcana' },
    { name: 'bai',     tag: 'Ask an AI for the bash command you need',   url: 'https://github.com/trans/bai' },
    { name: 'ignore',  tag: 'Ignore-file parser and matcher',           url: 'https://github.com/trans/ignore' }
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

    var mode = box.getAttribute('data-mode') === 'one' ? 'one' : 'four';
    var perPage = mode === 'one' ? 1 : 4;
    box.className = 'ads-' + mode;

    var at = 0;
    function paint() {
      var html = '';
      for (var i = 0; i < perPage; i++) html += card(ADS[(at + i) % ADS.length]);
      box.style.opacity = '0';
      setTimeout(function () { box.innerHTML = html; box.style.opacity = '1'; }, 250);
    }

    paint();
    if (ADS.length > perPage) {
      setInterval(function () { at = (at + perPage) % ADS.length; paint(); }, INTERVAL);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
