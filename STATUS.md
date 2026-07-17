# BrushSpark — Статус проекта

## ✅ Сделано

### Фаза 0: Подготовка и архитектура
- [x] Vite + React 19 + TypeScript проект
- [x] Tailwind CSS v4 с кастомной тёмной темой
- [x] Структура папок: `components/`, `hooks/`, `stores/`, `shaders/`, `utils/`, `types/`, `lib/`
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

### Дизайн-система (BrushSparkDESIGN.md)
- [x] Акцентный цвет: Orange `#F97316`
- [x] Только тёмная тема, фон `#0D0D14`
- [x] Шрифт: system-ui, -apple-system (sans) + JetBrains Mono (mono)
- [x] `cn()` — утилита (`clsx` + `tailwind-merge`)
- [x] Header `h-14` с логотипом 36×36px, `text-base`
- [x] Панель: `bg-bg-sidebar` (`#0D0D12`), разделители `border-white/5`
- [x] Section headings: `text-xs uppercase tracking-wider`
- [x] Кнопки: orange-500, hover с тенью `shadow-[0_8px_25px_rgba(249,115,22,0.5)]`
- [x] Фокус-кольца `focus-visible:ring-2 focus-visible:ring-orange-400/70` на всех интерактивных элементах
- [x] Кастомный скроллбар (thin, `#1A1A24`)
- [x] Скелетон с shimmer-анимацией
- [x] Бейджи: Pro (orange), Lifetime (amber), Free (gray)

### UI компоненты
- [x] Slider (orange accent thumb)
- [x] Button (primary / secondary / ghost) с orange-акцентом
- [x] Dropdown (Headless UI Listbox)
- [x] Modal (Headless UI Dialog) с `bg-black/50 backdrop-blur-sm`
- [x] Paywall overlay → PricingModal
- [x] WarningBanner для WebGL2 fallback
- [x] Bottom sheet на мобильных (`<768px`)

### Экспорт (v1)
- [x] PNG export (всем, любой размер)
- [x] Procreate .brush (ZIP + plist + Grain.png + Thumbnail)
- [x] Photoshop .abr (формат ABR v2, проверен — Photoshop принял)
- [x] Watermark «BrushSpark» на PNG для Free-пользователей
- [x] Прогресс-бар при экспорте
- [x] В fallback-режиме только PNG (512×1024, 1024×1024)

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
- [x] Zustand persist: `plan`, `sessionId` в localStorage
- [x] `syncPlanFromServer` — восстановление статуса Pro после перезагрузки
- [x] Paywall → PricingModal → Verify flow
- [x] Header: отображение Free/Pro/Lifetime с возможностью апгрейда
- [x] Локальный dev: авто-Lifetime при `localhost`

### Деплой и инфраструктура
- [x] Проект на Vercel: https://brush-lab.vercel.app
- [x] Vercel KV (Upstash Redis) подключена
- [x] Environment variables: `USDT_ADDRESS`, `USDT_CONTRACT`, `APP_URL`, `KV_*`
- [x] CSP, HSTS, security headers в `vercel.json`
- [x] API endpoints работают (`/api/crypto/config`, `/api/crypto/verify`, `/api/crypto/check`)
- [x] GitHub: https://github.com/v944/procedural-brush-lab
- [x] Ярлыки на рабочем столе: **BrushSpark** (запуск) / **BrushSpark Stop** (остановка)

### Баги (исправлены, Фаза 2)
- [x] Шум исчезал при движении слайдера — накопление кадров из-за `gl.enable(BLEND)` без очистки
- [x] Bristles показывал одну щетинку — потеря точности float32 в хеш-функции при seed > 1000
- [x] Scales та же проблема с hash/random функциями
- [x] Slider debounce мог вызывать рассинхронизацию (убран debounce)
- [x] WebGL canvas → toDataURL не работал (заменён на readPixels + offscreen FBO)
- [x] Перекомпиляция шейдера на каждый чих (теперь только при смене типа текстуры)
- [x] ABR v6.2 не открывался в Photoshop — переписан на ABR v2
- [x] .brush — добавлен Grain.png (grayscale inverted), Thumbnail, исправлены ключи plist
- [x] `uniform int` vs `gl.uniform1f` mismatch — шейдер не получал `u_shape`/`u_noiseType`, всегда round/simplex
- [x] Круглая кисть выходила за границы preview при низкой hardness — адаптивный радиус `0.5 - edgeWidth`
- [x] `_readTipFn` singleton сбрасывался при размонтировании ProceduralSettingsPanel — `{ primary: false }` для второстепенных экземпляров
- [x] StrokePreview не обновлялся при изменении procedural-настроек — добавлен `settings.procedural` в зависимости useEffect

---

### Фаза 2: Brush Tip Generator + Stroke Preview (v2) 🆕

#### Brush Tip Core
- [x] **SDF WebGL шейдер** — `brushTip.ts` (brush-tip.frag): `sdCircle` / `sdBox`, `rotate2D`, hardness (smoothstep edge), roundness (scale Y), angle
- [x] **5 типов формы**: Round, Square, Soft Round, Soft Square, Procedural
- [x] **Simplex noise** в шейдере (Ashima Arts) + Value noise + Worley fallback
- [x] **Procedural shapes**: base circle + noise distortion → smoothstep threshold
- [x] **TipPreview** — 128×128 WebGL canvas с overlay-линиями (angle line + roundness ellipse)
- [x] **BrushTipShapeSelector** — 5 кнопок (Round/Square/SoftR/SoftS/Proc) с orange active state
- [x] **AnglePicker** — 48px circular drag widget, conic active sector, handle
- [x] **Zustand store** (`brushTipStore.ts`) — persist в localStorage (`brushspark-tip-settings`)
- [x] **Параметры**: Diameter (1-2500), Hardness (0-1), Roundness (0.01-1), Angle (-180-180), Spacing (1-1000)

