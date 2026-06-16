const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export function getPromotionDiscount(promotion) {
  const raw =
    promotion?.discount_value ?? promotion?.discount_percentage ?? promotion?.discount
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

export function formatPromotionDiscount(promotion) {
  const value = getPromotionDiscount(promotion)
  return value == null ? '—' : `${value}%`
}

export function formatPromotionBadge(promotion) {
  const value = getPromotionDiscount(promotion)
  if (value == null) return '— OFF'
  const formatted = Number.isInteger(value) ? value : value.toFixed(1).replace(/\.0$/, '')
  return `${formatted}% OFF`
}

export function formatPromotionDate(iso) {
  if (!iso) return '—'
  return dateFormatter.format(new Date(iso))
}

export function getPromotionStatus(promotion) {
  const now = new Date()
  const start = new Date(promotion.start_date)
  const end = new Date(promotion.end_date)

  if (end < now) {
    return { label: 'Expirada', variant: 'danger' }
  }

  if (start > now) {
    return { label: 'Agendada', variant: 'muted' }
  }

  return { label: 'Ativa', variant: 'active' }
}

export function toApiDateTime(dateStr, isEndOfDay = false) {
  if (!dateStr) return null
  const date = isEndOfDay ? endOfDay(dateStr) : startOfDay(dateStr)
  return date.toISOString()
}

export function fromApiDateTime(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isDateBeforeToday(dateStr) {
  return startOfDay(dateStr) < startOfDay(new Date())
}
