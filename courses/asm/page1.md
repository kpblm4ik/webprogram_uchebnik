# Assembly. Страница 1. Регистры

Assembly — язык, близкий к машинному коду процессора. Данные лежат в **регистрах** — быстрых ячейках внутри процессора. Команда `mov приёмник, источник` копирует значение. Здесь используется синтаксис NASM для x86-64.

## Задание

Положи число 1 в регистр eax.

```term
task: Положи число 1 в регистр eax
prompt: asm>
ok: mov eax, 1 => Done: eax = 1 (Готово: eax = 1)
warn: mov rax, 1 => Warning: rax is 64-bit, eax is enough for a small number (Предупреждение: rax 64-битный, для маленького числа хватит eax)
err: mov 1, eax => error: invalid combination of opcode and operands (ошибка: недопустимое сочетание команды и операндов)
default: error: parser: instruction expected (ошибка: парсер: ожидалась инструкция)
```
