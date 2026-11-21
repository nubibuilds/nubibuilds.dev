/*
 * Tiny client-side search. Plain browser JavaScript, inlined by SearchScript.astro.
 * Loads /search.json (built from the content collections) on first use and exposes
 *   window.nubiSearch(query, { kind?: 'work' | 'writing', lang?: 'en' | 'id', limit?: number })
 * which resolves to [{ title, url, kind, lang, summary, snippet }], best match first.
 * Every word in the query must appear somewhere in an entry for it to match.
 */
(function () {
  'use strict';

  var index;

  function load() {
    if (!index) {
      index = fetch('/search.json')
        .then(function (response) {
          return response.ok ? response.json() : [];
        })
        .catch(function () {
          return [];
        });
    }
    return index;
  }

  /* Lower-case and strip accents so "resume" finds "résumé". */
  function fold(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }

  function snippet(item, term) {
    var body = item.body || '';
    var at = fold(body).indexOf(term);
    if (at === -1) return item.summary || '';
    var start = Math.max(0, at - 60);
    var end = Math.min(body.length, at + term.length + 80);
    return (start > 0 ? '…' : '') + body.slice(start, end).trim() + (end < body.length ? '…' : '');
  }

  window.nubiSearch = function (query, options) {
    var opts = options || {};
    var terms = fold(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return Promise.resolve([]);

    return load().then(function (items) {
      var results = [];
      items.forEach(function (item) {
        if (opts.kind && item.kind !== opts.kind) return;
        if (opts.lang && item.lang && item.lang !== opts.lang) return;

        var title = fold(item.title);
        var tags = fold((item.tags || []).join(' '));
        var summary = fold(item.summary);
        var body = fold(item.body);
        var score = 0;

        for (var i = 0; i < terms.length; i++) {
          var term = terms[i];
          var hit = (title.indexOf(term) !== -1 ? 8 : 0) + (tags.indexOf(term) !== -1 ? 4 : 0) + (summary.indexOf(term) !== -1 ? 3 : 0) + (body.indexOf(term) !== -1 ? 1 : 0);
          if (!hit) return;
          score += hit;
        }

        results.push({
          score: score,
          title: item.title,
          url: item.url,
          kind: item.kind,
          lang: item.lang || '',
          summary: item.summary || '',
          snippet: snippet(item, terms[0]),
        });
      });

      results.sort(function (a, b) {
        return b.score - a.score;
      });
      return results.slice(0, opts.limit || 10);
    });
  };
})();
