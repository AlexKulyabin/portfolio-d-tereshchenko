const test = require('node:test')
const assert = require('node:assert/strict')
const { buildLeadEmail } = require('./lead-email')

test('buildLeadEmail safely renders a lead and reply-to address', () => {
  const message = buildLeadEmail(
    {
      name: 'Иван <Петров>',
      phone: '+7 900 000-00-00',
      email: 'ivan@example.ru',
      service: 'Оценка рисков',
      message: 'Нужен расчёт',
      page: '/otsenka-professionalnyh-riskov',
      campaign: { utm_source: 'yandex', yclid: '123' },
    },
    '2026-08-19T12:00:00.000Z',
  )

  assert.equal(message.replyTo, 'ivan@example.ru')
  assert.equal(message.subject, 'Новая заявка с сайта: Оценка рисков')
  assert.match(message.text, /utm_source=yandex, yclid=123/)
  assert.match(message.html, /Иван &lt;Петров&gt;/)
  assert.doesNotMatch(message.html, /Иван <Петров>/)
})

test('buildLeadEmail does not use an invalid reply-to address', () => {
  const message = buildLeadEmail({ email: 'not an email' }, '2026-08-19T12:00:00.000Z')
  assert.equal(message.replyTo, undefined)
  assert.match(message.text, /Имя: —/)
})
