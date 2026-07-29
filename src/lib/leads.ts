import type { LeadInput } from '@/schemas/content'
import { getCampaignParams } from './metrika'
import { getDb, isFirebaseConfigured } from './firebase'

/**
 * Отправка заявки.
 *
 * Заявки складываются в коллекцию leads. Правила Firestore разрешают
 * анонимную запись в неё, но запрещают чтение и изменение — прочитать
 * список может только администратор из админки.
 *
 * Персональные данные хранятся в Firebase по решению заказчика.
 * Требования, которые это накладывает, описаны в docs/PERSONAL-DATA.md.
 */

const SUBMIT_INTERVAL_KEY = 'lead-last-submit'
const MIN_INTERVAL_MS = 30_000

export class LeadError extends Error {}

export async function submitLead(input: LeadInput, formOpenedAt: number): Promise<void> {
  // Ловушка для ботов: поле скрыто от людей, заполнить его мог только робот.
  if (input.company) throw new LeadError('Не удалось отправить заявку')

  // Человек не успеет осмысленно заполнить форму за три секунды.
  if (Date.now() - formOpenedAt < 3000) {
    throw new LeadError('Не удалось отправить заявку. Попробуйте ещё раз')
  }

  const lastSubmit = Number(sessionStorage.getItem(SUBMIT_INTERVAL_KEY) ?? 0)
  if (lastSubmit && Date.now() - lastSubmit < MIN_INTERVAL_MS) {
    throw new LeadError('Заявка уже отправлена. Я свяжусь с вами в ближайшее время')
  }

  if (!isFirebaseConfigured()) {
    throw new LeadError(
      'Форма ещё не подключена к базе. Позвоните или напишите — контакты указаны выше',
    )
  }

  const [db, { addDoc, collection, serverTimestamp }] = await Promise.all([
    getDb(),
    import('firebase/firestore'),
  ])

  await addDoc(collection(db, 'leads'), {
    name: input.name,
    phone: input.phone,
    email: input.email,
    service: input.service,
    message: input.message,
    consent: input.consent,
    status: 'new',
    createdAt: serverTimestamp(),
    page: window.location.pathname,
    campaign: getCampaignParams(),
    userAgent: navigator.userAgent.slice(0, 300),
  })

  try {
    sessionStorage.setItem(SUBMIT_INTERVAL_KEY, String(Date.now()))
  } catch {
    // Приватный режим может запрещать запись — на отправку это не влияет.
  }
}
