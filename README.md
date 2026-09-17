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

## Стек

- React 19 + TypeScript
- Vite 8
- Framer Motion

## API

Документация GREEN-API (MAX):

- [SendMessage](https://green-api.com/v3/docs/api/sending/SendMessage/)
- [HTTP API получение уведомлений](https://green-api.com/v3/docs/api/receiving/technology-http-api/)
