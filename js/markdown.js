// Мини-Markdown -> DOM.
// Никакого innerHTML: всё строится через createElement/textContent,
// поэтому HTML-теги внутри .md не исполняются, а показываются как текст.
import { buildTerminal } from './terminal.js';

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*\s][^*]*\*)|(!\[[^\]]*\]\([^)\s]+\))|(\[[^\]]+\]\([^)\s]+\))/g;

// Разрешены только http(s) и относительные адреса (javascript:, data: и т.п. блокируются)
export function safeUrl(u) {
  try {
    const url = new URL(u, location.href);
    return url.protocol === 'http:' || url.protocol === 'https:' ? u : null;
  } catch {
    return null;
  }
}

function el(tag, text) {
  const e = document.createElement(tag);
  if (text !== undefined) e.textContent = text;
  return e;
}

function inline(text, parent) {
  const re = new RegExp(INLINE.source, 'g');
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) parent.append(text.slice(last, m.index));
    const t = m[0];
    if (m[1]) {
      parent.append(el('code', t.slice(1, -1)));
    } else if (m[2]) {
      const s = el('strong');
      inline(t.slice(2, -2), s);
      parent.append(s);
    } else if (m[3]) {
      const s = el('em');
      inline(t.slice(1, -1), s);
      parent.append(s);
    } else if (m[4]) {
      const [, alt, src] = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(t);
      const ok = safeUrl(src);
      if (ok) {
        const img = el('img');
        img.src = ok;
        img.alt = alt;
        img.loading = 'lazy';
        parent.append(img);
      } else {
        parent.append(alt);
      }
    } else {
      const [, label, href] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(t);
      const ok = safeUrl(href);
      if (ok) {
        const a = el('a');
        a.href = ok;
        a.rel = 'noopener noreferrer';
        a.target = '_blank';
        inline(label, a);
        parent.append(a);
      } else {
        parent.append(label);
      }
    }
    last = re.lastIndex;
  }
  if (last < text.length) parent.append(text.slice(last));
}

const LI = /^\s*([-*]|\d+\.)\s+(.*)$/;
const isBlockStart = (l) => /^(#{1,4}\s|```|>|\s*([-*]|\d+\.)\s|---+\s*$)/.test(l);

export function render(md) {
  const frag = document.createDocumentFragment();
  const lines = md.replace(/\r\n?/g, '\n').split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let m;

    // ```term ... ``` — терминал, остальные ``` — обычный код
    if ((m = /^```(\w*)\s*$/.exec(line))) {
      const lang = m[1];
      const body = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++;
      if (lang === 'term') {
        frag.append(buildTerminal(body));
      } else {
        const pre = el('pre');
        pre.append(el('code', body.join('\n')));
        frag.append(pre);
      }
      continue;
    }

    if ((m = /^(#{1,4})\s+(.*)$/.exec(line))) {
      const h = el('h' + m[1].length);
      inline(m[2], h);
      frag.append(h);
      i++;
      continue;
    }

    if (/^---+\s*$/.test(line)) { frag.append(el('hr')); i++; continue; }

    if (line.startsWith('>')) {
      const q = el('blockquote');
      const buf = [];
      while (i < lines.length && lines[i].startsWith('>')) buf.push(lines[i++].replace(/^>\s?/, ''));
      inline(buf.join(' '), q);
      frag.append(q);
      continue;
    }

    if ((m = LI.exec(line))) {
      const list = el(/\d/.test(m[1]) ? 'ol' : 'ul');
      while (i < lines.length && (m = LI.exec(lines[i]))) {
        const li = el('li');
        inline(m[2], li);
        list.append(li);
        i++;
      }
      frag.append(list);
      continue;
    }

    // абзац (первая строка берётся всегда — защита от зацикливания)
    const buf = [lines[i++].trim()];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) buf.push(lines[i++].trim());
    const p = el('p');
    inline(buf.join(' '), p);
    frag.append(p);
  }

  return frag;
}
