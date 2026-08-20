const { logger } = require('firebase-functions')
const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { onSchedule } = require('firebase-functions/v2/scheduler')
const { defineSecret } = require('firebase-functions/params')
const { getApps, initializeApp } = require('firebase-admin/app')
const { getFirestore, Timestamp } = require('firebase-admin/firestore')
const nodemailer = require('nodemailer')
const { buildLeadEmail } = require('./lead-email')

// Значения хранятся в Secret Manager, а не в коде или .env-файле.
const gmailUser = defineSecret('GMAIL_SMTP_USER')
const gmailAppPassword = defineSecret('GMAIL_SMTP_APP_PASSWORD')
const leadRetentionDays = 180

if (!getApps().length) initializeApp()

/** Удаляет обращения, по которым не был заключён договор, по истечении срока хранения. */
exports.deleteExpiredLeads = onSchedule(
  {
    schedule: 'every day 03:30',
    timeZone: 'Europe/Moscow',
    region: 'europe-west1',
    memory: '256MiB',
    timeoutSeconds: 120,
  },
  async () => {
    const cutoff = Timestamp.fromDate(new Date(Date.now() - leadRetentionDays * 24 * 60 * 60 * 1000))
    const db = getFirestore()
    let deleted = 0

    // Удаляем пачками: лимит предотвращает длительные транзакции и неограниченную нагрузку.
    while (true) {
      const stale = await db
        .collection('leads')
        .where('createdAt', '<', cutoff)
        .orderBy('createdAt')
        .limit(200)
        .get()
      if (stale.empty) break

      const batch = db.batch()
      stale.docs.forEach((entry) => batch.delete(entry.ref))
      await batch.commit()
      deleted += stale.size
      if (stale.size < 200) break
    }

    logger.info('Expired leads deleted', { deleted, retentionDays: leadRetentionDays })
  },
)

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
