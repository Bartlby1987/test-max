# MAX Chat (GREEN-API)

Веб-чат для отправки и получения текстовых сообщений в мессенджере **MAX** через [GREEN-API](https://green-api.com/max).

Интерфейс выполнен по мотивам [web.max.ru](https://web.max.ru/): список чатов, диалог, адаптивная вёрстка для десктопа и мобильных, анимации появления сообщений и экранов.

## Возможности

- Вход по `idInstance` и `apiTokenInstance` из личного кабинета GREEN-API
- Создание чата по номеру телефона получателя
- Отправка текстовых сообщений (`SendMessage`)
- Получение входящих сообщений long-polling (`ReceiveNotification` + `DeleteNotification`)
- Локальное сохранение сессии и истории чатов в `localStorage`

## Требования

- Node.js 18+
- Авторизованный инстанс MAX в [личном кабинете GREEN-API](https://console.green-api.com/)
- В настройках инстанса должен быть **пустой** `webhookUrl` (получение через HTTP API), включены входящие уведомления

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте адрес из терминала (обычно `http://localhost:5173`).

В режиме разработки запросы к `https://api.green-api.com` идут через Vite proxy (`/green-api`), чтобы обойти CORS.

### Сборка

```bash
npm run build
npm run preview
```

## Как пользоваться

1. Введите `idInstance` и `apiTokenInstance` (при необходимости — `apiUrl` из консоли).
2. Нажмите «Новый чат» и укажите номер получателя в международном формате (РФ `7…` или РБ `375…`).
3. Отправьте текстовое сообщение.
4. Ответ из приложения MAX появится в диалоге автоматически.

## Деплой на Vercel

Проект готов к деплою: `vercel.json` проксирует `/green-api` → `https://api.green-api.com`.

1. Откройте [vercel.com/new](https://vercel.com/new)
2. Import репозиторий `Bartlby1987/test-max`
3. Framework Preset: **Vite** (определится сам)
4. Build Command: `npm run build`, Output: `dist`
5. Deploy → получите постоянный URL вида `https://test-max.vercel.app`

После каждого `git push` в `master` Vercel обновит сайт автоматически.

## Как проверить работоспособность

### 1. Данные GREEN-API (куда вставлять)

Войдите в [console.green-api.com](https://console.green-api.com/) → инстанс MAX → скопируйте:

| Поле на экране входа | Откуда взять |
| --- | --- |
| **idInstance** | номер инстанса (например `1101…`) |
| **apiTokenInstance** | токен доступа инстанса |
| **apiUrl** (опционально) | обычно `https://api.green-api.com` — можно не менять |

В настройках инстанса:

- `webhookUrl` — **оставьте пустым** (иначе ReceiveNotification не работает)
- включите получение входящих сообщений / `incomingWebhook`

### 2. Сценарий проверки

1. Откройте сайт на Vercel
2. Вставьте `idInstance` и `apiTokenInstance` → «Войти в чат»
3. «Новый чат» → номер получателя в формате `79991234567` (РФ) или `375…` (РБ)
4. Отправьте текст
5. Ответьте из приложения MAX на телефоне — ответ должен появиться в веб-чате

### 3. Типичные проблемы

- «Инстанс не авторизован» — пройдите авторизацию MAX в кабинете GREEN-API (QR)
- Сообщения не приходят — очистите `webhookUrl` и подождите ~1 минуту
- Номер не найден — у получателя должен быть аккаунт MAX

## Стек

- React 19 + TypeScript
- Vite 8
- Framer Motion

## API

Документация GREEN-API (MAX):

- [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/)
- [HTTP API получение уведомлений](https://green-api.com/v3/docs/api/receiving/technology-http-api/)
