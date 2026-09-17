export type PhoneCountry = 'ru' | 'by'

export interface PhoneValue {
  country: PhoneCountry
  national: string
  e164: string
}

export function normalizePhone(input: string): string {
  return input.replace(/\D/g, '')
}

export function getCountryMeta(country: PhoneCountry) {
  if (country === 'by') {
    return {
      code: '375',
      dial: '+375',
      nationalLength: 9,
      placeholder: '(29) 123-45-67',
      label: 'Беларусь',
    }
  }
  return {
    code: '7',
    dial: '+7',
    nationalLength: 10,
    placeholder: '(999) 123-45-67',
    label: 'Россия',
  }
}

export function detectCountry(digits: string): PhoneCountry {
  if (digits.startsWith('375')) return 'by'
  return 'ru'
}

/** Convert raw input / paste into country + national digits. */
export function parsePhoneInput(raw: string, preferred: PhoneCountry = 'ru'): PhoneValue {
  let digits = normalizePhone(raw)

  if (digits.startsWith('8') && digits.length === 11) {
    digits = `7${digits.slice(1)}`
  }

  let country = preferred
  if (digits.startsWith('375')) country = 'by'
  else if (digits.startsWith('7')) country = 'ru'

  const meta = getCountryMeta(country)
  let national = digits

  if (digits.startsWith(meta.code)) {
    national = digits.slice(meta.code.length)
  } else if (country === 'ru' && digits.length <= 10) {
    national = digits
  }

  national = national.slice(0, meta.nationalLength)
  const e164 = `${meta.code}${national}`

  return { country, national, e164 }
}

export function formatNational(national: string, country: PhoneCountry): string {
  const d = normalizePhone(national)
  if (country === 'by') {
    const a = d.slice(0, 2)
    const b = d.slice(2, 5)
    const c = d.slice(5, 7)
    const e = d.slice(7, 9)
    if (!a) return ''
    if (d.length <= 2) return `(${a}`
    if (d.length <= 5) return `(${a}) ${b}`
    if (d.length <= 7) return `(${a}) ${b}-${c}`
    return `(${a}) ${b}-${c}-${e}`
  }

  const a = d.slice(0, 3)
  const b = d.slice(3, 6)
  const c = d.slice(6, 8)
  const e = d.slice(8, 10)
  if (!a) return ''
  if (d.length <= 3) return `(${a}`
  if (d.length <= 6) return `(${a}) ${b}`
  if (d.length <= 8) return `(${a}) ${b}-${c}`
  return `(${a}) ${b}-${c}-${e}`
}

export function formatPhoneDisplay(phone: string): string {
  const digits = normalizePhone(phone)
  if (!digits) return ''

  if (digits.startsWith('375') && digits.length >= 4) {
    const national = digits.slice(3)
    return `+375 ${formatNational(national, 'by')}`.trim()
  }

  if (digits.startsWith('7')) {
    const national = digits.slice(1)
    return `+7 ${formatNational(national, 'ru')}`.trim()
  }

  return `+${digits}`
}

export function validatePhone(phone: string): string | null {
  const digits = normalizePhone(phone)

  if (!digits) {
    return 'Введите номер телефона'
  }

  if (digits.startsWith('375')) {
    if (digits.length !== 12) {
      return 'Для Беларуси номер должен быть в формате +375 XX XXX-XX-XX'
    }
    return null
  }

  if (digits.startsWith('7')) {
    if (digits.length !== 11) {
      return 'Для России номер должен быть в формате +7 (XXX) XXX-XX-XX'
    }
    const operator = digits[1]
    if (operator === '0' || operator === '1' || operator === '2') {
      return 'Похоже на некорректный российский мобильный номер'
    }
    return null
  }

  if (digits.startsWith('8') && digits.length === 11) {
    return 'Используйте формат +7 … вместо 8 …'
  }

  return 'Поддерживаются только номера РФ (+7) и РБ (+375)'
}

export function isPhoneComplete(phone: string): boolean {
  return validatePhone(phone) === null
}

export function toChatIdFromPhone(phone: string): string {
  return `${normalizePhone(phone)}@c.us`
}
