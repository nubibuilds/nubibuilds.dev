/*
 * Wires up every <div data-search> on the page (see SearchBox.astro): as the visitor
 * types, matching entries are listed under the field. Uses window.nubiSearch, which is
 * defined later in the page, so it is only looked up when a search actually runs.
 */
(function () {
  'use strict';

  document.querySelectorAll('[data-search]:not([data-search-ready])').forEach(function (box) {
    box.setAttribute('data-search-ready', '');
    var input = box.querySelector('input');
    var list = box.querySelector('[data-search-results]');
    var status = box.querySelector('[data-search-status]');
    var timer;
    var run = 0;

    function render(results, query) {
      list.textContent = '';
      results.forEach(function (result) {
        var item = document.createElement('li');
        var link = document.createElement('a');
        link.className = 'row';
        link.href = result.url;
        var title = document.createElement('span');
        title.className = 'search-title';
        title.textContent = result.title;
        var text = document.createElement('span');
        text.className = 'search-snippet';
        text.textContent = result.snippet;
        link.append(title, text);
        item.append(link);
        list.append(item);
      });
      list.hidden = !results.length;
      status.hidden = false;
      status.textContent = results.length ? results.length + (box.dataset.found || ' found') : (box.dataset.empty || 'No matches for') + ' "' + query + '"';
    }

    function search() {
      var query = input.value.trim();
      var id = ++run;
      if (!query || typeof window.nubiSearch !== 'function') {
        list.hidden = true;
        status.hidden = true;
        return;
      }
      window.nubiSearch(query, { kind: box.dataset.kind || undefined, lang: box.dataset.lang || undefined }).then(function (results) {
        if (id === run) render(results, query);
      });
    }

    input.addEventListener('input', function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(search, 140);
    });
    box.hidden = false;
  });
})();
