/*
 * Interactive terminal overlay. Plain browser JavaScript, inlined by Terminal.astro.
 * Open with the [ >_ ] button, Ctrl/Cmd+K, or the ` key. Type `help` for commands.
 * All output is built with textContent, so nothing typed is ever parsed as HTML.
 */
(function () {
  'use strict';

  var dialog = document.querySelector('[data-terminal]');
  var dataEl = document.querySelector('[data-terminal-data]');
  if (!dialog || !dataEl || typeof dialog.showModal !== 'function') return;

  var data;
  try {
    data = JSON.parse(dataEl.textContent);
  } catch (e) {
    return;
  }

  var out = dialog.querySelector('[data-terminal-out]');
  var form = dialog.querySelector('[data-terminal-form]');
  var input = dialog.querySelector('[data-terminal-input]');
  var pageLang = document.documentElement.lang === 'id' ? 'id' : 'en';
  var HISTORY_KEY = 'terminal-history';
  var history = [];
  try {
    history = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');
  } catch (e) {}
  var cursor = history.length;
  /* A single-key shortcut must be switchable off (WCAG 2.1.4): `keys off` does that. */
  var BACKTICK_KEY = 'terminal-backtick';
  var backtick = true;
  try {
    backtick = localStorage.getItem(BACKTICK_KEY) !== 'off';
  } catch (e) {}
  var greeted = false;

  /* ---------- output ---------- */
  function line(text, className) {
    var node = document.createElement('div');
    node.className = 'term-line' + (className ? ' ' + className : '');
    node.textContent = text;
    out.append(node);
    return node;
  }

  function linkLine(label, href, note) {
    var node = line('', 'term-row');
    var link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    node.append(link);
    if (note) {
      var span = document.createElement('span');
      span.className = 'term-dim';
      span.textContent = '  ' + note;
      node.append(span);
    }
    return node;
  }

  function scrollDown() {
    out.scrollTop = out.scrollHeight;
  }

  /* ---------- lookups ---------- */
  function clean(target) {
    return (target || '')
      .replace(/^(\.\/|~\/|\/)+/, '')
      .replace(/\/+$/, '')
      .replace(/\.md$/, '')
      .toLowerCase();
  }

  function posts(lang) {
    return data.writing.filter(function (post) {
      return post.lang === lang;
    });
  }

  /* Work and writing exist in both languages: from an Indonesian page, stay in Indonesian. */
  function pageUrl(page) {
    return page.dir && pageLang !== 'en' ? '/' + pageLang + page.url : page.url;
  }

  /* Case studies in one language. */
  function works(lang) {
    return data.work.filter(function (item) {
      return item.lang === lang;
    });
  }

  /* Turn "work", "writing/my-post", "my-project" … into something with a URL. */
  function resolve(target) {
    var name = clean(target);
    if (!name || name === '~' || name === 'home') return { url: '/', title: 'home', summary: data.site.tagline };

    for (var i = 0; i < data.pages.length; i++) {
      if (data.pages[i].name === name) return { url: pageUrl(data.pages[i]), title: name, summary: data.pages[i].about };
    }

    var slug = name.replace(/^(work|writing)\//, '');
    var wantWriting = name.indexOf('writing/') === 0;
    var wantWork = name.indexOf('work/') === 0;

    if (!wantWriting) {
      /* The page's language first, then any language. */
      var cases = works(pageLang).concat(data.work);
      for (var w = 0; w < cases.length; w++) {
        if (cases[w].slug === slug) return cases[w];
      }
    }
    if (!wantWork) {
      var pool = posts(pageLang).concat(data.writing);
      for (var p = 0; p < pool.length; p++) {
        if (pool[p].slug === slug) return pool[p];
      }
    }
    return null;
  }

  function targets() {
    var names = data.pages.map(function (page) {
      return page.name;
    });
    works(pageLang).forEach(function (item) {
      names.push('work/' + item.slug);
    });
    posts(pageLang).forEach(function (item) {
      names.push('writing/' + item.slug);
    });
    return names;
  }

  function go(url) {
    line('→ ' + url, 'term-dim');
    window.location.assign(url);
  }

  /* ---------- commands ---------- */
  var HELP = [
    ['help', 'show this list'],
    ['ls [work|writing]', 'list pages, case studies or articles'],
    ['cd <page>', 'go to a page: cd work, cd writing/<slug>, cd ~'],
    ['cat <name>', 'print a summary: cat about, cat work/<slug>'],
    ['open <name>', 'same as cd'],
    ['grep <words>', 'search case studies and articles'],
    ['whoami', 'who built this'],
    ['contact', 'how to reach me'],
    ['theme [dark|light]', 'switch colour theme'],
    ['lang [en|id]', 'switch this page between English and Indonesian'],
    ['keys [on|off]', 'turn the ` shortcut that opens this terminal on or off'],
    ['history', 'commands typed this session'],
    ['clear', 'clear the screen'],
    ['exit', 'close the terminal'],
  ];

  var commands = {
    help: function () {
      HELP.forEach(function (row) {
        var node = line('', 'term-row');
        var name = document.createElement('span');
        name.className = 'term-key';
        name.textContent = row[0];
        var about = document.createElement('span');
        about.className = 'term-dim';
        about.textContent = row[1];
        node.append(name, about);
      });
      line('Tab completes what you typed · ↑ ↓ recalls · Esc closes', 'term-dim');
      line('With an empty prompt, Tab and Shift+Tab move to the links and buttons.', 'term-dim');
    },

    ls: function (args) {
      var dir = clean(args[0]);
      if (!dir || dir === '~' || dir === '.') {
        data.pages.forEach(function (page) {
          linkLine(page.name + (page.dir ? '/' : ''), pageUrl(page), page.about);
        });
        return;
      }
      if (dir === 'work') {
        var cases = works(args.indexOf('--id') !== -1 ? 'id' : args.indexOf('--en') !== -1 ? 'en' : pageLang);
        if (!cases.length) return line('total 0');
        cases.forEach(function (item) {
          linkLine('work/' + item.slug, item.url, item.title);
        });
        return;
      }
      if (dir === 'writing') {
        var list = posts(args.indexOf('--id') !== -1 ? 'id' : args.indexOf('--en') !== -1 ? 'en' : pageLang);
        if (!list.length) return line('total 0');
        list.forEach(function (item) {
          linkLine('writing/' + item.slug, item.url, item.date + '  ' + item.title);
        });
        return;
      }
      line('ls: ' + args[0] + ': no such directory', 'term-err');
    },

    cd: function (args) {
      var found = resolve(args[0]);
      if (!found) return line('cd: ' + args[0] + ': no such file or directory', 'term-err');
      go(found.url);
    },

    cat: function (args) {
      if (!args.length) return line('usage: cat <name>', 'term-err');
      var found = resolve(args[0]);
      if (!found) return line('cat: ' + args[0] + ': no such file or directory', 'term-err');
      line(found.title, 'term-hi');
      if (found.summary) line(found.summary);
      linkLine('open ' + found.url, found.url);
    },

    grep: function (args) {
      var query = args.join(' ').trim();
      if (!query) return line('usage: grep <words>', 'term-err');
      if (typeof window.nubiSearch !== 'function') return line('grep: search is not available on this page', 'term-err');
      var pending = line('searching…', 'term-dim');
      window.nubiSearch(query, { limit: 8 }).then(function (results) {
        pending.remove();
        if (!results.length) line('no matches for "' + query + '"', 'term-dim');
        results.forEach(function (result) {
          linkLine(result.title, result.url, result.kind + (result.lang ? ' · ' + result.lang : ''));
        });
        scrollDown();
      });
    },

    whoami: function () {
      line(data.site.name + ' — ' + data.site.role, 'term-hi');
      line(data.site.tagline);
      line(data.site.motto, 'term-dim');
    },

    contact: function () {
      if (!data.site.links.length) {
        line('No links configured yet.', 'term-dim');
      }
      data.site.links.forEach(function (item) {
        linkLine(item.label, item.href, item.text);
      });
      linkLine('contact', '/#contact', 'the contact section');
    },

    theme: function (args) {
      var root = document.documentElement;
      var system = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      var current = root.dataset.theme || system;
      var next = args[0] === 'dark' || args[0] === 'light' ? args[0] : current === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try {
        localStorage.setItem('theme', next);
      } catch (e) {}
      line('theme: ' + next);
    },

    lang: function (args) {
      var links = [].slice.call(document.querySelectorAll('link[rel="alternate"][hreflang]')).filter(function (link) {
        return link.hreflang === 'en' || link.hreflang === 'id';
      });
      if (!args.length) {
        line('current: ' + pageLang);
        line(links.length ? 'available: ' + links.map(function (l) { return l.hreflang; }).join(', ') : 'this page has no translation', 'term-dim');
        return;
      }
      var wanted = links.filter(function (link) {
        return link.hreflang === args[0];
      })[0];
      if (!wanted) return line('lang: no "' + args[0] + '" version of this page', 'term-err');
      /* hreflang links are absolute and point at the production domain; stay on the current host. */
      var target = new URL(wanted.href, window.location.href);
      go(target.pathname + target.search);
    },

    pwd: function () {
      line('~' + (window.location.pathname === '/' ? '' : window.location.pathname.replace(/\/$/, '')));
    },

    date: function () {
      line(new Date().toString());
    },

    echo: function (args) {
      line(args.join(' '));
    },

    history: function () {
      history.forEach(function (entry, i) {
        line((i + 1 + '').padStart(3, ' ') + '  ' + entry);
      });
    },

    keys: function (args) {
      if (args[0] === 'on' || args[0] === 'off') {
        backtick = args[0] === 'on';
        try {
          localStorage.setItem(BACKTICK_KEY, args[0]);
        } catch (e) {}
      }
      line('` shortcut: ' + (backtick ? 'on' : 'off') + ' (Ctrl/Cmd+K always works)');
    },

    clear: function () {
      out.textContent = '';
    },

    exit: function () {
      dialog.close();
    },

    sudo: function () {
      line('nubi is not in the sudoers file. This incident will be reported.', 'term-err');
    },
  };
  commands.open = commands.cd;
  commands.search = commands.grep;
  commands.man = commands.help;

  function run(raw) {
    var text = raw.trim();
    var echo = line('', 'term-echo');
    var prompt = document.createElement('span');
    prompt.className = 'term-prompt';
    prompt.textContent = 'nubi:~$ ';
    echo.append(prompt, document.createTextNode(text));
    if (!text) return;

    history.push(text);
    if (history.length > 50) history.shift();
    cursor = history.length;
    try {
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {}

    var parts = text.split(/\s+/);
    var name = parts[0].toLowerCase();
    var command = Object.prototype.hasOwnProperty.call(commands, name) ? commands[name] : null;
    if (!command) return line('zsh: command not found: ' + parts[0] + ' — try `help`', 'term-err');
    command(parts.slice(1));
  }

  /* ---------- input ---------- */
  function complete() {
    var value = input.value;
    var parts = value.split(/\s+/);
    var last = parts[parts.length - 1].toLowerCase();
    var pool = parts.length === 1 ? Object.keys(commands) : parts[0] === 'ls' ? ['work', 'writing'] : targets();
    var matches = pool.filter(function (item) {
      return item.indexOf(last) === 0;
    });
    if (!matches.length) return;
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      input.value = parts.join(' ') + (parts.length === 1 ? ' ' : '');
      return;
    }
    /* Several candidates: fill in what they share, then list them. */
    var shared = matches[0];
    matches.forEach(function (item) {
      while (item.indexOf(shared) !== 0) shared = shared.slice(0, -1);
    });
    if (shared.length > last.length) {
      parts[parts.length - 1] = shared;
      input.value = parts.join(' ');
    }
    line(matches.join('   '), 'term-dim');
    scrollDown();
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    run(input.value);
    input.value = '';
    scrollDown();
  });

  input.addEventListener('keydown', function (event) {
    /* Tab completes only when there is something to complete; otherwise it moves focus as usual,
       so the output links and the close button stay reachable from the keyboard. */
    if (event.key === 'Tab' && !event.shiftKey && input.value.trim()) {
      event.preventDefault();
      complete();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (cursor > 0) input.value = history[--cursor];
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      cursor = Math.min(history.length, cursor + 1);
      input.value = history[cursor] || '';
    }
  });

  /* ---------- open / close ---------- */
  function open() {
    if (dialog.open) return;
    dialog.showModal();
    if (!greeted) {
      greeted = true;
      line(data.site.name + ' interactive shell. Type `help` to see what it can do.', 'term-dim');
    }
    input.focus();
  }

  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) dialog.close();
  });
  dialog.querySelector('[data-terminal-close]').addEventListener('click', function () {
    dialog.close();
  });

  document.querySelectorAll('[data-terminal-open]').forEach(function (button) {
    button.hidden = false;
    button.addEventListener('click', open);
  });

  document.addEventListener('keydown', function (event) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable;
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else open();
    } else if (backtick && event.key === '`' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      open();
    }
  });
})();
