// Единый список курсов. Чтобы добавить курс: новая строка здесь + папка courses/<id>/page1.md
// color — цвет окантовки кнопки на главной.
export const GROUPS = [
  {
    title: 'Основы',
    items: [
      { id: 'html',   name: 'HTML',   color: '#1f9d3a' }, // зелёный
      { id: 'css',    name: 'CSS',    color: '#ff8a00' }, // оранжевый
      { id: 'python', name: 'Python', color: '#2f6fdb' }, // синий
      { id: 'js',     name: 'JS',     color: '#2bb6f0' }, // голубой
      { id: 'cpp',    name: 'C++',    color: '#0b2a7a' }, // тёмно-синий
      { id: 'rust',   name: 'Rust',   color: '#b34700' }, // тёмно-оранжевый
      { id: 'bash',   name: 'bash',   color: '#000000' }, // чёрный
    ],
  },
  {
    title: 'Продвинутый уровень',
    items: [
      { id: 'wgsl', name: 'WGSL',     color: '#000000' }, // чёрный
      { id: 'asm',  name: 'Assembly', color: '#000000' }, // чёрный
    ],
  },
];

// Белый список: в запросы попадают только эти id.
export const COURSES = new Map(GROUPS.flatMap((g) => g.items).map((c) => [c.id, c]));
