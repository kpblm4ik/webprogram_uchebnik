# WGSL. Страница 1. Первая константа

WGSL (WebGPU Shading Language) — язык шейдеров для WebGPU: программ, которые работают на видеокарте. Типы пишутся строго: `f32` — число с плавающей точкой. Константа объявляется через `let`, изменяемая переменная — через `var`.

## Задание

Объяви константу x типа f32 со значением 1.0.

```term
task: Объяви константу x типа f32 равной 1.0
prompt: wgsl>
ok: let x: f32 = 1.0; => Done: constant x declared (Готово: константа x объявлена)
warn: var x: f32 = 1.0; => Warning: variable is never modified, use let (Предупреждение: переменная не меняется, лучше let)
err: let x: float = 1.0; => error: unknown type 'float' (ошибка: неизвестный тип «float», используй f32)
err: let x: f32 = 1.0 => error: expected ';' (ошибка: ожидалась «;»)
default: error: unexpected token (ошибка: неожиданный токен)
```
