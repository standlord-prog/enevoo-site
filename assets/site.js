/* enevoó: меню на телефоне, фильтры каталога, галерея карточки, окно с QR для компьютера */
(function () {
  var d = document;
  var burger = d.querySelector('.burger'), nav = d.querySelector('.nav');
  if (burger && nav) burger.addEventListener('click', function () {
    var o = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
  });

  /* второе фото плитки — только при наведении мышью (меньше запросов к хранилищу фото) */
  d.addEventListener('mouseover', function (e) {
    var t = e.target.closest && e.target.closest('.tile');
    if (!t) return;
    var h = t.querySelector('img[data-hover]');
    if (h) { h.src = h.getAttribute('data-hover'); h.removeAttribute('data-hover'); }
  });
  /* фото не загрузилось (обрыв связи) — одна повторная попытка через 1,5 с */
  d.addEventListener('error', function (e) {
    var i = e.target;
    if (i.tagName !== 'IMG' || i.dataset.retry || !i.src) return;
    i.dataset.retry = '1';
    var u = i.src;
    setTimeout(function () { i.src = ''; i.src = u; }, 1500);
  }, true);

  /* фильтры раздела: размер, цвет, сортировка; состояние — в адресе */
  var grid = d.querySelector('.grid[data-filter]');
  if (grid) {
    var tiles = [].slice.call(grid.children), cnt = d.querySelector('.flt .cnt'), empty = d.querySelector('.empty');
    var sizeBtns = [].slice.call(d.querySelectorAll('.sz button')), colorSel = d.getElementById('f-color'), sortSel = d.getElementById('f-sort');
    var q = new URLSearchParams(location.search);
    var sizes = (q.get('size') || '').split(',').filter(Boolean);
    sizeBtns.forEach(function (b) { b.setAttribute('aria-pressed', sizes.indexOf(b.dataset.v) > -1 ? 'true' : 'false'); });
    if (colorSel && q.get('color')) colorSel.value = q.get('color');
    if (sortSel && q.get('sort')) sortSel.value = q.get('sort');
    var apply = function () {
      var ss = sizeBtns.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.dataset.v; });
      var c = colorSel ? colorSel.value : '', n = 0;
      tiles.forEach(function (t) {
        var ok = (!c || t.dataset.color === c) && (!ss.length || ss.some(function (s) { return (' ' + t.dataset.sizes + ' ').indexOf(' ' + s + ' ') > -1; }));
        t.hidden = !ok; if (ok) n++;
      });
      var s = sortSel ? sortSel.value : '';
      var sorted = tiles.slice().sort(function (a, b) {
        if (s === 'asc') return a.dataset.price - b.dataset.price;
        if (s === 'desc') return b.dataset.price - a.dataset.price;
        return a.dataset.i - b.dataset.i;
      });
      sorted.forEach(function (t) { grid.appendChild(t); });
      if (cnt) cnt.textContent = 'найдено: ' + n;
      if (empty) empty.style.display = n ? 'none' : 'block';
      var p = new URLSearchParams();
      if (ss.length) p.set('size', ss.join(','));
      if (c) p.set('color', c);
      if (s) p.set('sort', s);
      var qs = p.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
    };
    sizeBtns.forEach(function (b) { b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); apply(); }); });
    colorSel && colorSel.addEventListener('change', apply);
    sortSel && sortSel.addEventListener('change', apply);
    var reset = d.getElementById('f-reset');
    reset && reset.addEventListener('click', function () { sizeBtns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); if (colorSel) colorSel.value = ''; if (sortSel) sortSel.value = ''; apply(); });
    apply();
  }

  /* галерея карточки: превью слева, листание пальцем, точки */
  var shots = d.querySelector('.shots');
  if (shots) {
    var th = [].slice.call(d.querySelectorAll('.thumbs button')), dots = [].slice.call(d.querySelectorAll('.dots i'));
    th.forEach(function (b, i) { b.addEventListener('click', function () { shots.scrollTo({ left: shots.clientWidth * i, behavior: 'smooth' }); }); });
    shots.addEventListener('scroll', function () {
      var i = Math.round(shots.scrollLeft / shots.clientWidth);
      th.forEach(function (b, k) { b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      dots.forEach(function (x, k) { x.classList.toggle('on', k === i); });
    }, { passive: true });
  }

  /* компьютер: Ozon Селект открывается только с телефона — показываем QR */
  var modal = d.querySelector('.modal');
  if (modal) {
    var desk = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    d.querySelectorAll('[data-select]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (!desk) return;
        e.preventDefault(); modal.classList.add('on');
      });
    });
    modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('.x')) modal.classList.remove('on'); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') modal.classList.remove('on'); });
  }

  /* Яндекс Метрика 113664779 — только на enevoo.com, после загрузки страницы (не тормозит показ), без Вебвизора */
  var YM = 113664779;
  if (/^(www\.)?enevoo\.com$/.test(location.hostname)) {
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = Date.now();
    window.ym(YM, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
    var go = function () { var s = d.createElement('script'); s.async = true; s.src = 'https://mc.yandex.ru/metrika/tag.js'; d.head.appendChild(s); };
    if (d.readyState === 'complete') go(); else window.addEventListener('load', go);
  }
  /* цель «переход в Ozon Селект»: кнопка «купить», размер, окно с QR */
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-select], a[href*="select.ozon.ru"], a[href*="se.ozon.ru"]');
    if (a && window.ym) window.ym(YM, 'reachGoal', 'ozon_select_click');
  }, true);
})();