#### Procedural Settings
- [x] **Noise Type** — Simplex / Value / Worley (3 кнопки)
- [x] **Noise Amount** (0-100%), **Noise Scale** (0.1-10), **Threshold** (0.1-0.9), **Smoothing** (0-100%)
- [x] **Seed** — number input + 🎲 randomize + Randomize All + Reset to Defaults
- [x] **Preview окно** в секции Procedural Brush Tip Shape (слева, 128×128)

#### Shape Dynamics
- [x] Size Jitter + Control (Off/Fade/Pressure/Tilt/Direction)
- [x] Minimum Diameter (1-100%)
- [x] Angle Jitter + Control
- [x] Roundness Jitter + Minimum Roundness
- [x] Flip X / Flip Y Jitter

#### Scattering
- [x] Scatter (0-1000%) + Both Axes toggle
- [x] Count (1-10) + Count Jitter (0-100%)

#### Transfer
- [x] Opacity Jitter + Control + Minimum
- [x] Flow Jitter + Control + Minimum

#### Stroke Preview Engine
- [x] **BrushStrokeRenderer** — Canvas2D stamp engine с spacing interpolation
- [x] **StrokePreviewCanvas** — pointer events (pressure-sensitive), Auto Stroke, Clear, Undo
- [x] **SeededRandom** (mulberry32) для воспроизводимых джиттеров
- [x] **History / Undo** — 20 последних состояний стека
- [x] **Pressure simulation** — slider 0-1 для тестов без планшета
- [x] **Stroke Save** — кнопка "Save PNG" экспорт мазка

#### Layout 3-колонки (v2)
- [x] **Левый столбец** (340px): Tip Panel → Texture → Dynamics → Scattering → Transfer → Export → Presets
- [x] **Центр** (flex-1): TipPreview → Canvas Preview
- [x] **Правый столбец** (420px): Stroke Preview
- [x] Адаптивность: 3 колонки ≥1024px, мобильный bottom sheet

#### Экспорт (v2)
- [x] **Combined PNG** (Tip × Texture multiply compositing)
- [x] **Brush Tip ABR** — экспорт формы кисти как ABR v2
- [x] **BrushMeta JSON** — полный round-trip (tip + dynamics + texture)
- [x] **`readTip()`** — глобальная функция чтения tip из WebGL на любой resolution
- [x] ExportPanel — 4 режима: Combined / Texture Only / Brush Tip (.abr) / BrushMeta JSON

#### UI Components (v2)
- [x] SliderWithInput — range slider + numeric input
- [x] Toggle — switch (orange accent)
- [x] CollapsibleSection — секция с chevron (Dynamics, Scattering, Transfer)
- [x] HiDPI — devicePixelRatio scaling на stroke canvas
- [x] Ctrl+Z — undo stroke

---

## ❌ Осталось / TODO

### Средний приоритет
- [ ] **Экспорт .brush** — протестировать в Procreate (нет доступа, iOS only)
- [ ] **Onboarding** — подсказки при первом запуске
- [ ] **Keyboard shortcut R** — Randomize procedural seed
- [ ] **Offscreen canvas для tip** — скрытый WebGL canvas для экспорта
- [ ] **2×2 Tile sync** — проверка шва через соседние тайлы в шейдере
- [ ] **Performance** — bristles 500×4 итераций может тормозить на слабых GPU
- [ ] **Analytics** — Google Analytics 4

### Низкий приоритет
- [ ] **CSP .sut** — экспорт для Clip Studio Paint
- [ ] **Localization** — EN/RU переключатель
- [ ] **PWA** — Service Worker для offline
- [ ] **Receipt email** — чеки через Resend
- [ ] **Свой домен** — привязать к Vercel

---

## 📊 Метрики

| Метрика | Значение | Цель |
|---------|----------|------|
| Bundle CSS (gzip) | ~6.9 KB | — |
| Bundle JS (gzip) | ~163 KB | <200 KB |
| Build time | ~410ms | — |
| Типы текстур | 5 / 5 | 5 |
| Brush Tip shapes | 5 / 5 | 5 |
| Экспорт форматы | 5 / 5 | 5 (PNG, ABR, .brush, combined, .brushmeta) |
| Пресеты | ✅ | — |
| Paywall + USDT (TRC-20) | ✅ | — |
| Watermark (Free) | ✅ | — |
| Mobile bottom sheet | ✅ | — |
| Canvas 2D fallback | ✅ | — |
| Vercel deploy | ✅ | — |
| ABR (Photoshop) | ✅ | — |
| Дизайн-система v2 | ✅ | — |
| Brush Tip Generator | ✅ | — |
| Stroke Preview | ✅ | — |
| Shape Dynamics | ✅ | — |
| Scattering / Transfer | ✅ | — |

---

*Обновлено: 2026-07-17*
