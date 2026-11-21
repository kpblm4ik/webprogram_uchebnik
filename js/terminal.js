// Терминал для практики: <div class="term">.
// Он НИЧЕГО не выполняет — ввод только сравнивается со списком команд из .md.
// Всё, что попадает на страницу, идёт через textContent (никакого innerHTML/eval).

const MAX_INPUT = 200;   // символов в одной команде
const MAX_RULES = 40;    // правил на один терминал
const MAX_MSG = 400;     // длина сообщения
const MIN_GAP_MS = 250;  // не чаще одной отправки за это время

// Стандартные сообщения: английский текст, русский перевод — в скобках в конце.
export const MESSAGES = Object.freeze({
  notFound: 'bash: {cmd}: command not found (bash: {cmd}: команда не найдена)',
  empty: 'Warning: empty input (Предупреждение: пустой ввод)',
  tooLong: 'Error: input too long (Ошибка: слишком длинный ввод)',
  badChars: 'Error: unsupported characters (Ошибка: недопустимые символы)',
});

function mk(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

const norm = (s) => s.trim().replace(/\s+/g, ' ');

function parseSpec(lines) {
  const spec = { task: '', prompt: '$', rules: new Map(), notFound: MESSAGES.notFound };
  for (const raw of lines) {
    const m = /^(task|prompt|ok|warn|err|default):\s*(.*)$/.exec(raw.trim());
    if (!m) continue;
    const [, key, val] = m;
    if (key === 'task') spec.task = val.slice(0, MAX_MSG);
    else if (key === 'prompt') spec.prompt = val.slice(0, 10);
    else if (key === 'default') spec.notFound = val.slice(0, MAX_MSG);
    else {
      if (spec.rules.size >= MAX_RULES) continue;
      const k = val.indexOf('=>');
      if (k < 0) continue;
      spec.rules.set(norm(val.slice(0, k)), {
        state: key, // ok | warn | err
        text: val.slice(k + 2).trim().slice(0, MAX_MSG).replace(/\\n/g, '\n'),
      });
    }
  }
  return spec;
}

// "English text (русский перевод)" -> две раздельные части
function renderMessage(text) {
  const wrap = mk('div', 'term-msg');
  for (const line of text.split('\n')) {
    const row = mk('div', 'term-row');
    const idx = line.lastIndexOf(' (');
    if (line.endsWith(')') && idx > 0) {
      row.append(mk('span', 'term-en', line.slice(0, idx)), ' ', mk('span', 'term-ru', line.slice(idx + 1)));
    } else {
      row.append(mk('span', 'term-en', line));
    }
    wrap.append(row);
  }
  return wrap;
}

export function buildTerminal(lines) {
  const spec = parseSpec(lines);

  const root = mk('div', 'term');
  root.dataset.state = 'idle';

  if (spec.task) root.append(mk('div', 'term-task', spec.task));

  const out = mk('div', 'term-out');
  out.hidden = true;
  out.setAttribute('role', 'status');

  const box = mk('div', 'term-box');
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'term-input';
  input.maxLength = MAX_INPUT;
  input.autocomplete = 'off';
  input.autocapitalize = 'none';
  input.spellcheck = false;
  input.setAttribute('aria-label', 'Терминал');
  box.append(mk('span', 'term-prompt', spec.prompt), input);

  root.append(out, box);

  let lastRun = 0;

  function show(cmd, res) {
    const shown = cmd.slice(0, MAX_INPUT);
    const text = res.text.split('{cmd}').join(shown);
    out.replaceChildren();
    if (shown.trim()) out.append(mk('div', 'term-echo', spec.prompt + ' ' + shown));
    out.append(renderMessage(text));
    out.hidden = false;
    out.classList.remove('fly');
    void out.offsetWidth; // перезапуск анимации «прилёта»
    out.classList.add('fly');
    root.dataset.state = res.state;
  }

  function run() {
    const now = performance.now();
    if (now - lastRun < MIN_GAP_MS) return;
    lastRun = now;

    const cmd = input.value;
    let res;
    if (cmd.length > MAX_INPUT) res = { state: 'err', text: MESSAGES.tooLong };
    else if (/[\u0000-\u001f\u007f]/.test(cmd)) res = { state: 'err', text: MESSAGES.badChars };
    else if (!cmd.trim()) res = { state: 'warn', text: MESSAGES.empty };
    else res = spec.rules.get(norm(cmd)) ?? { state: 'err', text: spec.notFound };
    show(cmd, res);
  }

  input.addEventListener('input', () => { root.dataset.state = 'idle'; }); // рамка снова оранжевая
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      run();
    }
  });

  return root;
}
