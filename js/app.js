import { render } from './markdown.js';
import { COURSES } from './courses.js';

const view = document.getElementById('page');
const btnPrev = document.getElementById('prev');
const btnNext = document.getElementById('next');
const pager = document.getElementById('pager');

// Курс берётся только из белого списка (js/courses.js).
const course = COURSES.get(new URLSearchParams(location.search).get('c') ?? '');
if (course) document.title = `${course.name} — Учебник`;

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const OUT_MS = 480; // чуть больше времени transition в CSS

const cache = new Map();
let current = 0;
let busy = false;
let lastDuration = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Путь строится только из id курса (белый список) и числа — подставить свой путь нельзя.
async function fetchPage(n) {
  if (!course || !Number.isInteger(n) || n < 1 || n > 999) return null;
  if (cache.has(n)) return cache.get(n);
  let text = null;
  try {
    const r = await fetch(`courses/${course.id}/page${n}.md`, { credentials: 'omit', cache: 'no-cache' });
    if (r.ok) text = await r.text();
  } catch { /* нет файла */ }
  cache.set(n, text);
  return text;
}

// Разбиваем текст на слова-«кирпичики», терминалы и картинки — тоже «кирпичики».
// Каждому — своя задержка, чтобы появление/исчезновение шло слово за словом.
function prepare(root) {
  const nodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeValue.trim() && !n.parentElement.closest('.term, pre')) nodes.push(n);
  }
  for (const n of nodes) {
    const frag = document.createDocumentFragment();
    for (const part of n.nodeValue.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.append(part);
      } else {
        const s = document.createElement('span');
        s.className = 'w unit';
        s.textContent = part;
        frag.append(s);
      }
    }
    n.replaceWith(frag);
  }
  root.querySelectorAll('.term, pre, img').forEach((e) => e.classList.add('unit'));

  const units = root.querySelectorAll('.unit');
  const step = Math.min(35, 1400 / Math.max(units.length, 1));
  units.forEach((u, i) => u.style.setProperty('--d', `${Math.round(i * step)}ms`));
  return units.length * step;
}

async function updateNav() {
  btnPrev.disabled = current <= 1;
  btnNext.disabled = (await fetchPage(current + 1)) === null;
  pager.textContent = String(current);
}

async function show(n) {
  if (n === current) return true;
  if (busy) return false;
  const text = await fetchPage(n);
  if (text === null) return false;

  busy = true;
  try {
    if (current && !reduce) {
      view.classList.add('leaving');
      await sleep(lastDuration + OUT_MS);
    }
    view.classList.remove('leaving');
    view.classList.add('entering');
    view.replaceChildren(render(text));
    lastDuration = reduce ? 0 : prepare(view);
    current = n;
    void view.offsetWidth; // зафиксировать стартовое состояние
    view.classList.remove('entering');
    window.scrollTo(0, 0);
    await updateNav();
  } finally {
    busy = false;
  }
  return true;
}

async function go(n) {
  const ok = await show(n);
  if (ok && location.hash !== `#${n}`) history.pushState(null, '', `#${n}`);
}

function pageFromHash() {
  const m = /^#(\d{1,3})$/.exec(location.hash);
  return m ? Number(m[1]) : 1;
}

btnPrev.addEventListener('click', () => go(current - 1));
btnNext.addEventListener('click', () => go(current + 1));

document.addEventListener('keydown', (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest && e.target.closest('input, textarea, [contenteditable]')) return;
  if (e.key === 'ArrowLeft') go(current - 1);
  else if (e.key === 'ArrowRight') go(current + 1);
});

window.addEventListener('popstate', () => show(pageFromHash()));

show(pageFromHash()).then((ok) => {
  if (!ok && !current) {
    view.textContent = course ? 'Страница не найдена (Page not found)' : 'Курс не найден (Course not found)';
  }
});
