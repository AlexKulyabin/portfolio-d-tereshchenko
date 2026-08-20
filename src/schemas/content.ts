import { z } from 'zod'

/**
 * Единая схема контента сайта.
 *
 * Она же — источник правды для трёх вещей: типов на публичных страницах,
 * валидации в админке и проверки снапшота при сборке. Если поле меняется
 * здесь, TypeScript покажет все места, которые нужно поправить.
 */

const nonEmpty = (label: string, max = 300) =>
  z.string().trim().min(1, `${label}: поле не может быть пустым`).max(max, `${label}: слишком длинный текст`)

const optionalText = (max = 2000) => z.string().trim().max(max).default('')

/** Изображение: путь в Storage + обязательный alt для доступности и SEO. */
export const imageSchema = z.object({
  url: z.string().trim().default(''),
  alt: z.string().trim().max(200).default(''),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
})
export type ImageValue = z.infer<typeof imageSchema>

export const seoSchema = z.object({
  title: nonEmpty('SEO-заголовок', 120),
  description: nonEmpty('SEO-описание', 320),
  ogImage: z.string().trim().default(''),
})
export type Seo = z.infer<typeof seoSchema>

export const linkSchema = z.object({
  label: nonEmpty('Название ссылки', 80),
  href: nonEmpty('Адрес ссылки', 300),
})

/* ------------------------------------------------------------------ */
/* Настройки сайта: контакты, реквизиты, аналитика                     */
/* ------------------------------------------------------------------ */

export const contactsSchema = z.object({
  /** Как показываем на сайте: +7 (900) 000-00-00 */
  phone: z.string().trim().max(40).default(''),
  /** Как подставляем в tel: — только цифры и плюс */
  phoneRaw: z.string().trim().max(20).default(''),
  phoneSecondary: z.string().trim().max(40).default(''),
  email: z.string().trim().max(120).default(''),
  telegram: z.string().trim().max(200).default(''),
  whatsapp: z.string().trim().max(200).default(''),
  city: z.string().trim().max(120).default(''),
  address: z.string().trim().max(300).default(''),
  workHours: z.string().trim().max(160).default(''),
  geography: z.string().trim().max(200).default(''),
})
export type Contacts = z.infer<typeof contactsSchema>

export const legalSchema = z.object({
  /** ИП / ООО / самозанятый — влияет на формулировки в оферте */
  entityType: z.enum(['ip', 'ooo', 'self-employed', 'none']).default('none'),
  name: z.string().trim().max(300).default(''),
  inn: z.string().trim().max(20).default(''),
  ogrn: z.string().trim().max(20).default(''),
  address: z.string().trim().max(300).default(''),
})
export type Legal = z.infer<typeof legalSchema>

export const analyticsSchema = z.object({
  /** Номер счётчика Яндекс.Метрики. Пусто — счётчик не подключается. */
  metrikaId: z.string().trim().max(20).default(''),
  /** Содержимое мета-тега подтверждения прав в Яндекс.Вебмастере */
  yandexVerification: z.string().trim().max(200).default(''),
  googleVerification: z.string().trim().max(200).default(''),
})
export type Analytics = z.infer<typeof analyticsSchema>

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().max(160).default('Оценка профрисков, нормирование труда, ХАССП'),
  siteUrl: z.string().trim().max(200).default(''),
  contacts: contactsSchema.prefault({}),
  legal: legalSchema.prefault({}),
  analytics: analyticsSchema.prefault({}),
})
export type SiteSettings = z.infer<typeof siteSettingsSchema>

/* ------------------------------------------------------------------ */
/* Повторяемые блоки                                                    */
/* ------------------------------------------------------------------ */

export const statSchema = z.object({
  value: nonEmpty('Значение', 20),
  label: nonEmpty('Подпись', 120),
})

export const credentialSchema = z.object({
  title: nonEmpty('Название документа', 200),
  issuer: optionalText(200),
  year: z.string().trim().max(20).default(''),
  image: imageSchema.prefault({}),
})

export const expertSchema = z.object({
  name: nonEmpty('Имя эксперта', 160),
  role: nonEmpty('Должность', 200),
  photo: imageSchema.prefault({}),
  bio: optionalText(3000),
  stats: z.array(statSchema).max(6).default([]),
  credentials: z.array(credentialSchema).max(24).default([]),
})
export type Expert = z.infer<typeof expertSchema>

export const advantageSchema = z.object({
  /** Имя иконки из набора Lucide, см. src/lib/icons.ts */
  icon: z.string().trim().max(40).default('check'),
  title: nonEmpty('Заголовок', 160),
  text: optionalText(600),
})

export const stepSchema = z.object({
  title: nonEmpty('Название шага', 160),
  text: optionalText(600),
  duration: z.string().trim().max(80).default(''),
})

export const testimonialSchema = z.object({
  text: nonEmpty('Текст отзыва', 1200),
  author: nonEmpty('Автор', 120),
  position: z.string().trim().max(160).default(''),
  company: z.string().trim().max(160).default(''),
  /** Публикуем только отзыв с подтверждённой достоверностью и согласием автора. */
  verified: z.boolean().default(false),
})

export const faqItemSchema = z.object({
  q: nonEmpty('Вопрос', 300),
  a: nonEmpty('Ответ', 2500),
})
export type FaqItem = z.infer<typeof faqItemSchema>

