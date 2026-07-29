import { Navigate, useParams } from 'react-router-dom'
import type { Service } from '@/schemas/content'
import { useDraftContent } from '../DraftProvider'
import { EditorSection, Grid, PageHeading } from '../components/EditorSection'
import {
  Checkbox,
  Field,
  IconSelect,
  RepeatableList,
  StringList,
  TextArea,
  TextInput,
} from '../components/fields'

export default function ServiceEditor() {
  const { slug } = useParams<{ slug: string }>()
  const [content, update] = useDraftContent()

  const index = content.services.findIndex((item) => item.slug === slug)
  const service = content.services[index]

  if (!service) return <Navigate to="/admin" replace />

  /** Обновление одного поля услуги без затрагивания остальных. */
  const patch = (changes: Partial<Service>) =>
    update((current) => {
      const services = [...current.services]
      const target = services[index]
      if (!target) return current
      services[index] = { ...target, ...changes }
      return { ...current, services }
    })

  return (
    <>
      <PageHeading
        title={service.title}
        description="Страница услуги: описание, состав работ, три пакета с ценами, сроки и вопросы."
      />

      <EditorSection title="Название и краткое описание">
        <Field label="Полное название" required hint="Заголовок страницы услуги">
          <TextInput value={service.title} onChange={(title) => patch({ title })} />
        </Field>

        <Grid>
          <Field label="Короткое название" required hint="Для меню и карточки на главной">
            <TextInput value={service.shortTitle} onChange={(shortTitle) => patch({ shortTitle })} />
          </Field>
          <Field label="Иконка">
            <IconSelect value={service.icon} onChange={(icon) => patch({ icon })} />
          </Field>
        </Grid>

        <Field label="Описание для карточки на главной">
          <TextArea
            value={service.summary}
            rows={3}
            onChange={(summary) => patch({ summary })}
          />
        </Field>

        <Field
          label="Цена «от»"
          hint="Показывается в карточке и в шапке страницы. Оставьте пустым, если не хотите показывать"
        >
          <TextInput
            value={service.priceFrom}
            placeholder="15 000 ₽"
            onChange={(priceFrom) => patch({ priceFrom })}
          />
        </Field>
      </EditorSection>

      <EditorSection title="Первый экран страницы">
        <Field label="Заголовок" hint="Если пусто — возьмётся полное название услуги">
          <TextArea
            value={service.hero.title}
            rows={2}
            onChange={(title) => patch({ hero: { ...service.hero, title } })}
          />
        </Field>
        <Field label="Подзаголовок">
          <TextArea
            value={service.hero.subtitle}
            rows={3}
            onChange={(subtitle) => patch({ hero: { ...service.hero, subtitle } })}
          />
        </Field>
      </EditorSection>

      <EditorSection
        title="Зачем это нужно"
        description="Блок, который объясняет требование закона и цену бездействия. Проверьте, что ссылки на нормативные документы актуальны."
      >
        <Field label="Заголовок блока">
          <TextInput
            value={service.why.title}
            onChange={(title) => patch({ why: { ...service.why, title } })}
          />
        </Field>

        <Field label="Основной текст" hint="Пустая строка между абзацами разделит их на сайте">
          <TextArea
            value={service.why.body}
            rows={8}
            onChange={(body) => patch({ why: { ...service.why, body } })}
          />
        </Field>

        <Field label="Нормативная база" hint="По одному документу в строке">
          <StringList
            value={service.why.legalRefs}
            onChange={(legalRefs) => patch({ why: { ...service.why, legalRefs } })}
            placeholder="Статья 214 Трудового кодекса РФ — ..."
            addLabel="Добавить документ"
          />
        </Field>

        <Field label="Ответственность за нарушение">
          <TextArea
            value={service.why.penalty}
            rows={4}
            onChange={(penalty) => patch({ why: { ...service.why, penalty } })}
          />
        </Field>
      </EditorSection>

      <EditorSection title="Что входит в услугу">
        <RepeatableList
          items={service.included}
          onChange={(included) => patch({ included })}
          create={() => ({ icon: 'check', title: '', text: '' })}
          titleOf={(item) => item.title}
          addLabel="Добавить пункт"
          max={16}
          renderItem={(item, patchItem) => (
            <>
              <Field label="Иконка">
                <IconSelect value={item.icon} onChange={(icon) => patchItem({ icon })} />
              </Field>
              <Field label="Заголовок" required>
                <TextInput value={item.title} onChange={(title) => patchItem({ title })} />
              </Field>
              <Field label="Описание">
                <TextArea value={item.text} rows={3} onChange={(text) => patchItem({ text })} />
              </Field>
            </>
          )}
        />
      </EditorSection>

      <EditorSection
        title="Что клиент получает на руки"
        description="Перечень документов — обычно это самый убедительный блок на странице."
      >
        <StringList
          value={service.deliverables}
          onChange={(deliverables) => patch({ deliverables })}
          placeholder="Например: Карты оценки профессиональных рисков"
          addLabel="Добавить документ"
        />
      </EditorSection>

      <EditorSection
        title="Пакеты и цены"
        description="Три пакета на выбор. Средний обычно выделяют как рекомендованный — он чаще всего и продаётся."
      >
        <RepeatableList
          items={service.packages}
          onChange={(packages) => patch({ packages })}
          create={() => ({
            name: '',
            price: '',
            priceNote: '',
            description: '',
            features: [],
            duration: '',
            highlighted: false,
          })}
          titleOf={(item) => `${item.name}${item.price ? ` — ${item.price}` : ''}`}
          addLabel="Добавить пакет"
          max={6}
          renderItem={(item, patchItem) => (
            <>
              <Grid>
                <Field label="Название пакета" required>
                  <TextInput value={item.name} onChange={(name) => patchItem({ name })} />
                </Field>
                <Field label="Цена" hint="Если пусто — покажется «По запросу»">
                  <TextInput
                    value={item.price}
                    placeholder="25 000 ₽"
                    onChange={(price) => patchItem({ price })}
                  />
                </Field>
              </Grid>

              <Grid>
                <Field label="Приписка к цене" hint="Например: с выездом на объект">
                  <TextInput
                    value={item.priceNote}
                    onChange={(priceNote) => patchItem({ priceNote })}
                  />
                </Field>
                <Field label="Срок">
                  <TextInput
                    value={item.duration}
                    placeholder="от 3 календарных дней"
                    onChange={(duration) => patchItem({ duration })}
                  />
                </Field>
              </Grid>

              <Field label="Для кого этот пакет">
                <TextArea
                  value={item.description}
                  rows={2}
                  onChange={(description) => patchItem({ description })}
                />
              </Field>

              <Field label="Что входит">
                <StringList
                  value={item.features}
                  onChange={(features) => patchItem({ features })}
                  placeholder="Например: Выезд на объект"
                  addLabel="Добавить пункт"
                />
              </Field>

              <Checkbox
                checked={item.highlighted}
                onChange={(highlighted) => patchItem({ highlighted })}
                label="Выделить как рекомендованный"
              />
            </>
          )}
        />
      </EditorSection>

      <EditorSection
        title="Сроки"
        description="Эти значения показываются в шапке страницы и в отдельном блоке."
      >
        <Grid>
          <Field label="Срок разработки" required>
            <TextInput
              value={service.terms.development}
              onChange={(development) => patch({ terms: { ...service.terms, development } })}
            />
          </Field>
          <Field label="Срок выезда">
            <TextInput
              value={service.terms.visit}
              onChange={(visit) => patch({ terms: { ...service.terms, visit } })}
            />
          </Field>
        </Grid>
        <Field label="Уточнение по срокам">
          <TextArea
            value={service.terms.note}
            rows={3}
            onChange={(note) => patch({ terms: { ...service.terms, note } })}
          />
        </Field>
      </EditorSection>

      <EditorSection title="Вопросы по услуге">
        <RepeatableList
          items={service.faq}
          onChange={(faq) => patch({ faq })}
          create={() => ({ q: '', a: '' })}
          titleOf={(item) => item.q}
          addLabel="Добавить вопрос"
          max={20}
          renderItem={(item, patchItem) => (
            <>
              <Field label="Вопрос" required>
                <TextInput value={item.q} onChange={(q) => patchItem({ q })} />
              </Field>
              <Field label="Ответ" required>
                <TextArea value={item.a} rows={4} onChange={(a) => patchItem({ a })} />
              </Field>
            </>
          )}
        />
      </EditorSection>

      <EditorSection
        title="Как страница выглядит в поиске"
        description="У каждой услуги должны быть свои заголовок и описание — одинаковые тексты мешают продвижению."
      >
        <Field label="Заголовок в поиске" required hint="До 70 символов">
          <TextInput
            value={service.seo.title}
            onChange={(title) => patch({ seo: { ...service.seo, title } })}
          />
        </Field>
        <Field label="Описание в поиске" required hint="150–200 символов">
          <TextArea
            value={service.seo.description}
            rows={3}
            onChange={(description) => patch({ seo: { ...service.seo, description } })}
          />
        </Field>
      </EditorSection>

      <p className="mb-8 text-xs text-slate-400">
        Адрес страницы: /{service.slug} — он не меняется, чтобы не потерять позиции в поиске и
        работающие ссылки в рекламе.
      </p>
    </>
  )
}
