/* IRPWM Digital Edition — application script */
(function () {
'use strict';

/* ------------------------------------------------------------------ utilities */
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var main = $('#main'), side = $('#side'), tabs = $('#tabs');
var BASE = document.baseURI;
var store = {
  get: function (k, d) { try { var v = localStorage.getItem('irpwm.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set: function (k, v) { try { localStorage.setItem('irpwm.' + k, JSON.stringify(v)); } catch (e) {} }
};
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function strip(h) { return String(h || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim(); }
function roman(n) { var r = '', m = [[10, 'x'], [9, 'ix'], [5, 'v'], [4, 'iv'], [1, 'i']]; m.forEach(function (p) { while (n >= p[0]) { r += p[1]; n -= p[0]; } }); return r; }
function printed(pg) { return pg > 30 ? String(pg - 30) : '(' + roman(pg) + ')'; }
function pdfPage(v) {
  v = String(v).trim().replace(/[()]/g, '').toLowerCase();
  if (/^\d+$/.test(v)) return Math.min(532, Math.max(1, +v + 30));
  if (/^[ivxl]+$/.test(v)) { var map = { i: 1, v: 5, x: 10, l: 50 }, t = 0; for (var i = 0; i < v.length; i++) { var a = map[v[i]], b = map[v[i + 1]] || 0; t += a < b ? -a : a; } return Math.min(30, t); }
  return null;
}
var toastT;
function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 2200); }
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text).then(function () { toast('Copied to clipboard'); }, fallback);
  fallback();
  function fallback() { var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast('Copied to clipboard'); } catch (e) { toast('Copy not available'); } ta.remove(); }
}
var I = {
  home: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
  toc: '<path d="M4 5h16M4 10h16M4 15h10M4 20h10"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
  abbr: '<path d="M4 7V5h16v2M9 19h6M12 5v14"/>',
  annex: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  acs: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  saved: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  notes: '<path d="M12 3a7 7 0 0 0-4 12.7V18h8v-2.3A7 7 0 0 0 12 3z"/><path d="M9 21h6"/>',
  tools: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18h2M12 18h4"/>',
  set: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  page: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  chev: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="M12 4v12M6 11l6 6 6-6M5 20h14"/>',
  ext: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>'
};
function ic(n, extra) { return '<svg class="i' + (extra ? ' ' + extra : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + I[n] + '</svg>'; }

/* ------------------------------------------------------------------ data */
var IDX = null, CH = {}, PARA = {}, ANNEX = {}, ORDER = [];
function fetchJSON(u) { return fetch(new URL(u, BASE).href).then(function (r) { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }); }
function loadIndex() {
  return fetchJSON('data/index.json').then(function (j) {
    IDX = j;
    j.chapters.forEach(function (c) {
      ORDER.push(c.id);
      c.paras.forEach(function (p) { if (!PARA[p.n]) PARA[p.n] = { c: c.id, id: p.id, t: p.t, pg: p.pg }; });
      c.annex.forEach(function (a) { var k = annexKey(a.t); if (k && !ANNEX[k]) ANNEX[k] = { c: c.id, i: a.i, t: a.t, pg: a.pg }; });
    });
    return j;
  });
}
function annexKey(t) { var m = /Annexure\s*[–-]?\s*\(?\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*\(?\s*([A-Z])?\b/i.exec(t || ''); return m ? (m[1] + '/' + m[2] + (m[3] ? m[3].toUpperCase() : '')) : null; }
function loadCh(id) { if (CH[id]) return Promise.resolve(CH[id]); return fetchJSON('data/' + id + '.json').then(function (j) { CH[id] = j; return j; }); }
function chMeta(id) { return IDX.chapters.filter(function (c) { return c.id === id; })[0]; }
function frontMeta(id) { return IDX.front.filter(function (c) { return c.id === id; })[0]; }
function sectionTitle(id) { var c = chMeta(id); if (c) return 'Chapter ' + c.n + ' · ' + c.title; var f = frontMeta(id); return f ? f.title : id; }
function chapterOfPage(pg) {
  var hit = null;
  IDX.chapters.forEach(function (c) { if (pg >= c.pages[0] && pg <= c.pages[1]) hit = c.id; });
  if (!hit) IDX.front.forEach(function (f) { if (pg >= f.pages[0] && pg <= f.pages[1]) hit = f.id; });
  return hit;
}

/* ------------------------------------------------------------------ settings */
var S = store.get('settings', {});
function applySettings() {
  var r = document.documentElement;
  if (S.theme && S.theme !== 'system') r.setAttribute('data-theme', S.theme); else r.removeAttribute('data-theme');
  if (S.read === 'serif') r.setAttribute('data-read', 'serif'); else r.removeAttribute('data-read');
  r.setAttribute('data-amend', S.amend === 'off' ? 'off' : 'on');
  if (S.fs) r.style.setProperty('--fs', S.fs + 'px'); else r.style.removeProperty('--fs');
  var meta = $('meta[name="theme-color"]'); if (meta) meta.content = getComputedStyle(r).getPropertyValue('--navy').trim() || '#102542';
}
function saveSettings() { store.set('settings', S); applySettings(); }

/* ------------------------------------------------------------------ bookmarks / recent */
function getSaved() { return store.get('saved', []); }
function isSaved(key) { return getSaved().some(function (b) { return b.key === key; }); }
function toggleSaved(item) {
  var s = getSaved(), i = -1;
  s.forEach(function (b, j) { if (b.key === item.key) i = j; });
  if (i >= 0) { s.splice(i, 1); toast('Removed from Saved'); } else { item.ts = Date.now(); s.unshift(item); toast('Saved'); }
  store.set('saved', s); return i < 0;
}
function pushRecent(item) {
  var r = store.get('recent', []).filter(function (x) { return x.key !== item.key; });
  r.unshift(item); store.set('recent', r.slice(0, 8));
}

/* ------------------------------------------------------------------ text formatting & cross references */
var ACS_RE = /\(?\s*ACS\s*(?:No\.?)?\s*[–-]?\s*(\d{1,2})\s*\)?/g;
function fmt(h) {
  h = String(h || '');
  h = h.replace(ACS_RE, function (m, n) { return '<a class="acs" href="#/acs/' + n + '" title="Advance Correction Slip No. ' + n + '">ACS ' + n + '</a>'; });
  // Para cross references: "Para 408(2)", "Paras 303, 308 and 310"
  h = h.replace(/(Paras?\b\.?(?:\s|&nbsp;|<\/?(?:b|i|span|mark)\b[^>]*>)*)(\d{3,4}[A-Z]?(?:\s*\([0-9a-zA-Z]{1,4}\))*(?:(?:\s*,\s*|\s+(?:and|&amp;|to|or)\s+)(?:<\/?(?:b|i|span)\b[^>]*>)*\d{3,4}[A-Z]?(?:\s*\([0-9a-zA-Z]{1,4}\))*)*)/g, function (m, pre, nums) {
    return pre + nums.replace(/\b(\d{3,4})([A-Z]?)\b/g, function (mm, n, s) {
      var p = PARA[n]; return p ? '<a class="xref" href="#/c/' + p.c + '/' + p.id + '">' + n + s + '</a>' : mm;
    });
  });
  // Annexure cross references
  h = h.replace(/(Annexure(?:s)?\s*(?:<\/?(?:b|i|span|mark)\b[^>]*>|\s|&nbsp;)*[–-]?\s*(?:<\/?(?:b|i|span|mark)\b[^>]*>|\s)*)(\d{1,2}\s*\/\s*\d{1,2}(?:\s*\(?[A-Z]\)?(?![a-z]))?)/g, function (m, pre, ref) {
    var k = annexKey('Annexure ' + strip(ref)); var a = k && ANNEX[k];
    return a ? pre + '<a class="xref" href="#/c/' + a.c + '/b' + a.i + '">' + ref + '</a>' : m;
  });
  return h;
}

/* ------------------------------------------------------------------ PDF rendering (pdf.js) */
var pdfP = null, renderQ = [], rendering = 0, imgCache = {};
function getPdf() {
  if (!pdfP) {
    pdfP = import(new URL('vendor/pdf.min.js', BASE).href).then(function (lib) {
      lib.GlobalWorkerOptions.workerSrc = new URL('vendor/pdf.worker.min.js', BASE).href;
      return lib.getDocument({ url: new URL('irpwm.pdf', BASE).href, disableRange: true, disableStream: true, isEvalSupported: false,
        standardFontDataUrl: new URL('vendor/standard_fonts/', BASE).href }).promise;
    });
    pdfP.catch(function () { pdfP = null; });
  }
  return pdfP;
}
function renderRegion(pg, rect, cssW) {
  var key = pg + ':' + (rect ? rect.join(',') : 'p') + ':' + Math.round(cssW / 100);
  if (imgCache[key]) return Promise.resolve(imgCache[key]);
  return new Promise(function (resolve, reject) { renderQ.push({ pg: pg, rect: rect, cssW: cssW, key: key, ok: resolve, err: reject }); pump(); });
}
function pump() {
  while (rendering < 2 && renderQ.length) {
    var job = renderQ.shift(); rendering++;
    doRender(job).then(job.ok, job.err).then(function () { rendering--; pump(); });
  }
}
function doRender(job) {
  return getPdf().then(function (doc) { return doc.getPage(job.pg); }).then(function (page) {
    var v1 = page.getViewport({ scale: 1 });
    var r = job.rect || [0, 0, v1.width, v1.height];
    var dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    var scale = Math.min(4, Math.max(1, (job.cssW * dpr) / (r[2] - r[0])));
    var vp = page.getViewport({ scale: scale, offsetX: -r[0] * scale, offsetY: -r[1] * scale });
    var c = document.createElement('canvas');
    c.width = Math.ceil((r[2] - r[0]) * scale); c.height = Math.ceil((r[3] - r[1]) * scale);
    var ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
      return new Promise(function (res) { c.toBlob(function (b) { c.width = c.height = 0; res(b); }, job.rect ? 'image/png' : 'image/jpeg', .9); });
    }).then(function (blob) { var u = URL.createObjectURL(blob); imgCache[job.key] = u; return u; });
  });
}
var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
  es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); paintCv(e.target); } });
}, { rootMargin: '600px 0px' }) : null;
function paintCv(cv) {
  if (cv.dataset.done) return; cv.dataset.done = '1';
  var pg = +cv.dataset.pg, rect = cv.dataset.r ? cv.dataset.r.split(',').map(Number) : null;
  var w = Math.max(320, Math.min(cv.clientWidth || 800, 1400));
  renderRegion(pg, rect, w).then(function (u) {
    var img = new Image(); img.alt = rect ? 'Figure from page ' + printed(pg) : 'Page ' + printed(pg) + ' of the manual'; img.decoding = 'async'; img.src = u;
    img.onload = function () { cv.innerHTML = ''; cv.appendChild(img); };
  }, function () { var ph = $('.ph', cv); if (ph) ph.innerHTML = 'Could not render this page. <a href="#/page/' + pg + '">Open original page</a>'; cv.dataset.done = ''; });
}
function observeCanvases(root) { $$('.cv[data-pg]', root).forEach(function (cv) { if (io) io.observe(cv); else paintCv(cv); }); }

