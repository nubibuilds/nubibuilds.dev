/*
 * Progressive enhancement for rendered Markdown (`.prose`).
 * Plain browser JavaScript, inlined right after the content by ProseEnhance.astro so it
 * runs before first paint. Everything degrades to readable static HTML without it.
 *
 *   - callouts        > [!NOTE] / [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION] / [!DANGER]
 *   - heading anchors  a "#" link after every h2/h3 that has an id
 *   - code blocks      frame + copy button
 *   - code tabs        <div class="code-tabs"> around several fenced blocks
 *   - tables           wide tables can be focused and scrolled with the arrow keys
 *   - task lists       each checkbox is named after its item
 *   - images           caption from the title, click to zoom
 *   - contents         highlights the section being read
 */
(function () {
  'use strict';

  var proses = document.querySelectorAll('.prose');

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    for (var key in attrs || {}) node.setAttribute(key, attrs[key]);
    if (text) node.textContent = text;
    return node;
  }

  /* One visually hidden live region for short status messages (for example "copied"). */
  var live;
  function announce(message) {
    if (!live) {
      live = el('div', { class: 'sr-only', role: 'status', 'aria-live': 'polite' });
      document.body.append(live);
    }
    live.textContent = '';
    window.setTimeout(function () {
      live.textContent = message;
    }, 50);
  }

  /* ---------- callouts ---------- */
  var CALLOUTS = {
    NOTE: ['note', 'i'],
    TIP: ['tip', '*'],
    IMPORTANT: ['important', '!'],
    WARNING: ['warning', '!'],
    CAUTION: ['caution', 'x'],
    DANGER: ['danger', 'x'],
  };

  function callouts(prose) {
    prose.querySelectorAll('blockquote').forEach(function (quote) {
      var first = quote.firstElementChild;
      if (!first || first.tagName !== 'P') return;
      var text = first.firstChild;
      if (!text || text.nodeType !== Node.TEXT_NODE) return;
      var match = /^\s*\[!([A-Za-z]+)\]\s*/.exec(text.nodeValue);
      var kind = match && CALLOUTS[match[1].toUpperCase()];
      if (!kind) return;

      text.nodeValue = text.nodeValue.slice(match[0].length);
      if (!text.nodeValue && text.nextSibling && text.nextSibling.nodeName === 'BR') text.nextSibling.remove();
      if (!first.textContent.trim() && !first.children.length) first.remove();

      quote.classList.add('callout', 'callout-' + kind[0]);
      quote.setAttribute('role', 'note');
      quote.prepend(el('p', { class: 'callout-title', 'data-icon': kind[1] }, match[1].toUpperCase()));
    });
  }

  /* ---------- heading anchors ---------- */
  function anchors(prose) {
    prose.querySelectorAll('h2[id], h3[id]').forEach(function (heading) {
      if (heading.closest('.footnotes, [data-footnotes]') || heading.querySelector('.anchor')) return;
      var label = 'Link to section: ' + heading.textContent.trim();
      heading.append(el('a', { class: 'anchor', href: '#' + heading.id, 'aria-label': label }, '#'));
    });
  }

  /* ---------- code blocks: frame + copy ---------- */
  function codeBlocks(prose) {
    prose.querySelectorAll('pre.astro-code').forEach(function (pre) {
      if (pre.parentElement.classList.contains('code-frame')) return;
      var frame = el('div', { class: 'code-frame' });
      pre.replaceWith(frame);
      frame.append(pre);

      var button = el('button', { type: 'button', class: 'code-copy', 'aria-label': 'Copy code to clipboard' }, '[ copy ]');
      button.addEventListener('click', function () {
        var code = pre.querySelector('code');
        var done = function (state, label) {
          button.dataset.state = state;
          button.textContent = label;
          /* The visible label changes, so the accessible name and a polite announcement follow it. */
          button.setAttribute('aria-label', state === 'copied' ? 'Copied to clipboard' : 'Copy failed');
          announce(state === 'copied' ? 'Code copied to clipboard' : 'Copying failed');
          window.setTimeout(function () {
            button.dataset.state = '';
            button.textContent = '[ copy ]';
            button.setAttribute('aria-label', 'Copy code to clipboard');
          }, 1600);
        };
        if (!navigator.clipboard) return done('failed', '[ failed ]');
        navigator.clipboard.writeText(code ? code.innerText : '').then(
          function () {
            done('copied', '[ copied ]');
          },
          function () {
            done('failed', '[ failed ]');
          },
        );
      });
      frame.append(button);
    });
  }

  /* ---------- code tabs ---------- */
  var TAB_KEY = 'code-tab';
  var groups = [];

  function savedTab() {
    try {
      return localStorage.getItem(TAB_KEY);
    } catch (e) {
      return null;
    }
  }

  function selectTab(group, index, focus) {
    group.tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
      group.panels[i].hidden = !on;
      if (on && focus) tab.focus();
    });
  }

  /* Picking "pnpm" in one group switches every group that has a "pnpm" tab. */
  function selectLabel(label, origin) {
    groups.forEach(function (group) {
      var index = group.labels.indexOf(label);
      if (index !== -1) selectTab(group, index, group === origin);
    });
    try {
      localStorage.setItem(TAB_KEY, label);
    } catch (e) {}
  }

  function codeTabs(prose) {
    prose.querySelectorAll('.code-tabs').forEach(function (box, boxIndex) {
      var panels = [].slice.call(box.children).filter(function (child) {
        return child.classList.contains('code-frame');
      });
      if (panels.length < 2) return;

      var list = el('div', { class: 'code-tablist', role: 'tablist', 'aria-label': 'Code variants' });
      var group = { tabs: [], panels: panels, labels: [] };

      panels.forEach(function (panel, i) {
        var pre = panel.querySelector('pre');
        var label = pre.dataset.title || pre.dataset.language || 'code ' + (i + 1);
        var id = 'code-tabs-' + boxIndex + '-' + i;
        var tab = el('button', { type: 'button', class: 'code-tab', role: 'tab', id: id + '-tab', 'aria-controls': id }, label);
        panel.id = id;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', id + '-tab');
        /* The tab already names the block, so the strip shows only the language. */
        pre.removeAttribute('data-title');

        tab.addEventListener('click', function () {
          selectLabel(label, group);
        });
        tab.addEventListener('keydown', function (event) {
          var step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
          var edge = event.key === 'Home' ? 0 : event.key === 'End' ? panels.length - 1 : -1;
          if (!step && edge === -1) return;
          event.preventDefault();
          var next = edge !== -1 ? edge : (i + step + panels.length) % panels.length;
          selectLabel(group.labels[next], group);
        });

        group.tabs.push(tab);
        group.labels.push(label);
        list.append(tab);
      });

      box.prepend(list);
      box.classList.add('is-ready');
      groups.push(group);

      var start = group.labels.indexOf(savedTab());
      selectTab(group, start === -1 ? 0 : start, false);
    });
  }

  /* ---------- wide tables: scrollable with the keyboard ---------- */
  function tables(prose) {
    var list = [].slice.call(prose.querySelectorAll('table'));
    if (!list.length) return;
    function update() {
      list.forEach(function (table) {
        if (table.scrollWidth > table.clientWidth + 1) table.tabIndex = 0;
        else table.removeAttribute('tabindex');
      });
    }
    update();
    window.addEventListener('resize', update, { passive: true });
  }

  /* ---------- task lists: name each checkbox after its item ---------- */
  /* GFM renders `- [x] item` as a bare, disabled checkbox; without a name a screen reader
     announces only "checkbox, checked". */
  function taskLists(prose) {
    prose.querySelectorAll('li > input[type="checkbox"], li > p > input[type="checkbox"]').forEach(function (box) {
      if (box.hasAttribute('aria-label')) return;
      var item = box.closest('li');
      var text = item ? item.textContent.replace(/\s+/g, ' ').trim() : '';
      if (text) box.setAttribute('aria-label', text);
    });
  }

  /* ---------- images: caption + zoom ---------- */
  var lightbox;
  var lightboxImage;

  function openLightbox(img) {
    if (!lightbox) {
      lightbox = el('dialog', { class: 'lightbox', 'aria-label': 'Image preview' });
      var close = el('button', { type: 'button', class: 'lightbox-close' }, '[ close ]');
      lightboxImage = el('img', { alt: '' });
      close.addEventListener('click', function () {
        lightbox.close();
      });
      lightbox.addEventListener('click', function (event) {
        if (event.target !== close) lightbox.close();
      });
      lightbox.append(close, lightboxImage);
      document.body.append(lightbox);
    }
    lightboxImage.removeAttribute('srcset');
    lightboxImage.src = img.currentSrc || img.src;
    if (img.srcset) {
      lightboxImage.sizes = '100vw';
      lightboxImage.srcset = img.srcset;
    }
    lightboxImage.alt = img.alt;
    lightbox.showModal();
  }

  function figures(prose) {
    if (!window.HTMLDialogElement) return;
    prose.querySelectorAll('img').forEach(function (img) {
      if (img.closest('a, button, figure')) return;
      var parent = img.parentElement;
      var alone = parent.tagName === 'P' && parent.children.length === 1 && !parent.textContent.trim();
      var figure = el('figure', { class: 'figure' });
      var button = el('button', { type: 'button', class: 'zoom', 'aria-label': 'Zoom image' + (img.alt ? ': ' + img.alt : '') });

      (alone ? parent : img).replaceWith(figure);
      button.append(img);
      figure.append(button);
      if (img.title) {
        figure.append(el('figcaption', null, img.title));
        img.removeAttribute('title');
      }
      button.addEventListener('click', function () {
        openLightbox(img);
      });
    });
  }

  /* ---------- contents: open on wide screens, mark the current section ---------- */
  function contents() {
    var details = document.querySelector('details[data-toc]');
    if (details && window.matchMedia('(min-width: 1100px)').matches) details.open = true;

    var links = [].slice.call(document.querySelectorAll('[data-toc] a[href^="#"]'));
    var targets = links
      .map(function (link) {
        return document.getElementById(decodeURIComponent(link.getAttribute('href').slice(1)));
      })
      .filter(Boolean);
    if (!targets.length) return;

    var ticking = false;
    function update() {
      ticking = false;
      var current = targets[0];
      targets.forEach(function (target) {
        if (target.getBoundingClientRect().top <= 140) current = target;
      });
      links.forEach(function (link) {
        var on = link.getAttribute('href') === '#' + current.id;
        if (on) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    update();
  }

  proses.forEach(function (prose) {
    callouts(prose);
    anchors(prose);
    codeBlocks(prose);
    codeTabs(prose);
    tables(prose);
    taskLists(prose);
    figures(prose);
  });
  contents();
})();
