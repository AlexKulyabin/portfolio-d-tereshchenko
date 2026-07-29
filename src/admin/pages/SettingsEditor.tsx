import { useDraftContent } from '../DraftProvider'
import { EditorSection, Grid, PageHeading } from '../components/EditorSection'
import { Field, Select, TextInput } from '../components/fields'

export default function SettingsEditor() {
  const [content, update] = useDraftContent()
  const { settings } = content

  const patchContacts = (changes: Partial<typeof settings.contacts>) =>
    update((current) => ({
      ...current,
      settings: { ...current.settings, contacts: { ...current.settings.contacts, ...changes } },
    }))

  const patchLegal = (changes: Partial<typeof settings.legal>) =>
    update((current) => ({
      ...current,
      settings: { ...current.settings, legal: { ...current.settings.legal, ...changes } },
    }))

  const patchAnalytics = (changes: Partial<typeof settings.analytics>) =>
    update((current) => ({
      ...current,
      settings: { ...current.settings, analytics: { ...current.settings.analytics, ...changes } },
    }))

  return (
    <>
      <PageHeading
        title="Контакты и настройки"
        description="Контакты показываются в шапке, в подвале, на странице контактов и в форме заявки — менять их нужно только здесь."
      />

      <EditorSection title="Контакты">
        <Grid>
          <Field label="Телефон" hint="Как показывать на сайте: +7 (900) 000-00-00">
            <TextInput
              value={settings.contacts.phone}
              placeholder="+7 (900) 000-00-00"
              onChange={(phone) => patchContacts({ phone })}
            />
          </Field>
          <Field
            label="Телефон для звонка"
            hint="Тот же номер без пробелов и скобок — по нему работает кнопка звонка"
          >
            <TextInput
              value={settings.contacts.phoneRaw}
              placeholder="+79000000000"
              onChange={(phoneRaw) => patchContacts({ phoneRaw })}
            />
          </Field>
        </Grid>

        <Grid>
          <Field label="Электронная почта">
            <TextInput
              value={settings.contacts.email}
              type="email"
              placeholder="mail@example.ru"
              onChange={(email) => patchContacts({ email })}
            />
          </Field>
          <Field label="Второй телефон" hint="Необязательно">
            <TextInput
              value={settings.contacts.phoneSecondary}
              onChange={(phoneSecondary) => patchContacts({ phoneSecondary })}
            />
          </Field>
        </Grid>

        <Grid>
          <Field label="Telegram" hint="Имя пользователя или полная ссылка">
            <TextInput
              value={settings.contacts.telegram}
              placeholder="@username"
              onChange={(telegram) => patchContacts({ telegram })}
            />
          </Field>
          <Field label="WhatsApp" hint="Номер телефона или полная ссылка">
            <TextInput
              value={settings.contacts.whatsapp}
              placeholder="+79000000000"
              onChange={(whatsapp) => patchContacts({ whatsapp })}
            />
          </Field>
        </Grid>

        <Grid>
          <Field label="Город">
            <TextInput
              value={settings.contacts.city}
              onChange={(city) => patchContacts({ city })}
            />
          </Field>
          <Field label="Время работы">
            <TextInput
              value={settings.contacts.workHours}
              placeholder="Пн–Пт, 9:00–19:00"
              onChange={(workHours) => patchContacts({ workHours })}
            />
          </Field>
        </Grid>

        <Field label="География работы" hint="Показывается в верхней полосе и в подвале">
          <TextInput
            value={settings.contacts.geography}
            placeholder="Работаем по всей России"
            onChange={(geography) => patchContacts({ geography })}
          />
        </Field>
      </EditorSection>

      <EditorSection
        title="Реквизиты"
        description="Нужны для модерации рекламы в Яндекс.Директе и для юридических страниц сайта. Показываются в подвале и на странице контактов."
      >
        <Grid>
          <Field label="Форма деятельности">
            <Select
              value={settings.legal.entityType}
              onChange={(value) => patchLegal({ entityType: value as typeof settings.legal.entityType })}
              options={[
                { value: 'none', label: 'Не указывать' },
                { value: 'ip', label: 'Индивидуальный предприниматель' },
                { value: 'ooo', label: 'Общество с ограниченной ответственностью' },
                { value: 'self-employed', label: 'Самозанятый' },
              ]}
            />
          </Field>
          <Field label="Наименование" hint="Например: ИП Иванов Иван Иванович">
            <TextInput value={settings.legal.name} onChange={(name) => patchLegal({ name })} />
          </Field>
        </Grid>

        <Grid>
          <Field label="ИНН">
            <TextInput value={settings.legal.inn} onChange={(inn) => patchLegal({ inn })} />
          </Field>
          <Field label="ОГРН или ОГРНИП">
            <TextInput value={settings.legal.ogrn} onChange={(ogrn) => patchLegal({ ogrn })} />
          </Field>
        </Grid>

        <Field label="Адрес">
          <TextInput value={settings.legal.address} onChange={(address) => patchLegal({ address })} />
        </Field>
      </EditorSection>

      <EditorSection
        title="Аналитика"
        description="Счётчик подключается автоматически после сохранения номера — пересобирать сайт не нужно."
      >
        <Field
          label="Номер счётчика Яндекс.Метрики"
          hint="Только цифры. Найти можно в интерфейсе Метрики в настройках счётчика"
        >
          <TextInput
            value={settings.analytics.metrikaId}
            placeholder="12345678"
            onChange={(metrikaId) => patchAnalytics({ metrikaId })}
          />
        </Field>

        <Field
          label="Код подтверждения в Яндекс.Вебмастере"
          hint="Значение из мета-тега yandex-verification"
        >
          <TextInput
            value={settings.analytics.yandexVerification}
            onChange={(yandexVerification) => patchAnalytics({ yandexVerification })}
          />
        </Field>

        <Field label="Код подтверждения в Google Search Console">
          <TextInput
            value={settings.analytics.googleVerification}
            onChange={(googleVerification) => patchAnalytics({ googleVerification })}
          />
        </Field>
      </EditorSection>

      <EditorSection title="Общее">
        <Field label="Название сайта" hint="Используется в заголовках и при отправке ссылки в мессенджер">
          <TextInput
            value={settings.siteName}
            onChange={(siteName) =>
              update((current) => ({ ...current, settings: { ...current.settings, siteName } }))
            }
          />
        </Field>

        <Field
          label="Адрес сайта"
          hint="Полный адрес с https:// — по нему строятся ссылки для поисковиков"
        >
          <TextInput
            value={settings.siteUrl}
            placeholder="https://example.ru"
            onChange={(siteUrl) =>
              update((current) => ({ ...current, settings: { ...current.settings, siteUrl } }))
            }
          />
        </Field>
      </EditorSection>
    </>
  )
}