/* ------------------------------------------------------------------ navigation chrome */
function buildSide() {
  var h = '<h6>Manual</h6><div class="nav">' +
    navA('#/', 'home', 'Home') + navA('#/contents', 'toc', 'Contents') +
    navA('#/f/pref', 'book', 'Prefaces') + navA('#/f/abbr', 'abbr', 'Abbreviations & Terminology') + '</div>' +
    '<h6>Chapters</h6><div class="nav">';
  IDX.chapters.forEach(function (c) { h += '<a href="#/c/' + c.id + '" data-r="c/' + c.id + '"><span class="n">' + c.n + '</span><span>' + esc(c.title) + '</span></a>'; });
  h += '</div><h6>Reference</h6><div class="nav">' + navA('#/annexures', 'annex', 'Annexures') + navA('#/acs', 'acs', 'Correction Slips') +
    navA('#/search', 'search', 'Search') + navA('#/saved', 'saved', 'Saved') + '</div>' +
    '<h6>Companion</h6><div class="nav"><a href="companion.html#home">' + ic('notes') + '<span>Explanatory Notes</span></a><a href="companion.html#tools">' + ic('tools') + '<span>Field Calculators</span></a></div>' +
    '<h6>Application</h6><div class="nav">' + navA('#/settings', 'set', 'Settings') + navA('#/about', 'info', 'About this edition') + '</div>';
  side.innerHTML = h;
  function navA(href, icon, label) { return '<a href="' + href + '" data-r="' + href.slice(2) + '">' + ic(icon) + '<span>' + label + '</span></a>'; }
}
function markNav(r) {
  $$('a[data-r]', side).forEach(function (a) { var k = a.getAttribute('data-r'); a.classList.toggle('on', k === r || (k && r.indexOf(k + '/') === 0 && k.indexOf('c/') === 0)); });
  var tk = r === '' ? 'home' : /^(contents|c\/|f\/)/.test(r) ? 'contents' : /^search/.test(r) ? 'search' : r === 'saved' ? 'saved' : 'more';
  $$('a', tabs).forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-k') === tk); });
}
function closeNav() { document.body.classList.remove('nav-open'); }

