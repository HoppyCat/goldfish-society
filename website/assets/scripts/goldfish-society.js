// expand/collapse all
  (function () {
    const all = document.querySelectorAll('.article');
    const ex = document.getElementById('expandAll');
    const co = document.getElementById('collapseAll');
    ex && ex.addEventListener('click', () => all.forEach(a => a.open = true));
    co && co.addEventListener('click', () => all.forEach(a => a.open = false));

    // open from hash
    if (window.location.hash) {
      const el = document.querySelector(window.location.hash);
      if (el && el.tagName === 'DETAILS') el.open = true;
    }
    // and on any anchor click into an article
    document.querySelectorAll('a[href^="#art-"]').forEach(a => {
      a.addEventListener('click', () => {
        const el = document.querySelector(a.getAttribute('href'));
        if (el && el.tagName === 'DETAILS') el.open = true;
      });
    });
  })();
