import { GROUPS } from './courses.js';

const root = document.getElementById('groups');

for (const g of GROUPS) {
  const sec = document.createElement('section');
  sec.className = 'group';

  const h = document.createElement('h2');
  h.textContent = g.title;

  const box = document.createElement('div');
  box.className = 'courses';

  for (const c of g.items) {
    const a = document.createElement('a');
    a.className = 'course';
    a.href = `book.html?c=${c.id}#1`;
    a.textContent = c.name;
    a.style.setProperty('--c', c.color);
    box.append(a);
  }

  sec.append(h, box);
  root.append(sec);
}
