/*
 * Work showcase interactions. Plain browser JavaScript, inlined by Showcase.astro.
 *   - cards ([data-showcase]): a spotlight that follows the pointer and a slight 3D tilt
 *   - filter ([data-filter]):  show only the case studies that use a given stack
 * Without it the cards are static and the full list is shown.
 */
(function () {
  'use strict';

  var cards = [].slice.call(document.querySelectorAll('[data-showcase]'));
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (finePointer) {
    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var box = card.getBoundingClientRect();
        var x = (event.clientX - box.left) / box.width;
        var y = (event.clientY - box.top) / box.height;
        card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        if (!reduceMotion) {
          card.style.setProperty('--rx', ((0.5 - y) * 2.4).toFixed(2) + 'deg');
          card.style.setProperty('--ry', ((x - 0.5) * 2.4).toFixed(2) + 'deg');
        }
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  var bar = document.querySelector('[data-filter]');
  if (!bar) return;
  var buttons = [].slice.call(bar.querySelectorAll('[data-filter-value]'));
  var count = document.querySelector('[data-filter-count]');
  /* The sentence comes from the page so it can be translated: "showing {shown} of {total}". */
  var template = bar.getAttribute('data-count') || 'showing {shown} of {total}';

  function apply(value) {
    var shown = 0;
    cards.forEach(function (card) {
      var stack = (card.getAttribute('data-stack') || '').split('|');
      var match = value === '*' || stack.indexOf(value) !== -1;
      card.hidden = !match;
      if (match) shown += 1;
    });
    buttons.forEach(function (button) {
      button.setAttribute('aria-pressed', button.getAttribute('data-filter-value') === value ? 'true' : 'false');
    });
    if (count) count.textContent = template.replace('{shown}', shown).replace('{total}', cards.length);
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      apply(button.getAttribute('data-filter-value'));
    });
  });
  bar.hidden = false;
  apply('*');
})();
