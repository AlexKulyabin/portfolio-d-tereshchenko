/** Формирует письмо о заявке. Все поля заявки считаются недоверенными. */

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function html(value) {
  return text(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function display(value) {
  return text(value) || '—'
}

function campaign(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '—'

  const entries = Object.entries(value)
    .filter(([key, item]) => typeof key === 'string' && typeof item === 'string' && item)
    .map(([key, item]) => `${key}=${item}`)

  return entries.length ? entries.join(', ') : '—'
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(value))
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date()
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Moscow' }).format(date)
}

function buildLeadEmail(lead, eventTime) {
  const service = text(lead.service)
  const fields = [
    ['Дата', formatDate(eventTime)],
    ['Имя', display(lead.name)],
    ['Телефон', display(lead.phone)],
    ['Почта', display(lead.email)],
    ['Услуга', display(service)],
    ['Комментарий', display(lead.message)],
    ['Страница', display(lead.page)],
    ['Кампания', campaign(lead.campaign)],
  ]

  const subject = `Новая заявка с сайта${service ? `: ${service.replace(/[\r\n]/g, ' ')}` : ''}`
  const plain = fields.map(([label, value]) => `${label}: ${value}`).join('\n')
  const markup = fields
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;color:#475569;vertical-align:top">${html(label)}</td><td style="padding:8px 12px;color:#0f172a;white-space:pre-wrap">${html(value)}</td></tr>`,
    )
    .join('')

  return {
    subject,
    text: `${subject}\n\n${plain}`,
    html: `<!doctype html><html lang="ru"><body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a"><div style="max-width:640px;margin:24px auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden"><div style="padding:20px 24px;background:#071633;color:#fff"><strong style="font-size:18px">Новая заявка с сайта</strong></div><table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px"><tbody>${markup}</tbody></table></div></body></html>`,
    replyTo: isEmail(lead.email) ? text(lead.email) : undefined,
  }
}

module.exports = { buildLeadEmail }