/* ------------------------------------------------------------------ views */
function setTitle(t) { document.title = t ? t + ' — IRPWM' : 'IRPWM — Indian Railways Permanent Way Manual'; }
function viewHome() {
  var nParas = Object.keys(PARA).length, nAnnex = 0; IDX.chapters.forEach(function (c) { nAnnex += c.annex.length; });
  var rec = store.get('recent', []);
  var h = '<div class="wrap">' +
    '<section class="hero"><div class="eyebrow">Government of India · Ministry of Railways</div>' +
    '<h1>Indian Railways Permanent Way Manual</h1>' +
    '<p class="sub">2024 Reprint, incorporating Advance Correction Slips up to No. 16</p>' +
    '<p class="pub">Published by the Indian Railways Institute of Civil Engineering, Pune, for the Railway Board</p>' +
    '<form class="hs" id="heroSearch" role="search" autocomplete="off">' + ic('search') + '<input type="search" placeholder="Search the manual or enter a para no." aria-label="Search the manual"></form>' +
    '<div class="stats"><div><b>15</b><span>Chapters</span></div><div><b>' + nParas + '</b><span>Paras</span></div><div><b>' + nAnnex + '</b><span>Annexures</span></div><div><b>502</b><span>Pages</span></div></div>' +
    '<img class="seal" src="icons/icon-512.png" alt=""></section>' +
    '<div class="qgrid">' +
    qa('#/contents', 'toc', 'Contents', 'All chapters, parts and paras') +
    qa('#/annexures', 'annex', 'Annexures', 'Forms, drawings and tables') +
    qa('#/acs', 'acs', 'Correction Slips', 'Amendments ACS 1 to 16, located in the text') +
    qa('#/f/abbr', 'abbr', 'Abbreviations', 'Abbreviations and terminology') +
    qa('companion.html#home', 'notes', 'Explanatory Notes', 'Plain-language guidance by chapter') +
    qa('companion.html#tools', 'tools', 'Field Calculators', 'Cant, LWR, SEJ, TRC, TVU and more') +
    '</div>';
  if (rec.length) {
    h += '<div class="sec-h"><h2>Continue reading</h2></div><div class="recent">';
    rec.forEach(function (r) { h += '<a href="#/c/' + r.c + '/' + r.id + '"><b>' + esc(r.n ? 'Para ' + r.n : '') + '</b><span>' + esc(r.t).slice(0, 60) + '</span></a>'; });
    h += '</div>';
  }
  h += '<div class="sec-h"><h2>Chapters</h2><a href="#/contents">Full contents</a></div><div class="chlist">';
  IDX.chapters.forEach(function (c) {
    var pr = c.paras.length ? 'Paras ' + c.paras[0].n + '–' + c.paras[c.paras.length - 1].n : '';
    h += '<a class="chrow" href="#/c/' + c.id + '"><span class="no">' + c.n + '</span><span><b>' + esc(c.title) + '</b><span>' + pr + ' · Pages ' + printed(c.pages[0]) + '–' + printed(c.pages[1]) + (c.annex.length ? ' · ' + c.annex.length + ' annexures' : '') + '</span></span></a>';
  });
  h += '</div><div class="notice"><b>Note.</b> This digital edition reproduces the text of the IRPWM 2024 reprint. Text amended by correction slips is highlighted and tagged with its slip number. Where the layout matters (annexures, drawings, equations) the original page is shown. In case of any discrepancy, the printed manual and the latest Railway Board and RDSO instructions prevail.</div></div>';
  main.innerHTML = h; setTitle('');
  bindSearchForm($('#heroSearch'));
  function qa(href, icon, t, s) { return '<a class="qa" href="' + href + '"><span class="ic">' + ic(icon) + '</span><span><b>' + t + '</b><span>' + s + '</span></span></a>'; }
}
function viewContents() {
  var h = '<div class="wrap narrow"><div class="page-h"><div class="eyebrow">Indian Railways Permanent Way Manual</div><h1>Contents</h1><p>Select a chapter to see its parts and paras. Tap a para to open it.</p></div>';
  h += '<div class="list" style="margin-bottom:14px">' +
    '<a class="li" href="#/f/pref"><span class="tag">' + ic('book') + '</span><span class="tt"><b>Prefaces</b><span>Preface to the 2024 reprint and to the redrafted IRPWM (2020)</span></span><span class="pg">' + printed(5) + '</span></a>' +
    '<a class="li" href="#/f/abbr"><span class="tag">' + ic('abbr') + '</span><span class="tt"><b>Abbreviations and Terminology</b></span><span class="pg">' + printed(23) + '</span></a></div>';
  var open = store.get('tocOpen', []);
  IDX.chapters.forEach(function (c) {
    h += '<details class="toc-ch" data-c="' + c.id + '"' + (open.indexOf(c.id) >= 0 ? ' open' : '') + '><summary><span class="no"><small>Chapter</small><b>' + c.n + '</b></span><span><h3>' + esc(c.title) + '</h3><div class="meta">' + c.paras.length + ' paras · Pages ' + printed(c.pages[0]) + '–' + printed(c.pages[1]) + (c.annex.length ? ' · ' + c.annex.length + ' annexures' : '') + '</div></span>' + ic('chev', 'chev') + '</summary><div class="toc-body">' +
      '<a class="btn sm toc-open" href="#/c/' + c.id + '">Read Chapter ' + c.n + '</a>';
    c.paras.forEach(function (p) {
      c.parts.forEach(function (pt) { if (pt.first === p.n) h += '<div class="toc-part">' + esc(pt.t) + '<i>' + esc(pt.s) + '</i></div>'; });
      h += '<a class="toc-p" href="#/c/' + c.id + '/' + p.id + '"><b>' + esc(p.n) + '</b><span>' + esc(p.t || '—') + '</span><em>' + printed(p.pg) + '</em></a>';
    });
    if (c.annex.length) {
      h += '<div class="toc-part">Annexures</div>';
      c.annex.forEach(function (a) { h += '<a class="toc-p" href="#/c/' + c.id + '/b' + a.i + '"><b>' + esc(annexKey(a.t) || '') + '</b><span>' + esc(a.t) + '</span><em>' + printed(a.pg) + '</em></a>'; });
    }
    h += '</div></details>';
  });
  h += '</div>';
  main.innerHTML = h; setTitle('Contents');
  $$('details.toc-ch', main).forEach(function (d) {
    d.addEventListener('toggle', function () {
      var o = store.get('tocOpen', []).filter(function (x) { return x !== d.dataset.c; }); if (d.open) o.push(d.dataset.c); store.set('tocOpen', o);
    });
  });
}
/* --- reader --- */
var curRead = null, spyT = null;
function viewReader(id, anchor) {
  var meta = chMeta(id) || frontMeta(id);
  if (!meta) return viewNotFound();
  if (curRead === id && $('.doc', main)) { scrollToAnchor(anchor); return; }
  main.innerHTML = '<div class="wrap"><p class="muted">Loading…</p></div>';
  loadCh(id).then(function (data) {
    curRead = id;
    var isCh = !!chMeta(id);
    var h = '<div class="reader-grid"><article class="doc" id="doc">';
    h += '<header class="chap-h"><div class="eyebrow">' + (isCh ? 'Chapter ' + meta.n : 'Indian Railways Permanent Way Manual') + '</div><h1>' + esc(meta.title) + '</h1>' +
      '<div class="meta"><span class="chip">Pages ' + printed(meta.pages[0]) + '–' + printed(meta.pages[1]) + '</span>' + (isCh ? '<span class="chip">' + meta.paras.length + ' paras</span>' + (meta.annex.length ? '<span class="chip">' + meta.annex.length + ' annexures</span>' : '') : '') + '<a class="chip" href="#/page/' + meta.pages[0] + '">' + ic('page') + ' Original pages</a></div></header>';
    var inPara = false, lastAnnex = '';
    data.blocks.forEach(function (b, i) {
      if (b.k === 'part') {
        if (inPara) { h += '</section>'; inPara = false; }
        h += '<div class="part" id="' + b.id + '" data-pg="' + b.pg + '"><span class="eyebrow">' + esc(b.t) + '</span><h2>' + esc(b.s) + '</h2></div>';
      } else if (b.k === 'para') {
        if (inPara) h += '</section>';
        inPara = true;
        var key = id + '/' + b.id, title = b.h.replace(/\s*[–-]\s*(<\/b>)?\s*(<span class="bk">|$)/, '$1 $2');
        h += '<section class="para" id="' + b.id + '" data-n="' + esc(b.n) + '" data-pg="' + b.pg + '"><div class="para-h"><span class="pn">' + esc(b.n) + '</span><h3>' + fmt(title) + '</h3><div class="acts">' +
          '<button class="ib save' + (isSaved(key) ? ' on' : '') + '" data-key="' + key + '" aria-label="Save para ' + esc(b.n) + '" title="Save">' + ic('saved') + '</button>' +
          '<button class="ib cp" aria-label="Copy para ' + esc(b.n) + '" title="Copy text with citation">' + ic('copy') + '</button>' +
          '<a class="ib" href="#/page/' + b.pg + '" aria-label="Original page" title="Original page ' + printed(b.pg) + '">' + ic('page') + '</a></div></div>';
      } else if (b.k === 't') {
        var mk = b.h.indexOf('<span class="mk">') === 0, bh = b.h;
        if (/^\s*[–-]?\s*(<[^>]+>\s*)*\(?\s*<span class="bk">/.test(bh) && strip(bh).length < 60) {
          h += '<p class="b backref" id="b' + i + '" data-pg="' + b.pg + '">' + fmt(bh.replace(/^\s*[–-]\s*/, '')) + '</p>';
        } else
        h += '<p class="b l' + (b.l || 0) + (mk ? ' mk-row' : '') + (b.b ? ' bh' : '') + '" id="b' + i + '" data-pg="' + b.pg + '">' + fmt(bh) + '</p>';
      } else if (b.k === 'tbl') {
        h += '<div class="tbl" id="b' + i + '" data-pg="' + b.pg + '">' + fmt(b.h) + '</div><div class="src tbl-cap"><span>Table · page ' + printed(b.pg) + '</span><a href="#/page/' + b.pg + '">' + ic('page') + ' Original layout</a></div>';
      } else if (b.k === 'fig') {
        var w = b.r[2] - b.r[0], hh = b.r[3] - b.r[1];
        h += '<figure class="fig" id="b' + i + '" data-pg="' + b.pg + '"><div class="cv" data-pg="' + b.pg + '" data-r="' + b.r.join(',') + '" style="aspect-ratio:' + w + '/' + hh + ';max-width:' + Math.round(w * 1.45) + 'px"><div class="ph">Rendering…</div></div>' +
          '<figcaption class="src"><span>From page ' + printed(b.pg) + '</span><a href="#/page/' + b.pg + '">' + ic('page') + ' Original page</a></figcaption></figure>';
      } else if (b.k === 'page') {
        var t = b.t || (lastAnnex ? lastAnnex + ' (continued)' : 'Page ' + printed(b.pg));
        if (b.t) lastAnnex = b.t;
        h += '<section class="pgv" id="b' + i + '" data-pg="' + b.pg + '"><header><b>' + fmt(esc(t)) + '</b><span>Page ' + printed(b.pg) + ' · original layout</span></header>' +
          '<div class="cv" data-pg="' + b.pg + '" style="aspect-ratio:' + (b.pw || 595) + '/' + (b.ph || 842) + ';max-width:' + Math.round((b.pw || 595) * 1.6) + 'px"><div class="ph">Rendering page ' + printed(b.pg) + '…</div></div>' +
          (b.x ? '<details><summary>Text of this page (for copying)</summary><div>' + esc(b.x) + '</div></details>' : '') + '</section>';
      }
      if (b.k !== 'page') lastAnnex = b.k === 'page' ? lastAnnex : '';
    });
    if (inPara) h += '</section>';
    // previous / next
    var seq = ['pref', 'abbr'].concat(ORDER), k = seq.indexOf(id);
    h += '<nav class="chap-nav">' + (k > 0 ? '<a href="#/' + (seq[k - 1].charAt(0) === 'c' ? 'c/' : 'f/') + seq[k - 1] + '"><span>Previous</span><b>' + esc(sectionTitle(seq[k - 1])) + '</b></a>' : '') +
      (k < seq.length - 1 ? '<a class="nx" href="#/' + (seq[k + 1].charAt(0) === 'c' ? 'c/' : 'f/') + seq[k + 1] + '"><span>Next</span><b>' + esc(sectionTitle(seq[k + 1])) + '</b></a>' : '') + '</nav>';
    h += '</article>';
    if (isCh) {
      h += '<aside class="rail" aria-label="Paras in this chapter"><h6>In this chapter</h6>';
      meta.paras.forEach(function (p) { h += '<a href="#/c/' + id + '/' + p.id + '" data-p="' + p.id + '"><b>' + esc(p.n) + '</b><span>' + esc(p.t) + '</span></a>'; });
      if (meta.annex.length) { h += '<h6 style="margin-top:14px">Annexures</h6>'; meta.annex.forEach(function (a) { h += '<a href="#/c/' + id + '/b' + a.i + '"><b>' + esc(annexKey(a.t) || '') + '</b><span>' + esc(a.t.replace(/^Annexure\s*[–-]?\s*\(?\s*\d{1,2}\s*\/\s*\d{1,2}\s*(\(?[A-Z]\)(?=\s|$)|[A-Z](?=\s|$))?\s*/i, '').replace(/^\((Para.*)\)$/,'$1').trim() || a.t) + '</span></a>'; }); }
      h += '</aside>';
    }
    h += '</div>';
    main.innerHTML = h;
    setTitle(isCh ? 'Chapter ' + meta.n + ' · ' + meta.title : meta.title);
    observeCanvases(main);
    bindReader(id);
    scrollToAnchor(anchor);
  }, function (e) { main.innerHTML = '<div class="wrap"><div class="empty">Could not load this chapter. ' + esc(e.message) + '</div></div>'; });
}
function scrollToAnchor(anchor) {
  if (!anchor) { window.scrollTo(0, 0); return; }
  var el = null;
  if (/^pg\d+$/.test(anchor)) { var n = +anchor.slice(2); el = $$('[data-pg]', $('#doc')).filter(function (e) { return +e.dataset.pg >= n; })[0]; }
  else el = document.getElementById(anchor);
  if (!el) { window.scrollTo(0, 0); return; }
  requestAnimationFrame(function () {
    el.scrollIntoView({ block: 'start' });
    var target = el.classList.contains('para') ? $('.para-h', el) : el;
    target.classList.remove('flash'); void target.offsetWidth; target.classList.add('flash');
  });
}
function bindReader(id) {
  var doc = $('#doc');
  doc.addEventListener('click', function (e) {
    var sb = e.target.closest('.save');
    if (sb) {
      var sec = sb.closest('.para'), n = sec.dataset.n;
      var on = toggleSaved({ key: sb.dataset.key, c: id, id: sec.id, n: n, t: strip($('h3', sec).innerHTML).replace(/\(Back to.*$/, '').trim() });
      sb.classList.toggle('on', on); return;
    }
    var cb = e.target.closest('.cp');
    if (cb) {
      var s2 = cb.closest('.para'), parts = [];
      var title = strip($('h3', s2).innerHTML).replace(/\(Back to.*$/, '').trim();
      $$('.b, .tbl', s2).forEach(function (el) {
        if (el.classList.contains('tbl')) { $$('tr', el).forEach(function (tr) { parts.push($$('th,td', tr).map(function (td) { return td.innerText.trim(); }).join(' | ')); }); }
        else parts.push(el.innerText.trim());
      });
      copyText('Para ' + s2.dataset.n + ' – ' + title + '\n\n' + parts.join('\n') + '\n\n— Indian Railways Permanent Way Manual (2024 reprint, incorporating ACS up to No. 16), Para ' + s2.dataset.n + ', page ' + printed(+s2.dataset.pg) + '.');
    }
  });
  // scroll spy for the rail + reading position
  var rail = $('.rail', main);
  var paras = $$('.para', doc);
  function spy() {
    var top = (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--top-h')) || 60) + 90, cur = null;
    for (var i = 0; i < paras.length; i++) { if (paras[i].getBoundingClientRect().top <= top) cur = paras[i]; else break; }
    if (rail) {
      $$('a.on', rail).forEach(function (a) { a.classList.remove('on'); });
      if (cur) { var a = $('a[data-p="' + cur.id + '"]', rail); if (a) { a.classList.add('on'); var rr = rail.getBoundingClientRect(), ar = a.getBoundingClientRect(); if (ar.top < rr.top || ar.bottom > rr.bottom) rail.scrollTop += ar.top - rr.top - 80; } }
    }
    if (cur) pushRecent({ key: id + '/' + cur.id, c: id, id: cur.id, n: cur.dataset.n, t: strip($('h3', cur).innerHTML).replace(/\(Back to.*$/, '').trim() });
  }
  window.onscroll = function () { clearTimeout(spyT); spyT = setTimeout(spy, 120); };
}

/* --- annexures --- */
function viewAnnexures() {
  var h = '<div class="wrap narrow"><div class="page-h"><div class="eyebrow">Reference</div><h1>Annexures</h1><p>Every annexure is shown in its original layout, with its text available for search and copying.</p></div>';
  IDX.chapters.forEach(function (c) {
    if (!c.annex.length) return;
    h += '<div class="grp-h">Chapter ' + c.n + ' · ' + esc(c.title) + '</div><div class="list">';
    c.annex.forEach(function (a) {
      var k = annexKey(a.t), rest = a.t.replace(/^Annexure\s*[–-]?\s*\(?\s*\d{1,2}\s*\/\s*\d{1,2}\s*(\(?[A-Z]\)?)?\.?\s*/i, '').trim();
      h += '<a class="li" href="#/c/' + c.id + '/b' + a.i + '"><span class="tag">' + esc(k ? 'Annex ' + k : 'Annexure') + '</span><span class="tt"><b>' + esc(a.t) + '</b>' + (rest && rest !== a.t ? '' : '') + '</span><span class="pg">' + (a.pg2 > a.pg ? 'pp. ' + printed(a.pg) + '–' + printed(a.pg2) : 'p. ' + printed(a.pg)) + '</span></a>';
    });
    h += '</div>';
  });
  h += '</div>';
  main.innerHTML = h; setTitle('Annexures');
}

/* --- correction slips --- */
function viewACS(open) {
  var h = '<div class="wrap narrow"><div class="page-h"><div class="eyebrow">Reference</div><h1>Advance Correction Slips</h1><p>The 2024 reprint incorporates Advance Correction Slips (ACS) up to No. 16. Each slip below lists the places in the text where it is marked. Amended text is highlighted in the reader (this can be switched off in Settings).</p></div>';
  var keys = Object.keys(IDX.acs).map(Number).sort(function (a, b) { return a - b; });
  for (var n = 1; n <= 16; n++) {
    var list = IDX.acs[n] || [];
    h += '<details class="acs-card" id="acs' + n + '"' + (open == n ? ' open' : '') + '><summary><span class="no">ACS ' + n + '</span><b>' + (list.length ? list.length + (list.length === 1 ? ' location' : ' locations') : 'No marked locations in the text') + '</b>' + ic('chev') + '</summary>';
    if (list.length) {
      h += '<div>';
      list.forEach(function (x) {
        var cm = chMeta(x.c);
        h += '<a class="li" href="#/c/' + x.c + '/b' + x.i + '"><span class="tag">' + (x.p ? 'Para ' + esc(x.p) : 'Ch ' + cm.n) + '</span><span class="tt"><span>' + esc(x.s) + '</span></span><span class="pg">p. ' + printed(x.pg) + '</span></a>';
      });
      h += '</div>';
    }
    h += '</details>';
  }
  h += '</div>';
  main.innerHTML = h; setTitle('Correction Slips');
  if (open) { var el = document.getElementById('acs' + open); if (el) requestAnimationFrame(function () { el.scrollIntoView({ block: 'start' }); }); }
}

/* --- search --- */
var SIDX = null, sFilter = 'all';
function ensureSearchIndex() {
  if (SIDX) return Promise.resolve(SIDX);
  return Promise.all(['pref', 'abbr'].concat(ORDER).map(loadCh)).then(function () {
    SIDX = [];
    ['pref', 'abbr'].concat(ORDER).forEach(function (cid) {
      var para = null;
      CH[cid].blocks.forEach(function (b, i) {
        var t = '', kind = 'text';
        if (b.k === 'para') { para = b; t = b.n + ' ' + strip(b.h); kind = 'para'; }
        else if (b.k === 't') t = strip(b.h.replace(/(<span class="mk">[^<]*<\/span>)/, '$1 '));
        else if (b.k === 'tbl') { t = strip(b.h.replace(/<\/t[dh]>/g, ' | ').replace(/<\/tr>/g, ' · ')); kind = 'table'; }
        else if (b.k === 'page') { t = (b.t ? b.t + ' — ' : '') + (b.x || ''); kind = 'annex'; }
        else if (b.k === 'fig') { t = b.x || ''; kind = 'figure'; }
        else if (b.k === 'part') t = b.t + ' ' + b.s;
        if (!t) return;
        SIDX.push({ c: cid, i: i, p: para ? para.n : null, pid: para ? para.id : null, k: kind, t: t, lc: t.toLowerCase(), pg: b.pg });
      });
    });
    return SIDX;
  });
}
function doSearch(q) {
  var terms = q.toLowerCase().replace(/[^\w\s/.–-]/g, ' ').split(/\s+/).filter(function (t) { return t.length > 1 || /\d/.test(t); });
  if (!terms.length) return [];
  var phrase = q.toLowerCase().trim(), out = [];
  for (var j = 0; j < SIDX.length; j++) {
    var e = SIDX[j], ok = true;
    if (sFilter !== 'all' && e.k !== sFilter && !(sFilter === 'text' && e.k === 'para')) continue;
    for (var k = 0; k < terms.length; k++) { if (e.lc.indexOf(terms[k]) < 0) { ok = false; break; } }
    if (!ok) continue;
    var sc = 1; if (e.lc.indexOf(phrase) >= 0) sc += 6; if (e.k === 'para') sc += 8;
    terms.forEach(function (t) { var re = new RegExp('\\b' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'); if (re.test(e.lc)) sc += 2; });
    out.push({ e: e, s: sc, o: j });
  }
  out.sort(function (a, b) { return b.s - a.s || a.o - b.o; });
  return out.slice(0, 250).map(function (x) { return x.e; }).concat(out.length > 250 ? [{ more: out.length - 250 }] : []);
}
function snippet(t, terms) {
  var lc = t.toLowerCase(), pos = -1;
  terms.forEach(function (x) { var p = lc.indexOf(x); if (p >= 0 && (pos < 0 || p < pos)) pos = p; });
  var start = Math.max(0, pos - 90), s = (start > 0 ? '…' : '') + t.slice(start, start + 260) + (t.length > start + 260 ? '…' : '');
  var h = esc(s);
  terms.forEach(function (x) { if (x.length < 2) return; h = h.replace(new RegExp('(' + esc(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<em>$1</em>'); });
  return h;
}
function viewSearch(q) {
  q = q || '';
  var h = '<div class="wrap narrow"><div class="page-h"><div class="eyebrow">Search</div><h1>Search the manual</h1><p>Searches the full text of all chapters, tables, annexures and the abbreviations. Enter a para number to go straight to it.</p></div>' +
    '<form class="sbar" id="sForm" role="search" autocomplete="off"><div class="in">' + ic('search') + '<input id="sq" type="search" value="' + esc(q) + '" placeholder="e.g. de-stressing, SEJ gap, 408, Annexure 3/9" aria-label="Search terms"></div><button class="btn pri" type="submit">Search</button></form>' +
    '<div class="filters" id="sFilters">' + [['all', 'All'], ['text', 'Text'], ['table', 'Tables'], ['annex', 'Annexures']].map(function (f) { return '<button type="button" data-f="' + f[0] + '" class="' + (sFilter === f[0] ? 'on' : '') + '">' + f[1] + '</button>'; }).join('') + '</div>' +
    '<div id="sRes"></div></div>';
  main.innerHTML = h; setTitle(q ? 'Search: ' + q : 'Search');
  var input = $('#sq');
  $('#sForm').addEventListener('submit', function (e) { e.preventDefault(); go(input.value); });
  var t; input.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { run(input.value); history.replaceState(null, '', '#/search?q=' + encodeURIComponent(input.value)); }, 220); });
  $('#sFilters').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; sFilter = b.dataset.f; $$('#sFilters button').forEach(function (x) { x.classList.toggle('on', x === b); }); run(input.value); });
  if (!q && window.innerWidth > 719) input.focus();
  run(q);
  function go(v) { location.hash = '#/search?q=' + encodeURIComponent(v); }
  function run(v) {
    var box = $('#sRes'); v = (v || '').trim();
    if (!v) { box.innerHTML = '<div class="empty">' + ic('search') + '<div>Type a word, phrase or para number.</div></div>'; return; }
    box.innerHTML = '<p class="muted">Searching…</p>';
    ensureSearchIndex().then(function () {
      var r = '', m = /^(?:para\s*)?(\d{3,4})([A-Z])?$/i.exec(v), am = annexKey(/^\d/.test(v) ? 'Annexure ' + v : v);
      if (m && PARA[m[1]]) { var p = PARA[m[1]]; r += '<a class="jump" href="#/c/' + p.c + '/' + p.id + '">' + ic('chev') + 'Go to Para ' + m[1] + ' — ' + esc(p.t) + '</a>'; }
      if (am && ANNEX[am]) { var a = ANNEX[am]; r += '<a class="jump" href="#/c/' + a.c + '/b' + a.i + '">' + ic('chev') + 'Go to ' + esc(a.t) + '</a>'; }
      var res = doSearch(v), terms = v.toLowerCase().split(/\s+/).filter(Boolean);
      var count = res.length && res[res.length - 1].more ? (res.length - 1) + '+' : res.length;
      r += '<div class="list">';
      if (!res.length) r += '<div class="empty">No matches for “' + esc(v) + '”.</div>';
      res.forEach(function (e) {
        if (e.more) { r += '<div class="empty">' + e.more + ' more matches. Refine your search to narrow them down.</div>'; return; }
        var anchor = e.k === 'para' ? e.pid : 'b' + e.i, route = (e.c.charAt(0) === 'c' ? 'c/' : 'f/') + e.c;
        var where = chMeta(e.c) ? 'Chapter ' + chMeta(e.c).n : sectionTitle(e.c);
        r += '<a class="res" href="#/' + route + '/' + anchor + '"><div class="loc"><span>' + esc(where) + '</span>' + (e.p ? '<b>Para ' + esc(e.p) + '</b>' : '') + '<span>p. ' + printed(e.pg) + '</span>' + (e.k !== 'text' && e.k !== 'para' ? '<span class="chip">' + { table: 'Table', annex: 'Annexure / original page', figure: 'Figure' }[e.k] + '</span>' : '') + '</div><div class="sn">' + snippet(e.t, terms) + '</div></a>';
      });
      r += '</div>';
      box.innerHTML = '<p class="muted" style="margin:0 0 10px">' + (res.length ? count + ' result' + (count === 1 ? '' : 's') : '') + '</p>' + r;
    });
  }
}
function bindSearchForm(f) {
  if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault(); var v = $('input', f).value.trim(); if (!v) return;
    var m = /^(?:para\s*)?(\d{3,4})$/i.exec(v);
    if (m && PARA[m[1]]) { location.hash = '#/c/' + PARA[m[1]].c + '/' + PARA[m[1]].id; }
    else location.hash = '#/search?q=' + encodeURIComponent(v);
    $('input', f).blur();
  });
}

/* --- saved --- */
function viewSaved() {
  var s = getSaved();
  var h = '<div class="wrap narrow"><div class="page-h"><div class="eyebrow">Your library</div><h1>Saved paras</h1><p>Paras you save are kept on this device. Use the bookmark button beside any para heading.</p></div>';
  if (!s.length) h += '<div class="list"><div class="empty">' + ic('saved') + '<div>Nothing saved yet.</div></div></div>';
  else {
    h += '<div class="list">';
    s.forEach(function (b) {
      h += '<div class="li"><a class="tag" href="#/c/' + b.c + '/' + b.id + '">Para ' + esc(b.n) + '</a><a class="tt" href="#/c/' + b.c + '/' + b.id + '" style="color:inherit"><b>' + esc(b.t) + '</b><span>' + esc(sectionTitle(b.c)) + '</span></a><button class="ib" data-del="' + esc(b.key) + '" aria-label="Remove">' + '<svg class="i" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>';
    });
    h += '</div>';
  }
  h += '</div>';
  main.innerHTML = h; setTitle('Saved');
  main.addEventListener('click', function onDel(e) {
    var b = e.target.closest('[data-del]'); if (!b) return;
    store.set('saved', getSaved().filter(function (x) { return x.key !== b.dataset.del; })); viewSaved();
  }, { once: true });
}

/* --- more (mobile) --- */
function viewMore() {
  var h = '<div class="wrap narrow"><div class="page-h"><div class="eyebrow">Menu</div><h1>More</h1></div><div class="list">' +
    li('#/annexures', 'annex', 'Annexures', 'Forms, drawings and tables') + li('#/acs', 'acs', 'Correction Slips', 'ACS 1 to 16 located in the text') +
    li('#/f/abbr', 'abbr', 'Abbreviations & Terminology', '') + li('#/f/pref', 'book', 'Prefaces', '') + '</div><div class="grp-h">Companion</div><div class="list">' +
    li('companion.html#home', 'notes', 'Explanatory Notes', 'Plain-language guidance by chapter') + li('companion.html#tools', 'tools', 'Field Calculators', '12 calculators') + '</div><div class="grp-h">Application</div><div class="list">' +
    li('#/settings', 'set', 'Settings', 'Theme, text size, highlighting') + li('#/about', 'info', 'About this edition', '') +
    (isNative() ? '' : li('install.html', 'down', 'Install the app', 'Android, iPhone, Windows')) + '</div></div>';
  main.innerHTML = h; setTitle('More');
  function li(href, icon, t, s) { return '<a class="li" href="' + href + '"><span class="tag" style="min-width:0;color:var(--accent)">' + ic(icon) + '</span><span class="tt"><b>' + t + '</b>' + (s ? '<span>' + s + '</span>' : '') + '</span>' + ic('chev') + '</a>'; }
}
function isNative() { return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) || /Electron/i.test(navigator.userAgent); }

/* --- settings --- */
function viewSettings() {
  var fs = S.fs || 16.5;
  var h = '<div class="wrap narrow"><div class="page-h"><div class="eyebrow">Application</div><h1>Settings</h1><p>Settings are stored on this device.</p></div><div class="card">' +
    row('Appearance', 'Follow the system, or always use light or dark.', seg('theme', [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']], S.theme || 'system')) +
    row('Reading typeface', 'Typeface for the text of the manual.', seg('read', [['sans', 'Sans-serif'], ['serif', 'Serif']], S.read || 'sans')) +
    row('Text size', 'Size of the manual text.', '<span class="seg"><button data-fs="-1" aria-label="Smaller">A−</button><button disabled style="min-width:58px">' + fs.toFixed(1).replace('.0', '') + '</button><button data-fs="1" aria-label="Larger">A+</button></span>') +
    row('Highlight amended text', 'Shade text changed by correction slips, as in the printed reprint.', seg('amend', [['on', 'On'], ['off', 'Off']], S.amend || 'on')) +
    row('Saved paras and history', 'Remove saved paras and reading history from this device.', '<button class="btn sm" id="clr">Clear</button>') +
    '</div></div>';
  main.innerHTML = h; setTitle('Settings');
  main.onclick = function (e) {
    var b = e.target.closest('[data-set]');
    if (b) { S[b.dataset.set] = b.dataset.v; saveSettings(); viewSettings(); return; }
    var f = e.target.closest('[data-fs]');
    if (f) { S.fs = Math.max(13, Math.min(24, (S.fs || 16.5) + (+f.dataset.fs))); saveSettings(); viewSettings(); return; }
    if (e.target.id === 'clr') { store.set('saved', []); store.set('recent', []); toast('Cleared'); }
  };
  function row(t, s, ctl) { return '<div class="set"><div><b>' + t + '</b><span>' + s + '</span></div><div>' + ctl + '</div></div>'; }
  function seg(k, opts, cur) { return '<span class="seg">' + opts.map(function (o) { return '<button data-set="' + k + '" data-v="' + o[0] + '" class="' + (cur === o[0] ? 'on' : '') + '">' + o[1] + '</button>'; }).join('') + '</span>'; }
}

/* --- about --- */
function viewAbout() {
  var h = '<div class="wrap narrow"><div class="page-h"><div class="eyebrow">Application</div><h1>About this edition</h1></div><div class="card" style="padding:20px 22px"><dl class="meta-dl">' +
    '<dt>Title</dt><dd>Indian Railways Permanent Way Manual (IRPWM)</dd>' +
    '<dt>Edition</dt><dd>First Reprint 2024 of the redrafted IRPWM (2020)</dd>' +
    '<dt>Corrections</dt><dd>Incorporates Advance Correction Slips up to No. 16</dd>' +
    '<dt>Published by</dt><dd>Indian Railways Institute of Civil Engineering, Pune, for the Government of India, Ministry of Railways (Railway Board), New Delhi</dd>' +
    '<dt>Scope</dt><dd>Broad Gauge. Chapters 1–15, annexures, abbreviations and terminology.</dd>' +
    '<dt>App version</dt><dd>2.0</dd></dl></div>' +
    '<div class="prose"><h2>How this edition is prepared</h2><p>The complete text of the 2024 reprint has been converted into a searchable, reflowable form, para by para. Tables are reproduced as tables. Annexures, drawings, equations and scanned material are shown in their original page layout, so that nothing is lost in conversion. Any page can be opened in its original form from the page icon next to each para.</p>' +
    '<p>Text amended by Advance Correction Slips is highlighted, and each slip marker links to the register of correction slips.</p>' +
    '<h2>Status</h2><p>This is a reference edition for convenience of use. In case of any discrepancy, the printed manual, together with the latest instructions of the Railway Board and RDSO, shall prevail. The Explanatory Notes and Field Calculators are study aids and do not form part of the manual.</p></div></div>';
  main.innerHTML = h; setTitle('About');
}
function viewNotFound() { main.innerHTML = '<div class="wrap"><div class="empty">Page not found. <a href="#/">Go to Home</a></div></div>'; }

/* ------------------------------------------------------------------ original page viewer */
var V = { pg: 31, zoom: 1, open: false, token: 0 };
function openViewer(pg) {
  V.pg = Math.max(1, Math.min(532, pg)); V.open = true;
  $('#viewer').classList.add('open'); document.body.style.overflow = 'hidden';
  drawViewer();
}
function closeViewer() { V.open = false; $('#viewer').classList.remove('open'); document.body.style.overflow = ''; }
function drawViewer() {
  var tok = ++V.token, pg = V.pg, cid = chapterOfPage(pg);
  $('#vTitle').innerHTML = 'Page ' + printed(pg) + '<small>' + esc(cid ? sectionTitle(cid) : 'Indian Railways Permanent Way Manual') + '</small>';
  $('#vNum').value = printed(pg).replace(/[()]/g, '');
  $('#vPrev').disabled = pg <= 1; $('#vNext').disabled = pg >= 532;
  var body = $('#vBody'), box = $('#vPage');
  var avail = Math.min(body.clientWidth - 24, 980) * V.zoom;
  box.style.width = avail + 'px';
  box.innerHTML = '<div class="ph" style="position:relative;height:' + Math.round(avail * 1.414) + 'px">Rendering…</div>';
  getPdf().then(function (doc) { return doc.getPage(pg); }).then(function (page) {
    if (tok !== V.token) return;
    var v1 = page.getViewport({ scale: 1 }), dpr = Math.min(window.devicePixelRatio || 1, 3);
    var scale = avail * dpr / v1.width, vp = page.getViewport({ scale: scale });
    var c = document.createElement('canvas'); c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
    var ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () { if (tok === V.token) { box.innerHTML = ''; box.appendChild(c); } });
  }).catch(function () { box.innerHTML = '<div class="ph" style="position:relative;height:200px">Could not render this page.</div>'; });
}
function bindViewer() {
  $('#vClose').onclick = function () { history.back(); };
  $('#vPrev').onclick = function () { history.replaceState(null, '', '#/page/' + (V.pg - 1)); openViewer(V.pg - 1); };
  $('#vNext').onclick = function () { history.replaceState(null, '', '#/page/' + (V.pg + 1)); openViewer(V.pg + 1); };
  $('#vZoomIn').onclick = function () { V.zoom = Math.min(3, V.zoom * 1.4); drawViewer(); };
  $('#vZoomOut').onclick = function () { V.zoom = Math.max(1, V.zoom / 1.4); drawViewer(); };
  $('#vNum').onchange = function () { var p = pdfPage(this.value); if (p) { history.replaceState(null, '', '#/page/' + p); openViewer(p); } };
  $('#vText').onclick = function () {
    var cid = chapterOfPage(V.pg); if (!cid) return;
    var target = '#/' + (cid.charAt(0) === 'c' ? 'c/' : 'f/') + cid + '/pg' + V.pg;
    closeViewer(); history.replaceState(null, '', target); route();
  };
  document.addEventListener('keydown', function (e) {
    if (V.open) {
      if (e.key === 'Escape') history.back();
      else if (e.key === 'ArrowRight' && V.pg < 532) $('#vNext').click();
      else if (e.key === 'ArrowLeft' && V.pg > 1) $('#vPrev').click();
      return;
    }
    if (e.key === '/' && !/input|textarea/i.test((document.activeElement || {}).tagName || '')) {
      e.preventDefault(); var q = $('#topQ'); if (q && q.offsetParent) q.focus(); else location.hash = '#/search';
    }
    if (e.key === 'Escape') closeNav();
  });
}

/* ------------------------------------------------------------------ router */
var lastView = null;
function route() {
  var h = decodeURIComponent(location.hash.replace(/^#\/?/, '')), q = '';
  var qi = h.indexOf('?'); if (qi >= 0) { q = h.slice(qi + 1); h = h.slice(0, qi); }
  var parts = h.split('/').filter(Boolean);
  closeNav();
  if (parts[0] === 'page') { openViewer(+parts[1] || 31); if (!lastView) { lastView = 'home'; viewHome(); markNav(''); } return; }
  if (V.open) closeViewer();
  var key = parts.slice(0, 2).join('/');
  markNav(parts[0] === 'c' || parts[0] === 'f' ? key : (parts[0] || ''));
  if (parts[0] === 'c' || parts[0] === 'f') { if (lastView !== 'r:' + parts[1]) curRead = null; lastView = 'r:' + parts[1]; viewReader(parts[1], parts[2]); return; }
  curRead = null; window.onscroll = null; main.onclick = null;
  lastView = parts[0] || 'home';
  var param = new URLSearchParams(q);
  switch (parts[0] || '') {
    case '': viewHome(); break;
    case 'contents': viewContents(); break;
    case 'annexures': viewAnnexures(); break;
    case 'acs': viewACS(parts[1]); break;
    case 'search': viewSearch(param.get('q') || ''); break;
    case 'saved': viewSaved(); break;
    case 'more': viewMore(); break;
    case 'settings': viewSettings(); break;
    case 'about': viewAbout(); break;
    default: viewNotFound();
  }
  if (parts[0] !== 'acs' || !parts[1]) window.scrollTo(0, 0);
}

/* ------------------------------------------------------------------ boot */
function boot() {
  applySettings();
  $('#menuBtn').onclick = function () { document.body.classList.toggle('nav-open'); };
  $('#scrim').onclick = closeNav;
  bindSearchForm($('#topSearch'));
  bindViewer();
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySettings);
  loadIndex().then(function () {
    buildSide();
    window.addEventListener('hashchange', route);
    route();
    // warm the chapter files in the background for instant search
    setTimeout(function () { ['pref', 'abbr'].concat(ORDER).forEach(function (id) { loadCh(id).catch(function () {}); }); }, 1500);
  }, function (e) { main.innerHTML = '<div class="wrap"><div class="empty">Could not load the manual data. ' + esc(e.message) + '</div></div>'; });
  try {
    var CapApp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (CapApp) CapApp.addListener('backButton', function (e) {
      if (V.open || (e && e.canGoBack)) history.back();
      else if (document.body.classList.contains('nav-open')) closeNav();
      else CapApp.exitApp();
    });
  } catch (e) {}
  if (!isNative() && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/^(localhost|127\.)/.test(location.hostname)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
}
boot();
})();
