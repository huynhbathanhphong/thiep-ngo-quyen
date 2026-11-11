// Điều hướng trình chiếu: nút qua lại, chấm tiến độ, chương mục, phím mũi tên, vuốt, và #s3 trên địa chỉ.
(function () {
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var prev = document.getElementById('prev');
  var next = document.getElementById('next');
  var counter = document.getElementById('counter');
  var dotsBox = document.getElementById('dots');
  var chaptersBox = document.getElementById('chapters');
  var bar = document.getElementById('progress');
  var current = -1;

  // Chấm tiến độ
  var dots = slides.map(function (s, i) {
    var b = document.createElement('button');
    b.className = 'dot';
    b.type = 'button';
    b.setAttribute('aria-label', 'Đến slide ' + (i + 1) + ': ' + (s.getAttribute('aria-label') || ''));
    b.addEventListener('click', function () { go(i); });
    dotsBox.appendChild(b);
    return b;
  });

  // Chương mục: lấy từ data-chapter của slide đầu tiên trong mỗi chương
  var chapters = [];
  slides.forEach(function (s, i) {
    var name = s.dataset.chapter;
    if (!chapters.length || chapters[chapters.length - 1].name !== name) chapters.push({ name: name, start: i });
  });
  var chapterBtns = chapters.map(function (c) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = c.name;
    b.addEventListener('click', function () { go(c.start); });
    chaptersBox.appendChild(b);
    return b;
  });

  function go(i, fromHash) {
    if (i < 0 || i >= slides.length || i === current) return;
    var dir = i > current ? 1 : -1;
    slides.forEach(function (s) { s.style.setProperty('--dir', dir); });
    if (current >= 0) {
      slides[current].classList.remove('is-active');
      slides[current].setAttribute('aria-hidden', 'true');
    }
    current = i;
    var s = slides[i];
    s.classList.add('is-active');
    s.removeAttribute('aria-hidden');
    s.scrollTop = 0;
    document.body.style.background = getComputedStyle(s).getPropertyValue('--bg') || '';

    counter.textContent = (i + 1) + ' / ' + slides.length;
    prev.disabled = i === 0;
    next.disabled = i === slides.length - 1;
    bar.style.width = ((i + 1) / slides.length * 100) + '%';
    dots.forEach(function (d, k) { d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    chapterBtns.forEach(function (b, k) {
      var on = s.dataset.chapter === chapters[k].name;
      b.setAttribute('aria-current', on ? 'true' : 'false');
      if (on && b.scrollIntoView) b.scrollIntoView({ block: 'nearest', inline: 'center' });
    });
    if (!fromHash && history.replaceState) history.replaceState(null, '', '#s' + (i + 1));
    document.dispatchEvent(new CustomEvent('slidechange', { detail: { index: i, slide: s } }));
  }

  prev.addEventListener('click', function () { go(current - 1); });
  next.addEventListener('click', function () { go(current + 1); });
  document.querySelectorAll('[data-go]').forEach(function (el) {
    el.addEventListener('click', function () { go(Number(el.dataset.go)); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input, textarea')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(current + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(current - 1); }
    if (e.key === 'Home') go(0);
    if (e.key === 'End') go(slides.length - 1);
  });

  // Vuốt trên điện thoại (chỉ vuốt ngang rõ ràng mới chuyển slide)
  var sx = 0, sy = 0;
  document.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - sx;
    var dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(current + (dx < 0 ? 1 : -1));
  }, { passive: true });

  function fromHash() {
    var m = /^#s(\d+)$/.exec(location.hash);
    return m ? Math.min(Math.max(Number(m[1]) - 1, 0), slides.length - 1) : 0;
  }
  window.addEventListener('hashchange', function () { go(fromHash(), true); });
  go(fromHash(), true);
})();
