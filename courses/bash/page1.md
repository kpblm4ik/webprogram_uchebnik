# bash. Страница 1. Первые команды

bash — командная оболочка Linux и Termux. Ты вводишь команду, жмёшь Enter и получаешь ответ. Команда `echo` печатает текст, а `pwd` показывает, в какой папке ты сейчас.

## Задание 1

Выведи слово Привет в кавычках.

```term
task: Выведи Привет командой echo
prompt: $
ok: echo "Привет" => Привет
warn: echo Привет => Привет\nWarning: quotes are recommended (Предупреждение: лучше писать текст в кавычках)
err: echo "Привет => bash: unexpected EOF while looking for matching quote (bash: неожиданный конец файла при поиске закрывающей кавычки)
```

## Задание 2

Узнай, в какой папке ты находишься.

```term
task: Покажи текущую папку
prompt: $
ok: pwd => /home/student
warn: ls => Warning: this lists files, not the path (Предупреждение: это список файлов, а не путь)
```
