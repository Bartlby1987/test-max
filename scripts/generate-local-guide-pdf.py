#!/usr/bin/env python3
"""Generate a polished PDF guide for local project launch."""

from pathlib import Path

from fpdf import FPDF

OUT = Path("/home/bartlby/Загрузки/MAX-Chat-Инструкция-локальный-запуск.pdf")
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# MAX brand-ish palette
PURPLE = (71, 26, 255)
PURPLE_DARK = (110, 26, 255)
INK = (22, 27, 46)
MUTED = (102, 112, 140)
LINE = (230, 232, 240)
SOFT = (244, 246, 251)
WHITE = (255, 255, 255)


class GuidePDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("DejaVu", "", 9)
        self.set_text_color(*MUTED)
        self.cell(0, 8, "MAX Chat · GREEN-API — локальный запуск", align="L")
        self.ln(4)
        self.set_draw_color(*LINE)
        self.line(20, self.get_y(), 190, self.get_y())
        self.ln(8)

    def footer(self):
        self.set_y(-16)
        self.set_font("DejaVu", "", 8)
        self.set_text_color(*MUTED)
        self.cell(0, 8, f"стр. {self.page_no()}/{{nb}}", align="C")

    def h1(self, text: str):
        self.set_font("DejaVu", "B", 16)
        self.set_text_color(*PURPLE)
        self.multi_cell(0, 9, text)
        self.ln(2)

    def h2(self, text: str):
        self.ln(2)
        self.set_font("DejaVu", "B", 12)
        self.set_text_color(*INK)
        self.multi_cell(0, 7, text)
        self.ln(1)

    def body(self, text: str):
        self.set_font("DejaVu", "", 10)
        self.set_text_color(*INK)
        self.multi_cell(0, 6, text)
        self.ln(1)

    def muted(self, text: str):
        self.set_font("DejaVu", "", 9)
        self.set_text_color(*MUTED)
        self.multi_cell(0, 5.5, text)
        self.ln(1)

    def bullet(self, text: str):
        self.set_font("DejaVu", "", 10)
        self.set_text_color(*INK)
        x = self.get_x()
        self.cell(6, 6, "•")
        self.multi_cell(0, 6, text)
        self.set_x(x)
        self.ln(0.5)

    def code_block(self, lines: str):
        self.ln(1)
        start_y = self.get_y()
        self.set_fill_color(*SOFT)
        self.set_draw_color(*LINE)
        # estimate height
        self.set_font("DejaVu", "", 9)
        text = lines.strip("\n")
        # draw background via multi_cell with fill
        self.set_text_color(*INK)
        self.set_x(20)
        self.multi_cell(170, 5.5, text, border=0, fill=True)
        self.ln(3)

    def callout(self, title: str, text: str):
        self.ln(1)
        self.set_fill_color(235, 232, 255)
        self.set_draw_color(*PURPLE)
        x, y = 20, self.get_y()
        self.set_xy(x, y)
        self.set_font("DejaVu", "B", 10)
        self.set_text_color(*PURPLE)
        self.multi_cell(170, 6, title, fill=True)
        self.set_x(x)
        self.set_font("DejaVu", "", 9)
        self.set_text_color(*INK)
        self.multi_cell(170, 5.5, text, fill=True)
        self.ln(3)

    def cover(self):
        # gradient-like bands
        self.set_fill_color(*PURPLE)
        self.rect(0, 0, 210, 95, "F")
        self.set_fill_color(*PURPLE_DARK)
        self.rect(0, 70, 210, 40, "F")

        self.set_y(28)
        self.set_font("DejaVu", "B", 28)
        self.set_text_color(*WHITE)
        self.cell(0, 14, "MAX Chat", align="C", ln=True)
        self.set_font("DejaVu", "", 13)
        self.cell(0, 8, "GREEN-API · мессенджер MAX", align="C", ln=True)
        self.ln(4)
        self.set_font("DejaVu", "B", 14)
        self.cell(0, 8, "Инструкция по локальному запуску", align="C", ln=True)

        self.set_y(120)
        self.set_text_color(*INK)
        self.set_font("DejaVu", "", 11)
        self.multi_cell(
            0,
            7,
            "Краткая и полная инструкция: как клонировать репозиторий, "
            "установить зависимости, запустить проект на своём компьютере "
            "и войти с учётными данными GREEN-API.",
            align="C",
        )
        self.ln(8)
        self.set_font("DejaVu", "", 10)
        self.set_text_color(*MUTED)
        for line in (
            "Репозиторий: https://github.com/Bartlby1987/test-max",
            "Демо: https://test-max-beta.vercel.app",
            "Стек: React 19 · TypeScript · Vite 8 · Framer Motion",
        ):
            self.cell(0, 7, line, align="C", ln=True)

        self.set_y(250)
        self.set_font("DejaVu", "", 9)
        self.set_text_color(*MUTED)
        self.cell(0, 6, "Тестовое задание · Frontend React · GREEN-API", align="C")


