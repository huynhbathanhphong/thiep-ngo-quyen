// Slide 8: dòng thời gian dấu mốc. Bấm năm hoặc nút Mốc trước / Mốc tiếp để xem từng mốc.
(function () {
  var root = document.getElementById('milestones');
  if (!root) return;
  var years = Array.prototype.slice.call(root.querySelectorAll('.mile-year'));
  var cards = Array.prototype.slice.call(root.querySelectorAll('.mile-card'));
  var fill = document.getElementById('mile-fill');
  var count = document.getElementById('mile-count');
  var prev = document.getElementById('mile-prev');
  var next = document.getElementById('mile-next');
  var current = 0;

  function show(i, animate) {
    if (i < 0 || i >= cards.length) return;
    current = i;
    cards.forEach(function (card, k) {
      card.hidden = k !== i;
      card.classList.toggle('enter', animate !== false && k === i);
    });
    years.forEach(function (btn, k) {
      btn.setAttribute('aria-selected', k === i ? 'true' : 'false');
      btn.classList.toggle('passed', k < i);
    });
    fill.style.width = (i / (cards.length - 1) * 100) + '%';
    count.textContent = (i + 1) + ' / ' + cards.length;
    prev.disabled = i === 0;
    next.textContent = i === cards.length - 1 ? '↺ Xem lại từ đầu' : 'Mốc tiếp ›';
    if (animate !== false && years[i].scrollIntoView) years[i].scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  years.forEach(function (btn, i) { btn.addEventListener('click', function () { show(i); }); });
  prev.addEventListener('click', function () { show(current - 1); });
  next.addEventListener('click', function () { show(current === cards.length - 1 ? 0 : current + 1); });
  show(0, false);
})();