export const packageSchema = z.object({
  name: nonEmpty('Название пакета', 80),
  price: z.string().trim().max(60).default(''),
  priceNote: z.string().trim().max(120).default(''),
  description: optionalText(400),
  features: z.array(z.string().trim().max(300)).max(20).default([]),
  duration: z.string().trim().max(120).default(''),
  /** Выделяем визуально как рекомендованный — обычно средний */
  highlighted: z.boolean().default(false),
})
export type ServicePackage = z.infer<typeof packageSchema>

/* ------------------------------------------------------------------ */
/* Услуга                                                              */
/* ------------------------------------------------------------------ */

export const SERVICE_SLUGS = [
  'otsenka-professionalnyh-riskov',
  'normirovanie-truda',
  'razrabotka-hassp',
] as const
export type ServiceSlug = (typeof SERVICE_SLUGS)[number]

export const serviceSchema = z.object({
  slug: z.enum(SERVICE_SLUGS),
  order: z.number().int().min(0).default(0),
  /** Полное название — для заголовка страницы */
  title: nonEmpty('Название услуги', 200),
  /** Короткое — для меню и карточек */
  shortTitle: nonEmpty('Короткое название', 60),
  icon: z.string().trim().max(40).default('shield'),
  /** Аннотация для карточки на главной */
  summary: optionalText(400),
  priceFrom: z.string().trim().max(60).default(''),

  hero: z
    .object({
      title: optionalText(240),
      subtitle: optionalText(600),
      image: imageSchema.prefault({}),
    })
    .prefault({}),

  /** Зачем это нужно: требование закона и цена бездействия */
  why: z
    .object({
      title: optionalText(200),
      body: optionalText(4000),
      legalRefs: z.array(z.string().trim().max(400)).max(12).default([]),
      penalty: optionalText(1000),
    })
    .prefault({}),

  /** Что входит в работу */
  included: z.array(advantageSchema).max(16).default([]),
  /** Что клиент получает на руки — самый убедительный блок */
  deliverables: z.array(z.string().trim().max(300)).max(24).default([]),

  packages: z.array(packageSchema).max(6).default([]),

  terms: z
    .object({
      development: z.string().trim().max(160).default('от 3 календарных дней'),
      visit: z.string().trim().max(160).default('от 1 календарного дня'),
      note: optionalText(500),
    })
    .prefault({}),

  faq: z.array(faqItemSchema).max(20).default([]),
  seo: seoSchema,
})
export type Service = z.infer<typeof serviceSchema>

/* ------------------------------------------------------------------ */
/* Главная страница                                                    */
/* ------------------------------------------------------------------ */

export const homePageSchema = z.object({
  hero: z
    .object({
      badge: z.string().trim().max(120).default(''),
      title: nonEmpty('Заголовок первого экрана', 240),
      subtitle: optionalText(700),
      ctaPrimary: z.string().trim().max(60).default('Получить расчёт'),
      ctaSecondary: z.string().trim().max(60).default('Позвонить'),
      stats: z.array(statSchema).max(4).default([]),
    })
    .prefault({ title: '' }),

  servicesIntro: z
    .object({
      title: optionalText(200),
      subtitle: optionalText(600),
    })
    .prefault({}),

  advantages: z
    .object({
      title: optionalText(200),
      subtitle: optionalText(600),
      items: z.array(advantageSchema).max(12).default([]),
    })
    .prefault({}),

  steps: z
    .object({
      title: optionalText(200),
      subtitle: optionalText(600),
      items: z.array(stepSchema).max(10).default([]),
    })
    .prefault({}),

  industries: z
    .object({
      title: optionalText(200),
      subtitle: optionalText(600),
      items: z.array(z.string().trim().max(120)).max(24).default([]),
    })
    .prefault({}),

  testimonials: z
    .object({
      title: optionalText(200),
      items: z.array(testimonialSchema).max(20).default([]),
    })
    .prefault({}),

  faq: z
    .object({
      title: optionalText(200),
      items: z.array(faqItemSchema).max(20).default([]),
    })
    .prefault({}),

  seo: seoSchema,
})
export type HomePage = z.infer<typeof homePageSchema>

/* ------------------------------------------------------------------ */
/* Корневой документ контента                                          */
/* ------------------------------------------------------------------ */

export const siteContentSchema = z.object({
  /** Растёт при каждой публикации: по нему решаем, обновлять ли запечённый контент */
  version: z.number().int().nonnegative().default(0),
  publishedAt: z.string().default(''),
  settings: siteSettingsSchema,
  expert: expertSchema,
  home: homePageSchema,
  services: z.array(serviceSchema),
  cta: z
    .object({
      title: optionalText(200),
      subtitle: optionalText(600),
      consentText: optionalText(1200),
    })
    .prefault({}),
})
export type SiteContent = z.infer<typeof siteContentSchema>

/** Заявка с формы обратной связи. */
export const leadSchema = z.object({
  name: z.string().trim().min(2, 'Укажите имя').max(120),
  phone: z
    .string()
    .trim()
    .min(10, 'Укажите телефон полностью')
    .max(30)
    .regex(/^[\d\s+()-]+$/, 'Телефон может содержать только цифры и знаки + ( ) -'),
  email: z.union([z.literal(''), z.email('Проверьте адрес почты')]).default(''),
  service: z.string().trim().max(120).default(''),
  message: z.string().trim().max(2000).default(''),
  consent: z.literal(true, { message: 'Без согласия на обработку данных мы не сможем ответить' }),
  /** Ловушка для ботов: люди это поле не видят и не заполняют */
  company: z.string().max(0).default(''),
})
export type LeadInput = z.infer<typeof leadSchema>
