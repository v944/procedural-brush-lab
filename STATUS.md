# BrushSpark — Статус проекта

## ✅ Сделано

### Фаза 0: Подготовка и архитектура
- [x] Vite + React 19 + TypeScript проект
- [x] Tailwind CSS v4 с кастомной тёмной темой (цвета из PRD)
- [x] Структура папок: `components/`, `hooks/`, `stores/`, `shaders/`, `utils/`, `types/`
- [x] Zustand store (текстура, параметры, seed, viewMode, plan, пресеты, экспорт)
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

### UI компоненты
- [x] Slider
- [x] Button (primary / secondary / ghost)
- [x] Dropdown (Headless UI Listbox)
- [x] Modal (Headless UI Dialog)
- [x] Paywall overlay → PricingModal
- [x] WarningBanner для WebGL2 fallback
- [x] Modal: Bottom sheet на мобильных (<768px)

### Экспорт
- [x] PNG export (всем, любой размер)
- [x] Procreate .brush (ZIP + plist + PNG + meta)
- [x] Photoshop .abr (базовый бинарный формат)
- [x] Прогресс-бар при экспорте
- [x] В fallback-режиме только PNG (512×1024, 1024×1024)
- [x] **Watermark** «BrushSpark» на PNG для Free-пользователей

### Пресеты
- [x] Save/Load/Delete в localStorage
- [x] Import/Export JSON
- [x] Модальное окно для имени пресета

### Оплата (USDT TRC-20)
- [x] Vercel Edge Functions: `api/crypto/config`, `api/crypto/verify`, `api/crypto/check`
- [x] Vercel KV (Upstash Redis) для хранения сессий и активаций
- [x] Проверка TRC-20 через TronScan API + Trongrid fallback
- [x] De-duplication транзакций (защита от повторного использования TxID)
- [x] Rate limiting на verify
- [x] PricingModal — оплата USDT (Pro $10, Lifetime $30)
- [x] QR-код для адреса кошелька
- [x] Verify с polling (15s) и timeout (120s)
- [x] Проверка статуса активации через `/api/crypto/check`
- [x] Zustand persist: `plan`, `sessionId` в localStorage
- [x] `syncPlanFromServer` — восстановление статуса Pro после перезагрузки
- [x] Paywall → PricingModal → Verify flow
- [x] Header: отображение Free/Pro/Lifetime с возможностью апгрейда

### Деплой
- [x] Проект на Vercel: https://brush-lab.vercel.app (будет BrushSpark)
- [x] Vercel KV (Upstash Redis) подключена
- [x] Environment variables: `USDT_ADDRESS`, `USDT_CONTRACT`, `APP_URL`, `KV_*`
- [x] CSP, HSTS, security headers в `vercel.json`
- [x] API endpoints работают (`/api/crypto/config`, `/api/crypto/verify`, `/api/crypto/check`)

### Баги (исправлены)
- [x] Шум исчезал при движении слайдера — накопление кадров из-за `gl.enable(BLEND)` без очистки
- [x] Bristles показывал одну щетинку — потеря точности float32 в хеш-функции при seed > 1000
- [x] Scales та же проблема с hash/random функциями
- [x] Slider debounce мог вызывать рассинхронизацию локального значения и стора (убран debounce)
- [x] WebGL canvas → toDataURL не работал (заменён на readPixels + offscreen FBO)
- [x] Перекомпиляция шейдера на каждый чих (теперь только при смене типа текстуры)

---

## ❌ Осталось / TODO

### Средний приоритет
- [ ] **Экспорт .brush и .abr** — протестировать в Procreate / Photoshop
- [ ] **Onboarding** — подсказки при первом запуске
- [ ] **Keyboard shortcuts** — Ctrl+Z для Brush Preview, R для Randomize
- [ ] **History / Undo** для параметров
- [ ] **2×2 Tile sync** — проверка шва через соседние тайлы в шейдере
- [ ] **Performance** — bristles 500×4 итераций может тормозить на слабых GPU
- [ ] **Analytics** — Google Analytics 4 события

### Низкий приоритет
- [ ] **HiDPI** — проверить canvas sizing на retina-дисплеях
- [ ] **Brush Preview pressure** — Pointer Events API pressure support
- [ ] **CSP .sut** — экспорт для Clip Studio Paint
- [ ] **Localization** — EN/RU переключатель
- [ ] **PWA** — Service Worker для offline
- [ ] **Receipt email** — отправка чека через Resend (адаптировать из image-pipeline)
- [ ] **Свой домен** — привязать к Vercel

---

## 📊 Метрики

| Метрика | Значение | Цель |
|---------|----------|------|
| Bundle size (gzip) | ~144 KB | <200 KB |
| Build time | ~5.5s | — |
| Типы текстур | 5 / 5 | 5 |
| Экспорт форматы | 3 / 3 | 3 |
| Пресеты | ✅ | — |
| Paywall + Оплата (USDT TRC-20) | ✅ | — |
| Watermark (Free) | ✅ | — |
| Mobile bottom sheet | ✅ | — |
| Canvas 2D fallback | ✅ | — |
| Vercel deploy | ✅ | — |

---

*Обновлено: 2026-07-13*
