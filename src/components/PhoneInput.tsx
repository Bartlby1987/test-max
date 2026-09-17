import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from 'react'
import {
  formatNational,
  formatPhoneDisplay,
  getCountryMeta,
  parsePhoneInput,
  validatePhone,
  type PhoneCountry,
} from '../utils/phone'

interface PhoneInputProps {
  country: PhoneCountry
  national: string
  onCountryChange: (country: PhoneCountry) => void
  onNationalChange: (national: string) => void
  disabled?: boolean
  autoFocus?: boolean
  id?: string
}

export function PhoneInput({
  country,
  national,
  onCountryChange,
  onNationalChange,
  disabled,
  autoFocus,
  id = 'phone-input',
}: PhoneInputProps) {
  const meta = getCountryMeta(country)
  const e164 = `${meta.code}${national}`
  const error = national ? validatePhone(e164) : null
  const ok = national.length === meta.nationalLength && !error
  const display = formatNational(national, country)

  const applyRaw = (raw: string, nextCountry = country) => {
    const parsed = parsePhoneInput(raw, nextCountry)
    if (parsed.country !== country) {
      onCountryChange(parsed.country)
    }
    onNationalChange(parsed.national)
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    applyRaw(`${meta.code}${event.target.value}`)
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    applyRaw(event.clipboardData.getData('text'))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Backspace') return
    if (national.length > 0) return
    // allow clearing gracefully
  }

  const switchCountry = (next: PhoneCountry) => {
    if (next === country) return
    const nextMeta = getCountryMeta(next)
    onCountryChange(next)
    onNationalChange(national.slice(0, nextMeta.nationalLength))
  }

  return (
    <div className={`phone-field ${error ? 'is-invalid' : ''} ${ok ? 'is-valid' : ''}`}>
      <div className="phone-countries" role="group" aria-label="Страна">
        <button
          type="button"
          className={`phone-country ${country === 'ru' ? 'is-active' : ''}`}
          onClick={() => switchCountry('ru')}
          disabled={disabled}
        >
          RU +7
        </button>
        <button
          type="button"
          className={`phone-country ${country === 'by' ? 'is-active' : ''}`}
          onClick={() => switchCountry('by')}
          disabled={disabled}
        >
          BY +375
        </button>
      </div>

      <div className="phone-input-wrap">
        <span className="phone-dial" aria-hidden>
          {meta.dial}
        </span>
        <input
          id={id}
          className="phone-input"
          value={display}
          onChange={handleChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={meta.placeholder}
          inputMode="tel"
          autoComplete="tel-national"
          autoFocus={autoFocus}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-hint` : `${id}-preview`}
        />
        <span className="phone-status" aria-hidden>
          {ok ? '✓' : error && national ? '!' : ''}
        </span>
      </div>

      <p id={`${id}-preview`} className="phone-preview">
        {national
          ? formatPhoneDisplay(e164)
          : `Формат: ${meta.dial} ${meta.placeholder}`}
      </p>

      {error && national ? (
        <p id={`${id}-hint`} className="field-hint field-hint--error">
          {error}
        </p>
      ) : (
        <p className="field-hint">Только мобильные номера РФ и РБ (требование GREEN-API)</p>
      )}
    </div>
  )
}
