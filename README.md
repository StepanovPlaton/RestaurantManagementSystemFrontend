# Food Rush — Frontend

Веб-клиент [Restaurant Management System](../README.md): Next.js, TypeScript, React, [shadcn/ui](https://ui.shadcn.com), [Feature-Sliced Design](https://feature-sliced.design).

## Стек

- **Next.js 16** (App Router, Turbopack)
- **React 19**, **TypeScript**
- **Tailwind CSS v4**, **shadcn/ui** (base-nova, neutral)
- **FSD** — слои в `src/`

## Быстрый старт

```bash
npm install
cp .env.example .env.local   # при необходимости
npm run dev
```

Приложение: [http://localhost:3000](http://localhost:3000).  
Backend API: `http://localhost:8080` (см. [documentation/README.md](../documentation/README.md)).

### Docker (полный стек с backend и nginx)

Из корня монорепо: [../README.md](../README.md#полный-стек-в-docker) — `docker compose up` поднимает frontend, API, PostgreSQL и отдаёт всё на `http://localhost`.

## Структура (FSD)

```text
src/
├── app/              # Next.js App Router (тонкие route-файлы)
├── application/      # FSD App: providers, инициализация
├── views/            # FSD Pages: композиции страниц (имя views — из‑за Next.js pages/)
├── widgets/          # Крупные блоки UI
├── features/         # Пользовательские сценарии
├── entities/         # Бизнес-сущности
└── shared/           # UI (shadcn), lib, api, config
```

### Правила импортов

1. Слой импортирует только из **нижележащих** слоёв (`views` → `widgets` → `features` → `entities` → `shared`).
2. Слайсы **одного слоя** не импортируют друг друга.
3. **Public API** слайса — через `index.ts` в корне слайса.
4. Next.js `src/app/*` — только маршрутизация; UI страниц — в `src/views/`.

### shadcn/ui

Компоненты CLI устанавливаются в `src/shared/ui/`:

```bash
npx shadcn@latest add <component>
```

Алиасы заданы в [`components.json`](components.json).

## Скрипты

| Команда        | Описание              |
| -------------- | --------------------- |
| `npm run dev`  | Dev-сервер (Turbopack)|
| `npm run build`| Production-сборка     |
| `npm run start`| Запуск production     |
| `npm run lint` | ESLint                |

## Roadmap реализации

Пошаговый план (API → entities → features → UI) с чеклистами по фазам: [ROADMAP.md](./ROADMAP.md). После реализации задач — отмечать `[x]` в roadmap (см. `.cursor/rules/roadmap-progress.mdc`).

Стек (кратко): `HttpService` (fetch) → классы `*Service` по сущностям; **SWR** — серверные данные; **Zustand** (+ persist) — корзина; **Zod** — ответы API и валидация форм (без react-hook-form). UI — макеты из `documentation/пояснительная-записка/assets/`, компоненты из `src/shared/ui/`.

## Документация продукта

- [Роли и экраны](../documentation/roles/)
- [API](../documentation/api/)
- [Обзор продукта](../documentation/product/overview.md)
