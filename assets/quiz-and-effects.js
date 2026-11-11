// Đố vui có chấm điểm + pháo giấy, mô phỏng thủy triều Bạch Đằng, và nút gửi trái tim.
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Pháo giấy ----------
  var canvas = document.getElementById('confetti');
  var ctx = canvas.getContext('2d');
  var bits = [];
  var running = false;
  var colors = ['#e63946', '#ffb703', '#2a9d8f', '#219ebc', '#7b5cd6', '#ff8a5b'];
  function resize() { canvas.width = innerWidth * devicePixelRatio; canvas.height = innerHeight * devicePixelRatio; }
  resize();
  addEventListener('resize', resize);
  function burst(x, y, n) {
    if (reduceMotion) return;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 7;
      bits.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, r: 4 + Math.random() * 5, c: colors[i % colors.length], life: 90 + Math.random() * 40, rot: Math.random() * 6 });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  function tick() {
    var d = devicePixelRatio;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bits = bits.filter(function (b) { return b.life > 0; });
    bits.forEach(function (b) {
      b.vy += .25; b.vx *= .985; b.x += b.vx; b.y += b.vy; b.life--; b.rot += .2;
      ctx.save(); ctx.translate(b.x * d, b.y * d); ctx.rotate(b.rot);
      ctx.fillStyle = b.c; ctx.globalAlpha = Math.min(1, b.life / 30);
      ctx.fillRect(-b.r * d, -b.r * d / 2, b.r * 2 * d, b.r * d);
      ctx.restore();
    });
    if (bits.length) requestAnimationFrame(tick); else running = false;
  }

  // ---------- Đố vui ----------
  var cards = Array.prototype.slice.call(document.querySelectorAll('.qcard'));
  var solved = 0;
  var scoreEls = document.querySelectorAll('[data-score]');
  function renderScore() {
    scoreEls.forEach(function (el) {
      var stars = '';
      for (var i = 0; i < cards.length; i++) stars += '<span class="' + (i < solved ? 'on' : '') + '">★</span>';
      el.querySelector('.stars').innerHTML = stars;
      el.querySelector('.score-text').textContent = solved === cards.length
        ? 'Xuất sắc! Em đúng cả ' + solved + '/' + cards.length + ' câu 🏆'
        : 'Em đã đúng ' + solved + '/' + cards.length + ' câu';
    });
  }
  cards.forEach(function (card) {
    var answer = Number(card.dataset.answer);
    var fb = card.querySelector('.feedback');
    var opts = Array.prototype.slice.call(card.querySelectorAll('.opt'));
    opts.forEach(function (btn, i) {
      btn.addEventListener('click', function (e) {
        if (i === answer) {
          btn.classList.add('right');
          opts.forEach(function (o) { o.disabled = true; });
          fb.textContent = card.dataset.explain;
          fb.style.color = 'var(--mint)';
          solved++;
          renderScore();
          burst(e.clientX, e.clientY, solved === cards.length ? 160 : 70);
        } else {
          btn.classList.add('wrong');
          btn.disabled = true;
          fb.textContent = 'Chưa đúng rồi, em thử đáp án khác nhé!';
          fb.style.color = 'var(--red)';
        }
      });
    });
  });
  renderScore();

  // ---------- Thủy triều Bạch Đằng ----------
  var battle = document.getElementById('battle');
  var tideBtn = document.getElementById('tide');
  if (battle && tideBtn) {
    tideBtn.addEventListener('click', function () {
      var low = battle.classList.toggle('low');
      tideBtn.textContent = low ? '🌊 Cho nước triều lên lại' : '🌊 Cho nước triều rút';
      document.getElementById('tide-note').textContent = low
        ? 'Nước rút, cọc nhô lên. Thuyền giặc mắc cọc, vỡ tan!'
        : 'Nước triều lên che kín bãi cọc. Quân ta giả thua, nhử thuyền giặc tiến vào.';
    });
  }

  // ---------- Gửi trái tim ----------
  var KEY = 'thiep-ngo-quyen-tim';
  var hearts = 0;
  try { hearts = Number(localStorage.getItem(KEY)) || 0; } catch (e) {}
  var label = document.getElementById('heart-count');
  function showHearts() { if (hearts) label.textContent = 'Em đã gửi ' + hearts + ' trái tim tới thầy cô ♥'; }
  showHearts();
  document.getElementById('send-heart').addEventListener('click', function (e) {
    hearts++;
    try { localStorage.setItem(KEY, String(hearts)); } catch (err) {}
    showHearts();
    burst(e.clientX, e.clientY, 30);
    if (reduceMotion) return;
    var h = document.createElement('span');
    h.className = 'float-heart';
    h.textContent = ['❤️', '💖', '🌸', '⭐', '💐'][hearts % 5];
    h.style.left = (e.clientX - 15) + 'px';
    h.style.top = (e.clientY - 30) + 'px';
    document.body.appendChild(h);
    setTimeout(function () { h.remove(); }, 1600);
  });

  // Pháo giấy chào mừng khi tới slide cuối
  document.addEventListener('slidechange', function (e) {
    if (e.detail.slide.id === 'loi-ket') burst(innerWidth / 2, innerHeight / 3, 120);
  });
})();

// Tách lời hứa thành từng chữ để hiện dần khi tới slide cuối; tô đỏ các chữ quan trọng.
(function () {
  var el = document.getElementById('promise-text');
  if (!el) return;
  var keys = ['chăm', 'ngoan,', 'giỏi', 'Ngô', 'Quyền!'];
  var words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map(function (word, i) {
    var isKey = keys.indexOf(word) >= 0 || words[i + 1] === 'giỏi';
    var cls = isKey ? 'w key' : 'w';
    return '<span class="' + cls + '" style="--w:' + i + '">' + word + '</span>';
  }).join(' ');
})();
