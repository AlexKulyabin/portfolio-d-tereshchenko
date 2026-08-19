const { logger } = require('firebase-functions')
const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { defineSecret } = require('firebase-functions/params')
const nodemailer = require('nodemailer')
const { buildLeadEmail } = require('./lead-email')

// Значения хранятся в Secret Manager, а не в коде или .env-файле.
const gmailUser = defineSecret('GMAIL_SMTP_USER')
const gmailAppPassword = defineSecret('GMAIL_SMTP_APP_PASSWORD')

/**
 * Отправляет письмо при появлении новой заявки.
 *
 * Триггер запускается только при создании leads/{leadId}, поэтому чтение и
 * редактирование заявки в админке не создают дополнительных уведомлений.
 */
exports.sendLeadEmail = onDocumentCreated(
  {
    document: 'leads/{leadId}',
    region: 'europe-west1',
    memory: '256MiB',
    timeoutSeconds: 60,
    maxInstances: 3,
    secrets: [gmailUser, gmailAppPassword],
  },
  async (event) => {
    if (!event.data) {
      logger.warn('Lead notification skipped: event has no document data', {
        leadId: event.params.leadId,
      })
      return
    }

    const account = gmailUser.value()
    const password = gmailAppPassword.value()
    const message = buildLeadEmail(event.data.data(), event.time)
    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: account, pass: password },
    })

    try {
      await transport.sendMail({
        from: { name: 'Заявки с сайта', address: account },
        to: account,
        replyTo: message.replyTo,
        subject: message.subject,
        text: message.text,
        html: message.html,
      })
      logger.info('Lead notification sent', { leadId: event.params.leadId })
    } catch (error) {
      // Не пишем в лог содержимое заявки или SMTP-учётные данные.
      logger.error('Lead notification failed', {
        leadId: event.params.leadId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  },
)