def build():
    pdf = GuidePDF(orientation="P", unit="mm", format="A4")
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_font("DejaVu", "", FONT, uni=True)
    pdf.add_font("DejaVu", "B", FONT_BOLD, uni=True)
    pdf.set_margins(20, 20, 20)

    # Cover
    pdf.add_page()
    pdf.cover()

    # Content
    pdf.add_page()
    pdf.h1("1. Что понадобится")
    pdf.bullet("Node.js 18+ (лучше 20+) и npm")
    pdf.bullet("Git")
    pdf.bullet("Аккаунт GREEN-API с авторизованным инстансом MAX")
    pdf.bullet("Браузер (Chrome / Firefox / Edge)")
    pdf.ln(1)
    pdf.muted(
        "Проверить Node:  node -v\n"
        "Проверить npm:   npm -v\n"
        "Проверить Git:   git --version"
    )

    pdf.h1("2. Клонирование проекта")
    pdf.body("Откройте терминал и выполните:")
    pdf.code_block(
        "git clone git@github.com:Bartlby1987/test-max.git\n"
        "cd test-max"
    )
    pdf.body("Или через HTTPS:")
    pdf.code_block(
        "git clone https://github.com/Bartlby1987/test-max.git\n"
        "cd test-max"
    )

    pdf.h1("3. Установка зависимостей")
    pdf.code_block("npm install")
    pdf.body(
        "Команда скачает React, Vite, Framer Motion и остальные пакеты "
        "в папку node_modules. Первый запуск может занять 1–3 минуты."
    )

    pdf.h1("4. Запуск в режиме разработки")
    pdf.code_block("npm run dev")
    pdf.body(
        "Vite поднимет локальный сервер. В терминале появится адрес вида:"
    )
    pdf.code_block("➜  Local:   http://localhost:5173/")
    pdf.body("Откройте эту ссылку в браузере — должен загрузиться экран входа MAX Chat.")

    pdf.h1("5. Данные для входа (GREEN-API)")
    pdf.body(
        "В личном кабинете https://console.green-api.com/ откройте инстанс MAX "
        "и скопируйте параметры на экран входа приложения:"
    )
    pdf.bullet("idInstance — номер инстанса")
    pdf.bullet("apiTokenInstance — токен доступа")
    pdf.bullet("apiUrl — точный адрес API, например https://3100.api.green-api.com")
    pdf.callout(
        "Важно про apiUrl",
        "Берите значение именно из кабинета. Общий https://api.green-api.com "
        "может не подойти для вашего инстанса. Неверный apiUrl приводит к ошибкам получения сообщений.",
    )

    pdf.h1("6. Настройки инстанса для получения сообщений")
    pdf.bullet("Адрес webhook (URL уведомлений) — оставьте ПУСТЫМ")
    pdf.bullet("«Получать уведомления о входящих сообщениях и файлах» — включите (Да)")
    pdf.callout(
        "Почему webhook пустой?",
        "Проект использует технологию HTTP API (ReceiveNotification + DeleteNotification). "
        "Если указать URL webhook, очередь HTTP API перестанет отдавать уведомления.",
    )
    pdf.body(
        "При входе приложение также пытается само вызвать SetSettings "
        "(включить incomingWebhook и очистить webhookUrl). После смены настроек "
        "подождите 1–2 минуты — инстанс может перезапуститься."
    )

    pdf.h1("7. Проверка работы")
    pdf.bullet("Войдите в чат с данными инстанса")
    pdf.bullet("Создайте чат по номеру получателя (РФ +7 или РБ +375)")
    pdf.bullet("Отправьте текстовое сообщение")
    pdf.bullet("Ответьте из приложения MAX на телефоне")
    pdf.bullet("Убедитесь, что ответ появился в веб-чате")

    pdf.h1("8. Другие команды")
    pdf.code_block(
        "npm run build     # production-сборка в папку dist/\n"
        "npm run preview   # локальный просмотр сборки\n"
        "npm run lint      # проверка кода"
    )

    pdf.h1("9. Демо в интернете")
    pdf.body("Проект уже развёрнут на Vercel:")
    pdf.code_block("https://test-max-beta.vercel.app")
    pdf.muted(
        "Подробное описание проекта, API и troubleshooting — в файле README.md репозитория."
    )

    pdf.h1("10. Если что-то не запускается")
    pdf.bullet("Ошибка node/npm — обновите Node.js до 18+")
    pdf.bullet("Порт 5173 занят — Vite предложит другой порт, откройте его")
    pdf.bullet("Сообщения не приходят — пустой webhook + включённые входящие уведомления")
    pdf.bullet("NOT_FOUND / странная ошибка — проверьте apiUrl и перелогиньтесь (Ctrl+Shift+R)")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(OUT)


if __name__ == "__main__":
    build()
