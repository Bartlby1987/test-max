# MAX Chat — GREEN-API

Веб-клиент для **отправки и получения текстовых сообщений** в мессенджере [MAX](https://max.ru/) через сервис [GREEN-API](https://green-api.com/max).

Интерфейс сделан по мотивам [web.max.ru](https://web.max.ru/): список чатов, диалог, адаптивная вёрстка (десктоп / мобильный), анимации, валидация телефона и уведомления (toast).

| | |
| --- | --- |
| **Репозиторий** | https://github.com/Bartlby1987/test-max |
| **Демо (Vercel)** | https://test-max-beta.vercel.app |
| **PDF: локальный запуск** | [docs/MAX-Chat-Инструкция-локальный-запуск.pdf](docs/MAX-Chat-Инструкция-локальный-запуск.pdf) |
| **Стек** | React 19, TypeScript, Vite 8, Framer Motion |

---

## Содержание

1. [Возможности](#возможности)
2. [Требования](#требования)
3. [Настройка GREEN-API](#настройка-green-api)
4. [Локальный запуск](#локальный-запуск)
5. [Сборка production](#сборка-production)
6. [Как пользоваться чатом](#как-пользоваться-чатом)
7. [Проверка работоспособности](#проверка-работоспособности)
8. [Деплой на Vercel](#деплой-на-vercel)
9. [Структура проекта](#структура-проекта)
10. [Используемые методы API](#используемые-методы-api)
11. [Типичные проблемы](#типичные-проблемы)

---

## Возможности

- Вход по учётным данным инстанса GREEN-API: `idInstance`, `apiTokenInstance`, `apiUrl`
- Создание чата по номеру телефона (РФ `+7`, РБ `+375`) с маской ввода и валидацией
- Отправка текстовых сообщений (метод `SendMessage`)
- Получение входящих сообщений long-polling (`ReceiveNotification` + `DeleteNotification`)
- При входе приложение пытается само включить входящие уведомления (`SetSettings`: `incomingWebhook=yes`, пустой `webhookUrl`)
- История чатов и сессия хранятся в `localStorage` браузера
- Адаптивный UI, анимации, toast-алерты об ошибках и успехе

---

## Требования

- **Node.js** 18 или новее (рекомендуется 20+)
- **npm** 9+
- Аккаунт [GREEN-API](https://console.green-api.com/) с инстансом **MAX**
- Инстанс в статусе **Авторизован** (QR в кабинете)
- У получателя должен быть аккаунт MAX

---

## Настройка GREEN-API

1. Откройте [console.green-api.com](https://console.green-api.com/)
2. Выберите инстанс MAX
3. Скопируйте параметры:

| Параметр | Пример | Куда вставлять в чате |
| --- | --- | --- |
| `idInstance` | `310022739191` | поле **idInstance** |
| `apiTokenInstance` | длинный токен | поле **apiTokenInstance** |
| `apiUrl` | `https://3100.api.green-api.com` | поле **apiUrl** (обязательно точный адрес из кабинета) |

4. В настройках инстанса:

| Настройка | Значение |
| --- | --- |
| **Адрес отправки уведомлений (webhook URL)** | **пусто** (ничего не вписывать) |
| **Получать уведомления о входящих сообщениях и файлах** | **Да** |

> Получение сообщений в этом проекте идёт по технологии **HTTP API**, а не webhook.  
> Если в webhook URL указать любой адрес, `ReceiveNotification` перестанет отдавать очередь.

---

## Локальный запуск

### 1. Клонирование

```bash
git clone git@github.com:Bartlby1987/test-max.git
cd test-max
```

или через HTTPS:

```bash
git clone https://github.com/Bartlby1987/test-max.git
cd test-max
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Запуск dev-сервера

```bash
npm run dev
```

В терминале появится адрес, обычно:

```text
http://localhost:5173
```

Откройте его в браузере.

### 4. Вход в чат

На экране входа заполните `idInstance`, `apiTokenInstance` и **точный** `apiUrl` из кабинета (например `https://3100.api.green-api.com`).

Запросы к GREEN-API идут **напрямую из браузера** (у API включён CORS).

---

## Сборка production

```bash
npm run build
npm run preview
```

- `build` — собирает статику в папку `dist/`
- `preview` — локально показывает production-сборку

---

## Как пользоваться чатом

1. Войдите с данными инстанса GREEN-API
2. Нажмите **«Новый чат»**
3. Выберите страну (**RU +7** / **BY +375**) и введите номер получателя  
   (можно вставить номер целиком из буфера)
4. Напишите текст и отправьте (Enter или кнопка отправки)
5. Получатель отвечает в приложении **MAX** на телефоне
6. Ответ появляется в веб-чате автоматически

---

## Проверка работоспособности

### Чеклист

1. Инстанс **Авторизован**
2. `webhookUrl` **пустой**
3. Входящие уведомления **включены**
4. В чате указан правильный `apiUrl` из кабинета
5. Номер получателя существует в MAX
6. Сообщение отправлено с сайта → ответ из MAX

### Ожидаемый результат (по ТЗ)

- Пользователь вводит учётные данные GREEN-API  
- Создаёт чат по номеру телефона  
- Отправляет текст в MAX  
- Получает ответ получателя в веб-интерфейсе  

---

## Деплой на Vercel

Онлайн-версия: **https://test-max-beta.vercel.app**

### Через GitHub

1. Откройте [vercel.com/new](https://vercel.com/new)
2. Import репозиторий `Bartlby1987/test-max`
3. Framework: **Vite** (определяется автоматически)
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Deploy

После `git push` в `master` сайт обновляется автоматически (если репозиторий подключён к проекту Vercel).

### Через CLI

```bash
npx vercel --prod
```

---

## Структура проекта

```text
test-max/
├── public/                 # favicon и статика
├── src/
│   ├── api/greenApi.ts     # вызовы GREEN-API
│   ├── components/         # UI: auth, чаты, тосты, телефон
│   ├── hooks/              # состояние чатов, toast
│   ├── types/              # TypeScript-типы
│   ├── utils/              # телефон, валидация
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
├── vercel.json
└── README.md
```

---

## Используемые методы API

| Метод | Назначение |
| --- | --- |
| [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/) | отправка текста |
| [ReceiveNotification](https://green-api.com/v3/docs/api/receiving/technology-http-api/ReceiveNotification/) | получение уведомления из очереди |
| [DeleteNotification](https://green-api.com/v3/docs/api/receiving/technology-http-api/DeleteNotification/) | подтверждение обработки |
| [CheckAccount](https://green-api.com/v3/docs/api/service/CheckAccount/) | проверка номера / получение `chatId` |
| [SetSettings](https://green-api.com/v3/docs/api/account/SetSettings/) | включение `incomingWebhook`, очистка webhook URL |

Документация HTTP API:  
https://green-api.com/v3/docs/api/receiving/technology-http-api/

---

## Типичные проблемы

| Симптом | Что проверить |
| --- | --- |
| `NOT_FOUND` / ошибка Vercel в тосте | Неверный или пустой `apiUrl`. Укажите точный адрес из кабинета, например `https://3100.api.green-api.com`. Выйдите и войдите снова. |
| Сообщения не приходят | `webhookUrl` должен быть **пустым**; входящие уведомления — **Да**. После `SetSettings` подождите 1–2 минуты. |
| Инстанс не авторизован | В кабинете GREEN-API отсканируйте QR для MAX. |
| Аккаунт MAX не найден | У номера нет MAX, либо неверный формат (нужны РФ/РБ). |
| Не отправляется | Проверьте токен, лимиты тарифа и статус инстанса. |

---

## Скрипты npm

| Команда | Описание |
| --- | --- |
| `npm run dev` | локальная разработка |
| `npm run build` | production-сборка |
| `npm run preview` | просмотр сборки |
| `npm run lint` | проверка кода (oxlint) |

---

## Лицензия / назначение

Учебное / тестовое задание на должность Frontend-разработчик React (GREEN-API / MAX).
