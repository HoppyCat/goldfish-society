// copy CA
  (function () {
    const btn = document.getElementById('copyCa');
    const flash = document.getElementById('copyFlash');
    const ca = 'AR5JGQTiy7WuKjt1f27knFBLUwoLPsRJdTeZodoJpump';
    function copy() {
      navigator.clipboard.writeText(ca).then(() => {
        flash.classList.add('show');
        btn.innerHTML = '<span class="glyph">âœ“</span> copied to clipboard';
        setTimeout(() => {
          flash.classList.remove('show');
          btn.innerHTML = '<span class="glyph">â–¸</span> copy CA';
        }, 1800);
      }).catch(() => {});
    }
    btn && btn.addEventListener('click', copy);
    const box = document.getElementById('caBox');
    box && box.addEventListener('click', copy);
  })();
