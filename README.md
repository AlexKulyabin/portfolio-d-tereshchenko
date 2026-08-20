# Сайт услуг: оценка профрисков, нормирование труда, ХАССП

Сайт эксперта по охране труда и пищевой безопасности с админкой для самостоятельного
редактирования содержимого. Три посадочные страницы под рекламу в Яндекс.Директе,
форма заявки, Яндекс.Метрика.

## Как это работает в двух словах

Контент хранится в Firestore и редактируется через админку на `/admin`. При публикации
он выкладывается файлом в Firebase Storage — оттуда его читает сайт. При сборке этот же
файл запекается прямо в HTML, поэтому посетитель и поисковый робот видят текст
мгновенно, без ожидания JavaScript.

Подробнее — [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Документация

| Документ | О чём |
| --- | --- |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Как устроен проект и почему принято именно так |
| [FIREBASE.md](docs/FIREBASE.md) | Настройка Firebase с нуля и развёртывание |
| [FIREBASE-PUBLICATION.md](docs/FIREBASE-PUBLICATION.md) | Подключение домена, права администратора и публикация контента |
| [DOMAIN-REG-RU.md](docs/DOMAIN-REG-RU.md) | Инструкция заказчику: DNS-записи в Reg.ru |
| [GMAIL-SMTP.md](docs/GMAIL-SMTP.md) | Уведомления о новых заявках на Gmail |
| [SEO.md](docs/SEO.md) | Карта запросов, AI-поиск, индексация и регулярное продвижение |
| [ADMIN.md](docs/ADMIN.md) | Инструкция по админке — для заказчика, без терминов |
| [LAUNCH.md](docs/LAUNCH.md) | Чек-лист запуска: домен, Метрика, Вебмастер, Директ |
| [PERSONAL-DATA.md](docs/PERSONAL-DATA.md) | Персональные данные: что обязательно сделать |
| [BRIEF.md](docs/BRIEF.md) | Что нужно получить от заказчика |
| [PLAN.md](docs/PLAN.md) | Исходный план работ |

## Быстрый старт

```bash
npm install
```

Скопируйте `.env.example` в `.env.local` и заполните — как получить значения,
написано в [docs/FIREBASE.md](docs/FIREBASE.md).

```bash
npm run dev
```

Сайт откроется на `http://localhost:5173`, админка — на `/admin`.

Без настроенного Firebase сайт всё равно запустится: он покажет стартовое наполнение
из `src/content/default.ts`, а админка сообщит, что не подключена.

## Разработка на эмуляторах

Чтобы работать с админкой, не трогая боевую базу, поставьте в `.env.local`
`VITE_USE_EMULATORS=true` и запустите в отдельном терминале:

```bash
npm run emulators
```

Понадобится Java. Интерфейс эмуляторов — `http://127.0.0.1:4000`.

Создать администратора в эмуляторе (пароль задайте свой):

```bash
curl -s -X POST "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key" -H "Content-Type: application/json" -d '{"email":"admin@example.ru","password":"ВАШ_ПАРОЛЬ","returnSecureToken":true}'
```

Затем выдайте ему права администратора, подставив полученный `localId`:

```bash
curl -s -X POST "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:update" -H "Authorization: Bearer owner" -H "Content-Type: application/json" -d '{"localId":"ПОДСТАВЬТЕ_localId","customAttributes":"{\"admin\":true}"}'
```

## Команды

| Команда | Что делает |
| --- | --- |
| `npm run dev` | Сервер разработки |
| `npm run build` | Сборка: свежий контент → статика → пререндер → sitemap |
| `npm run build:offline` | То же, но без обращения к Firebase |
| `npm run preview` | Локальный просмотр собранного сайта |
| `npm run typecheck` | Проверка типов |
| `npm run emulators` | Локальные Firebase-эмуляторы |
| `npm --prefix functions test` | Проверка формирования писем о заявках |
| `npm run deploy` | Сборка и публикация сайта, правил и Functions на Firebase |

## Структура

```
src/
├── admin/            Админка: авторизация, редакторы, публикация
│   ├── components/   Поля форм и повторяемые блоки
│   ├── lib/          Хранилище черновика и загрузка изображений
│   └── pages/        Экраны: обзор, главная, услуги, эксперт, настройки, заявки
├── components/
│   ├── layout/       Шапка, подвал, липкая панель на мобильных
│   ├── sections/     Блоки страниц: первый экран, тарифы, форма и прочие
│   └── ui/           Кнопки, секции, аккордеон, появление при прокрутке
├── content/          Стартовое наполнение сайта
├── lib/              Firebase, контент, аналитика, микроразметка, мета-теги
├── pages/            Страницы сайта
├── schemas/          Схемы данных — источник правды для типов и валидации
└── styles/           Дизайн-система и шрифты

scripts/              Выгрузка контента, пререндер, sitemap
functions/            Cloud Function: письмо о новой заявке через Gmail SMTP
docs/                 Документация
```

## Технологии

React 19, TypeScript, Tailwind CSS 4, Vite 8, React Router 7, Zod 4, Firebase
(Hosting, Firestore, Authentication, Storage, Cloud Functions), Nodemailer / Gmail SMTP.
Пререндер — собственный, около 50 строк в `scripts/prerender.mjs`.
