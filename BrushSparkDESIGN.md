# BrushSpark — Design System
> Единая дизайн-система линейки продуктов (совместно с Image Pipeline).
> Акцентный цвет: Orange-500 (#F97316). Только тёмная тема.

---

## 1. Общая информация

| Параметр | Значение |
|----------|----------|
| Стек | React 19 + TypeScript + Vite |
| CSS | Tailwind CSS v4 (CSS-first, без `tailwind.config.js`) |
| Иконки | Lucide React |
| Утилиты | `clsx` + `tailwind-merge` → `cn()` |
| Анимации | CSS-переходы (Tailwind) + кастомные ключевые кадры |
| Режим | **Только тёмная тема** |

---

## 2. Цветовая палитра

### 2.1 Фоновые цвета

| Токен | Значение | Применение |
|-------|----------|------------|
| `bg-page` | `#0D0D14` | Основной фон страниц |
| `bg-sidebar` | `#0D0D12` | Боковые панели, параметрические панели |
| `bg-header` | `#111118` | Шапка, модальные окна |
| `bg-surface` | `#1A1A24` | Карточки, холст, скроллбар, тултипы |
| `bg-surface-elevated` | `#2A2A3A` | Hover-состояния, cookie-баннер, elevated-карточки |
| `bg-overlay` | `black/50` | Затемнение модалок, мобильный оверлей |
| `bg-input` | `white/5` | Поля ввода, кнопки, разделители |
| `bg-card` | `white/[0.02]` | Карточки фич, секции |

### 2.2 Акцентные (брендовые) цвета

| Роль | Токен | Значение | Применение |
|------|-------|----------|------------|
| **Primary** | `primary` | `#F97316` | CTA, активные табы, ползунки, прогресс, бейджи Pro |
| **Primary hover** | `primary-hover` | `#FB923C` | Hover primary-кнопок |
| **Secondary accent** | `secondary` | `#34D399` | Выделенные элементы (emerald-400) |
| **Success** | `success` | `#4ADE80` | Готовые файлы, индикаторы, Pro-статус |
| **Warning** | `warning` | `#F59E0B` | Предупреждения, заполнение 80%+ (amber-500) |
| **Error** | `error` | `#F87171` | Ошибки, удаление |

### 2.3 Цвета текста

| Токен | Значение | Применение |
|-------|----------|------------|
| `text-primary` | `#F5F5F5` (gray-100) | Заголовки, активный текст, кнопки |
| `text-secondary` | `#E2E8F0` (gray-200) | Основной текст body, подписи |
| `text-muted` | `#9CA3AF` (gray-400) | Описания, подсказки, метки, placeholders |
| `text-disabled` | `#6B7280` (gray-500) | Disabled, приглушённый текст |
| `text-accent` | `#FB923C` (orange-400) | Акцентный текст, адрес кошелька |
| `text-success` | `#4ADE80` | Успешные состояния |
| `text-error` | `#F87171` | Ошибки |
| `text-on-primary` | `#000000` | Текст на оранжевых кнопках |

### 2.4 Цвета границ

| Токен | Значение | Применение |
|-------|----------|------------|
| `border-subtle` | `rgba(255,255,255,0.05)` | Сайдбары, хедер, разделители, карточки |
| `border-default` | `rgba(255,255,255,0.10)` | Инпуты, селекты, модалки, контейнеры |
| `border-hover` | `rgba(255,255,255,0.20)` | Uploader при наведении, hover-границы |
| `border-accent` | `rgba(249,115,22,0.40)` | Популярный план, выделенные состояния |
| `border-focus` | `rgba(251,146,60,0.50)` | Drag-and-drop индикатор |

### 2.5 Семантические оверлеи

| Контекст | Значение |
|----------|----------|
| Modal backdrop | `bg-black/50 backdrop-blur-sm` |
| Warning bg | `bg-amber-500/10` |
| Warning border | `border-amber-500/30` |
| Primary tint bg | `bg-orange-500/10` |
| Success tint bg | `bg-green-400/10` |
| Amber tint bg | `bg-amber-500/10` |
| Watermark fill | `rgba(255,255,255,0.15)` |

### 2.6 Бейджи / Plan

| План | Текст | Фон |
|------|-------|-----|
| Free | `text-gray-400` | `bg-gray-800` + `border border-white/5` |
| Pro | `text-orange-400` | `bg-orange-500/10` + `border border-orange-500/20` |
| Lifetime | `text-amber-400` | `bg-amber-500/10` + `border border-amber-500/20` |

---

## 3. Типографика

### 3.1 Шрифты

```
font-family: system-ui, -apple-system, sans-serif;
```

**Моно (для числовых параметров):** `'JetBrains Mono', ui-monospace, monospace` — seed, resolution, координаты, TxID.

### 3.2 Размеры

| Tailwind | Размер | Применение |
|----------|--------|------------|
| `text-[10px]` | 10px | Подсказки, таймстемпы, счётчики, fine print |
| `text-[11px]` | 11px | Индикатор использования |
| `text-xs` | 12px | Лейблы, бейджи, имена файлов, прогресс % |
| `text-sm` | 14px | Body, кнопки, инпуты, dropdown, preset name |
| `text-base` | 16px | Название приложения в шапке |
| `text-lg` | 18px | Заголовки модалок, секций |
| `text-xl` | 20px | CTA-кнопки на лендинге, цены |
| `text-2xl` | 24px | Секционные заголовки, статистика |
| `text-3xl` | 30px | Заголовки страниц (Pricing, FAQ) |
| `text-5xl` | 48px | Hero-заголовок (если применимо) |

### 3.3 Насыщенность

| Tailwind | Применение |
|----------|------------|
| `font-medium` (500) | Кнопки, слайдеры, лейблы, бейджи, имена файлов |
| `font-semibold` (600) | Заголовки секций, value displays |
| `font-bold` (700) | App title "BrushSpark", цены, CTA |

### 3.4 Регистр и интервал

```tsx
className="text-xs font-semibold text-gray-400 uppercase tracking-wider"
```
Для: заголовков секций в панели, меток параметров, заголовков настроек.

---

## 4. Отступы и интервалы

### 4.1 Padding

| Tailwind | Применение |
|----------|------------|
| `px-6 py-16` | Секции лендинга |
| `p-6` | Модальные окна, карточки |
| `p-5` | Панель параметров (panel section) |
| `p-4` | Cookie-баннер, настройки |
| `px-4 py-1.5` | Кнопки тулбара |
| `px-3 py-2.5` | Элементы сайдбара, кнопки |
| `px-3 py-2` | Поля ввода, select |
| `px-2 py-1.5` | Элементы списка файлов |
| `p-1.5` | Иконки-кнопки, действия над превью |
| `px-2 py-1` | Бейджи, переключатель языка |
| `px-5 py-2.5` | Кнопки CTA |
| `px-10 py-4` | CTA в hero-секции |

### 4.2 Gap

| Tailwind | Применение |
|----------|------------|
| `gap-1` | Группы иконок |
| `gap-1.5` | Пара иконка + текст |
| `gap-2` | Элементы в flex, поля формы |
| `gap-3` | Действия в шапке, элементы сайдбара |
| `gap-4` | Секции страниц, группа CTA |
| `gap-6` | Сетки, canvas ↔ panel, секции лендинга |
| `gap-8` | Колонки статистики |

### 4.3 Margin / Space-Y

| Tailwind | Применение |
|----------|------------|
| `mb-2` | Подписи секций |
| `mb-3` | Заголовки карточек |
| `mb-4` | Контент модалок, группы форм |
| `mb-6` | Контент карточек Pricing |
| `space-y-1` | Список файлов |
| `space-y-1.5` | Палитра параметров, группы полей |
| `space-y-2` | Список пресетов |
| `space-y-3` | Секции CryptoModal |
| `space-y-4` | Секции настроек |

---

## 5. Скругления (Border Radius)

| Радиус | Tailwind | Применение |
|--------|----------|------------|
| 4px | `rounded` | Скелетоны |
| 8px | `rounded-lg` | **Основной**: кнопки, инпуты, карточки, файлы |
| 12px | `rounded-xl` | Модалки, панели, canvas, uploader, Pricing |
| 16px | `rounded-2xl` | Карточки фич, cookie-баннер, шаги лендинга |
| 9999px | `rounded-full` | Бейджи, тогглы, ползунки, FAB |

---

## 6. Тени

| Тень | Применение |
|------|------------|
| `shadow-lg` | Карточки узлов, панели |
| `shadow-2xl` | Модальные окна, cookie-баннер |
| `shadow-[0_4px_15px_rgba(249,115,22,0.4)]` | CTA-кнопка (свечение) |
| `shadow-[0_8px_25px_rgba(249,115,22,0.5)]` | CTA-кнопка (hover) |
| `shadow-[0_20px_40px_rgba(0,0,0,0.3)]` | Демо-изображение |
| `shadow-orange-400/20` | Выделенный элемент (в комбинации с ring) |
| `box-shadow: 0 0 0 9999px rgba(0,0,0,0.6)` | Подсветка онбординга |

---

## 7. Структура макета

### 7.1 Основной редактор

```
┌────────────────────────────────────────────┐
│  Header (h-14 = 56px) bg-[#111118]         │
├────────────────────┬───────────────────────┤
│   Parameter Panel  │      Canvas           │
│   (w-[340px])      │      (flex-1)         │
│   bg-[#0D0D12]     │      bg-[#1A1A24]     │
│                    │                       │
└────────────────────┴───────────────────────┘
```

- **Header:** `h-14 flex items-center justify-between px-4 bg-[#111118] border-b border-white/5`
- **Panel:** `w-[340px] bg-[#0D0D12] border-r border-white/5 p-5`
- **Canvas wrapper:** `flex-1 flex items-center justify-center bg-[#0D0D14] p-6`
- **Canvas:** `w-[512px] h-[512px] max-w-full max-h-[60vh] bg-[#1A1A24] rounded-xl border border-white/10 overflow-hidden`

### 7.2 Адаптивность

| Брейкпоинт | Поведение |
|-----------|-----------|
| `< 768px` | Панель скрыта, FAB `fixed bottom-6 right-6`, bottom sheet `rounded-t-2xl` |
| `≥ 768px` | Панель статична, 2-колоночный макет |

### 7.3 Страницы контента

`min-h-screen max-w-3xl mx-auto px-6`

---

## 8. Компоненты

### 8.1 Кнопки

| Вариант | Классы |
|---------|--------|
| **Primary** | `bg-orange-500 text-black font-bold rounded-lg px-5 py-2.5 hover:bg-orange-400 hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(249,115,22,0.5)] active:translate-y-0` |
| **Secondary** | `bg-white/5 text-gray-200 border border-white/5 rounded-lg px-3 py-2 hover:bg-white/10` |
| **Ghost** | `bg-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg` |
| **Icon** | `p-1.5 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-gray-200` |

**Все:** `h-10 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D14]`  
**Disabled:** `opacity-50 cursor-not-allowed`

### 8.2 Поля ввода

```tsx
className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200
           placeholder:text-gray-500 focus:outline-none focus:border-orange-500/50
           focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D14]"
```

- Числовые: `w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-gray-200 text-center font-mono`
- Range: `w-full accent-orange-500`

### 8.3 Select / Dropdown (Headless UI Listbox)

- **Button:** `h-10 pl-3 pr-10 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-200`
- **Panel:** `bg-[#111118] border border-white/10 rounded-lg shadow-2xl max-h-60 z-10 mt-1`
- **Items:** `px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200`
- Option override: `select option { background: #0D0D14; color: #E2E8F0; }`

### 8.4 Тоггл (переключатель)

```tsx
<div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:bg-orange-500
  after:content-[''] after:absolute after:top-[2px] after:left-[2px]
  after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all
  peer-checked:after:translate-x-4" />
```

### 8.5 Модальные окна (Headless UI Dialog)

- **Backdrop:** `bg-black/50 backdrop-blur-sm fixed inset-0`
- **Panel:** `w-full max-w-md bg-[#111118] border border-white/10 rounded-xl p-6 shadow-2xl`
- **Title:** `text-lg font-semibold text-gray-100 mb-6`
- **Transitions:** fade + scale (enter 200ms ease-out, leave 150ms ease-in)

### 8.6 Слайдер (`<input type="range">`)

- **Track:** `h-1 bg-white/10 rounded`
- **Thumb:** `bg-orange-500 rounded-full w-4 h-4` (hover: `scale-1.2`)
- **Label:** `text-xs font-medium text-gray-400`
- **Value:** `text-xs font-semibold text-gray-100 font-mono`

### 8.7 Parameter Panel Section

- **Container:** `bg-[#1A1A24] rounded-xl p-5 border border-white/5`
- **Heading:** `text-sm font-semibold text-gray-100 mb-4 uppercase tracking-wider`
- **Labels:** `text-xs font-medium text-gray-400 mb-1 block`

### 8.8 Export Panel

- **Progress:** `h-2 bg-white/5 rounded-full`, fill: `h-full bg-orange-400 transition-all duration-300 ease-linear rounded-full`

### 8.9 Pricing Modal

- **Tiers:** active = `bg-orange-500 text-black`, inactive = `bg-white/5 text-gray-400 border border-white/5`
- **Info card:** `bg-[#2A2A3A] rounded-xl p-4 space-y-3`
- **Address:** `code flex-1 text-xs text-orange-400 font-mono truncate bg-white/5 px-2 py-1.5 rounded-lg`
- **QR:** `bg-[#2A2A3A] rounded-xl p-4 text-center`, image `w-44 h-44 mx-auto rounded-lg`
- **TxID:** `w-full bg-[#2A2A3A] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 font-mono`

### 8.10 Mobile Layout

- **FAB:** `fixed bottom-6 right-6 z-40 w-12 h-12 bg-orange-500 text-black rounded-full shadow-lg`
- **Sheet:** `relative mt-auto bg-[#1A1A24] rounded-t-2xl border-t border-white/5 max-h-[80vh] overflow-y-auto p-5 pb-8`
- **Overlay:** `bg-black/50`

### 8.11 Presets

- **List:** `max-h-48 overflow-y-auto`
- **Item:** `px-3 py-2 rounded-lg hover:bg-white/5 group cursor-pointer`
- **Actions:** `opacity-0 group-hover:opacity-100 transition-opacity`
- **Save input:** `w-full h-10 px-3 text-sm bg-white/5 border border-white/10 rounded-lg`

### 8.12 Canvas Preview / Brush Preview

- **Preview:** `w-[512px] h-[512px] max-w-full max-h-[60vh] bg-[#1A1A24] rounded-xl overflow-hidden border border-white/10`
- **Brush preview:** `w-[256px] h-[256px] bg-[#1A1A24] rounded-xl border border-white/10 cursor-crosshair touch-none`
- **View mode buttons:** active = `bg-orange-500 text-black`, inactive = `bg-white/5 text-gray-400 border border-white/5`

### 8.13 Warning Banner

- `px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-400 gap-2`

### 8.14 Spinner

```tsx
<span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
```

### 8.15 File Uploader (drag-and-drop)

```tsx
className={cn(
  "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200",
  isDragOver
    ? "border-orange-400 bg-orange-500/5"
    : "border-white/10 hover:border-white/20 bg-white/[0.02]"
)}
```

### 8.16 Скелетон (загрузка)

```css
.skeleton {
  background: linear-gradient(90deg, #1A1A24 25%, #22222e 50%, #1A1A24 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

---

## 9. Логотип и брендинг

- **Logo:** `public/favicon.png` (56×56px), `rounded` (4px)
- **App name:** `BrushSpark`, `text-base font-bold`, system-ui 700
- **Header:** `h-14`, логотип + название слева, действия справа

---

## 10. Фокус-состояния (Accessibility)

Все интерактивные элементы (кнопки, инпуты, слайдеры, dropdown, FAB):
```tsx
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D14]
```

---

## 11. Скроллбар

```css
scrollbar-width: thin;
scrollbar-color: #1A1A24 transparent;
```

---

## 12. Анимации и переходы

| Тип | Применение |
|-----|------------|
| `transition-colors` | Кнопки, ссылки, hover-эффекты |
| `transition-all duration-200` | Узлы, drag-and-drop, модалки |
| `transition-all duration-150` | Элементы палитры, пресеты |
| `transition-transform duration-200` | Сайдбары (мобильные), CTA подъём |
| `transition-opacity` | Кнопка удаления, оверлеи |
| `animate-spin` | Spinner |
| `animate-pulse` | Скелетон редактора |
| `shimmer` (1.5s) | Скелетон страницы |

---

## 13. Watermark (Free tier)

- Текст: `"BrushSpark"`
- Цвет: `rgba(255,255,255,0.15)`
- Угол: `-30°`
- Размер: `max(14, w/20)` px
- Интервал: `fontSize * 3.5`

---

## 14. Export File Naming

- Файлы: `brushspark_{type}_{seed}_{resolution}.{ext}`
- Пресеты: `brushspark_preset_{name}.json`

---

## 15. Зависимости

| Пакет | Назначение |
|-------|------------|
| `tailwindcss` v4 | CSS-фреймворк |
| `@tailwindcss/vite` | Интеграция с Vite |
| `lucide-react` | Иконки |
| `clsx` + `tailwind-merge` | `cn()` для условных классов |
| `@headlessui/react` | Listbox, Dialog (доступность) |
