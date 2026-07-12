# Procedural Brush Lab — Статус проекта

## ✅ Сделано

### Фаза 0: Подготовка и архитектура
- [x] Vite + React 19 + TypeScript проект
- [x] Tailwind CSS v4 с кастомной тёмной темой (цвета из PRD)
- [x] Структура папок: `components/`, `hooks/`, `stores/`, `shaders/`, `utils/`, `types/`
- [x] Zustand store (текстура, параметры, seed, viewMode, Pro, пресеты, экспорт)
- [x] WebGL2 холст с разделением компиляции шейдера и обновления uniforms
- [x] Canvas 2D fallback для браузеров без WebGL2 (все 5 типов текстур)
- [x] Автоопределение WebGL2 + WarningBanner при отсутствии
- [x] `readTexture()` — универсальная, работает через WebGL2 или Canvas 2D

### Фаза 1: Процедурные текстуры (ядро)
- [x] **Noise (Smoke/Mist)** — Simplex Noise + fBm (octaves, lacunarity, gain)
- [x] **Grunge/Dirt** — Value Noise + Domain Warping
- [x] **Bristles/Hair** — 500 линий с random seed, angle variance, seamless replication
- [x] **Scales/Blobs (Voronoi)** — Worley noise с edge detection
- [x] **Cracks** — Grid + Perlin noise distortion, seamless neighbor sampling
- [x] Seamless tiling (toroidal mapping + periodic wrapping структурных текстур)
- [x] Режимы: Single, 2×2 Tile, Brush Preview (stamp method, pointer events)
- [x] Починена точность хеш-функций в шейдерах (`mod(p + seed, 1000)`)
- [x] Починен баг накопления кадров (`gl.clear` с цветом фона перед рендером)

### UI компоненты
- [x] Slider (50ms debounce was removed, теперь instant)
- [x] Button (primary / secondary / ghost)
- [x] Dropdown (Headless UI Listbox)
- [x] Modal (Headless UI Dialog)
- [x] Paywall overlay
- [x] WarningBanner для WebGL2 fallback

### Экспорт
- [x] PNG export (всем, любой размер)
- [x] Procreate .brush (ZIP + plist + PNG + meta)
- [x] Photoshop .abr (базовый бинарный формат)
- [x] Прогресс-бар при экспорте
- [x] В fallback-режиме только PNG (512×1024, 1024×1024)

### Пресеты
- [x] Save/Load/Delete в localStorage
- [x] Import/Export JSON
- [x] Модальное окно для имени пресета

### Баги (исправлены)
- [x] Шум исчезал при движении слайдера — накопление кадров из-за `gl.enable(BLEND)` без очистки
- [x] Bristles показывал одну щетинку — потеря точности float32 в хеш-функции при seed > 1000
- [x] Scales та же проблема с hash/random функциями
- [x] Slider debounce мог вызывать рассинхронизацию локального значения и стора (убран debounce)
- [x] WebGL canvas → toDataURL не работал (заменён на readPixels + offscreen FBO)
- [x] Перекомпиляция шейдера на каждый чих (теперь только при смене типа текстуры)

---

## ❌ Осталось / TODO

### Высокий приоритет
- [ ] **Экспорт .brush и .abr** — протестировать, что реально открывается в Procreate / Photoshop
- [ ] **Watermark** на PNG для Free-пользователей (текст или лого поверх текстуры)
- [ ] **Stripe Checkout** — реальная оплата (сейчас локальный toggle `setPro(true)`)
- [ ] **Mobile адаптив** — коллапсируемая панель на <768px

### Средний приоритет
- [ ] **Onboarding** — подсказки при первом запуске
- [ ] **Keyboard shortcuts** — Ctrl+Z для Brush Preview, R для Randomize
- [ ] **History / Undo** для параметров
- [ ] **2×2 Tile sync** — сейчас tileMode рендерит 2x поверх UV, но нужно чтобы шов реально проверялся
- [ ] **Performance** — bristles 500×4 итераций может тормозить на слабых GPU (optimize или снизить лимит)
- [ ] **Analytics** — Google Analytics 4 события

### Низкий приоритет
- [ ] **HiDPI** — проверить canvas sizing на retina-дисплеях
- [ ] **Brush Preview pressure** — Pointer Events API pressure support
- [ ] **CSP .sut** — экспорт для Clip Studio Paint
- [ ] **Localization** — EN/RU переключатель
- [ ] **PWA** — Service Worker для offline

---

## 📊 Метрики

| Метрика | Значение | Цель |
|---------|----------|------|
| Bundle size (gzip) | ~141 KB | <200 KB |
| Build time | ~350ms | — |
| Типы текстур | 5 / 5 | 5 |
| Экспорт форматы | 3 / 3 | 3 |
| Пресеты | ✅ | — |
| Paywall | ✅ (UI) | — |
| Stripe | ❌ | — |
| Canvas 2D fallback | ✅ | — |

---

*Обновлено: 2026-07-12*
