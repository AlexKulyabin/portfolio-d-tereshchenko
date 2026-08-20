import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { leadSchema, type LeadInput } from '@/schemas/content'
import { useContent } from '@/lib/ContentProvider'
import { sortedServices } from '@/lib/content'
import { LeadError, submitLead } from '@/lib/leads'
import { trackGoal } from '@/lib/metrika'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const fieldClass =
  'w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink-900 outline-none ' +
  'transition-colors placeholder:text-ink-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10'

const labelClass = 'mb-2 block text-sm font-medium text-navy-900'
const errorClass = 'mt-1.5 text-sm text-red-600'

export function LeadForm({ defaultService }: { defaultService?: string }) {
  const content = useContent()
  const services = sortedServices(content)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const openedAt = useRef(Date.now())

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LeadInput>({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      service: defaultService ?? '',
      message: '',
      company: '',
    },
  })

  useEffect(() => {
    if (defaultService) setValue('service', defaultService)
  }, [defaultService, setValue])

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)

    const parsed = leadSchema.safeParse(values)
    if (!parsed.success) {
      setSubmitError(parsed.error.issues[0]?.message ?? 'Проверьте заполнение формы')
      return
    }

    setStatus('sending')
    try {
      await submitLead(parsed.data, openedAt.current)
      trackGoal('form_submit', { service: parsed.data.service })
      setStatus('sent')
      reset()
    } catch (error) {
      setStatus('idle')
      setSubmitError(
        error instanceof LeadError
          ? error.message
          : 'Не получилось отправить заявку. Позвоните или напишите — контакты указаны рядом',
      )
    }
  })

  if (status === 'sent') {
    return (
      <div className="rounded-2xl bg-white p-8 text-center ring-1 ring-line sm:p-12">
        <CheckCircle2 aria-hidden="true" className="mx-auto size-14 text-brand-600" />
        <h3 className="mt-5 font-display text-2xl font-bold text-navy-900">Заявка отправлена</h3>
        <p className="mx-auto mt-3 max-w-md text-ink-600">
          Свяжусь с вами в ближайшее рабочее время, уточню детали и назову точную стоимость.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => setStatus('idle')}>
          Отправить ещё одну заявку
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-2xl bg-white p-6 ring-1 ring-line sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lead-name" className={labelClass}>
            Как к вам обращаться <span className="text-brand-700">*</span>
          </label>
          <input
            id="lead-name"
            type="text"
            autoComplete="name"
            placeholder="Иван Петров"
            aria-invalid={Boolean(errors.name)}
            className={cn(fieldClass, errors.name && 'border-red-400')}
            {...register('name')}
          />
          {errors.name && <p className={errorClass}>{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="lead-phone" className={labelClass}>
            Телефон <span className="text-brand-700">*</span>
          </label>
          <input
            id="lead-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7 900 000-00-00"
            aria-invalid={Boolean(errors.phone)}
            className={cn(fieldClass, errors.phone && 'border-red-400')}
            {...register('phone')}
          />
          {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="lead-email" className={labelClass}>
            Электронная почта
          </label>
          <input
            id="lead-email"
            type="email"
            autoComplete="email"
            placeholder="mail@company.ru"
            className={cn(fieldClass, errors.email && 'border-red-400')}
            {...register('email')}
          />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="lead-service" className={labelClass}>
            Услуга
          </label>
          <select id="lead-service" className={fieldClass} {...register('service')}>
            <option value="">Не выбрана</option>
            {services.map((service) => (
              <option key={service.slug} value={service.title}>
                {service.title}
              </option>
            ))}
            <option value="Несколько услуг">Несколько услуг</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="lead-message" className={labelClass}>
            Коротко о задаче
          </label>
          <textarea
            id="lead-message"
            rows={3}
            placeholder="Вид деятельности, число рабочих мест, желаемый срок"
            className={cn(fieldClass, 'resize-y')}
            {...register('message')}
          />
          <p className="mt-1.5 text-xs text-ink-500">
            Не указывайте паспортные, банковские, медицинские и другие чувствительные данные.
          </p>
        </div>
      </div>

      {/* Ловушка для ботов: людям это поле не видно и не доступно с клавиатуры */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="lead-company">Не заполняйте это поле</label>
        <input id="lead-company" type="text" tabIndex={-1} autoComplete="off" {...register('company')} />
      </div>

      <div className="mt-6">
        <label className="flex items-start gap-3 text-sm text-ink-600">
          <input
            type="checkbox"
            className="mt-1 size-5 shrink-0 rounded border-line text-brand-700 focus:ring-brand-600/30"
            {...register('consent')}
          />
          <span>
            Я даю согласие на{' '}
            <Link
              to="/soglasie-na-obrabotku-dannyh"
              className="text-brand-700 underline underline-offset-2"
            >
              обработку персональных данных
            </Link>
          </span>
        </label>
        <p className="mt-2 pl-8 text-xs text-ink-500">
          Условия обработки и порядок отзыва согласия указаны в{' '}
          <Link to="/politika-konfidencialnosti" className="text-brand-700 underline underline-offset-2">
            политике обработки персональных данных
          </Link>
          .
        </p>
        {errors.consent && <p className={errorClass}>{errors.consent.message}</p>}
      </div>

      {submitError && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <Button type="submit" size="lg" disabled={status === 'sending'} className="mt-6 w-full sm:w-auto">
        {status === 'sending' && <Loader2 aria-hidden="true" className="size-5 animate-spin" />}
        {status === 'sending' ? 'Отправляю…' : 'Отправить заявку'}
      </Button>

      <p className="mt-4 text-xs text-ink-400">Используем контакты только для ответа на обращение, без рекламных рассылок.</p>
    </form>
  )
}
