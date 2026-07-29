import { useDraftContent } from '../DraftProvider'
import { EditorSection, Grid, PageHeading } from '../components/EditorSection'
import {
  Field,
  IconSelect,
  RepeatableList,
  StringList,
  TextArea,
  TextInput,
} from '../components/fields'

export default function HomeEditor() {
  const [content, update] = useDraftContent()
  const { home } = content

  /** Точечное обновление одного блока главной страницы. */
  const patchHome = <K extends keyof typeof home>(key: K, value: (typeof home)[K]) =>
    update((current) => ({ ...current, home: { ...current.home, [key]: value } }))

  return (
    <>
      <PageHeading
        title="Главная страница"
        description="Здесь настраивается всё, что видит посетитель на главной: первый экран, преимущества, этапы работы, отзывы и вопросы."
      />

      <EditorSection
        title="Первый экран"
        description="Самый важный блок: его видят все, кто пришёл из рекламы."
      >
        <Field label="Плашка над заголовком" hint="Короткая строка, например про выезд по России">
          <TextInput
            value={home.hero.badge}
            onChange={(value) => patchHome('hero', { ...home.hero, badge: value })}
          />
        </Field>

        <Field label="Заголовок" required>
          <TextArea
            value={home.hero.title}
            rows={2}
            onChange={(value) => patchHome('hero', { ...home.hero, title: value })}
          />
        </Field>

        <Field label="Подзаголовок">
          <TextArea
            value={home.hero.subtitle}
            rows={3}
            onChange={(value) => patchHome('hero', { ...home.hero, subtitle: value })}
          />
        </Field>

        <Grid>
          <Field label="Надпись на главной кнопке">
            <TextInput
              value={home.hero.ctaPrimary}
              onChange={(value) => patchHome('hero', { ...home.hero, ctaPrimary: value })}
            />
          </Field>
          <Field label="Надпись на второй кнопке">
            <TextInput
              value={home.hero.ctaSecondary}
              onChange={(value) => patchHome('hero', { ...home.hero, ctaSecondary: value })}
            />
          </Field>
        </Grid>

        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Цифры под первым экраном</p>
          <RepeatableList
            items={home.hero.stats}
            onChange={(stats) => patchHome('hero', { ...home.hero, stats })}
            create={() => ({ value: '', label: '' })}
            titleOf={(item) => `${item.value} — ${item.label}`}
            addLabel="Добавить цифру"
            max={4}
            renderItem={(item, patch) => (
              <Grid>
                <Field label="Значение" hint="Например: от 3 дней">
                  <TextInput value={item.value} onChange={(value) => patch({ value })} />
                </Field>
                <Field label="Подпись">
                  <TextInput value={item.label} onChange={(label) => patch({ label })} />
                </Field>
              </Grid>
            )}
          />
        </div>
      </EditorSection>

      <EditorSection
        title="Заголовок блока услуг"
        description="Сами услуги и их описания редактируются в разделах слева."
      >
        <Field label="Заголовок">
          <TextInput
            value={home.servicesIntro.title}
            onChange={(title) => patchHome('servicesIntro', { ...home.servicesIntro, title })}
          />
        </Field>
        <Field label="Пояснение">
          <TextArea
            value={home.servicesIntro.subtitle}
            rows={2}
            onChange={(subtitle) => patchHome('servicesIntro', { ...home.servicesIntro, subtitle })}
          />
        </Field>
      </EditorSection>

      <EditorSection title="Почему обращаются ко мне">
        <Field label="Заголовок блока">
          <TextInput
            value={home.advantages.title}
            onChange={(title) => patchHome('advantages', { ...home.advantages, title })}
          />
        </Field>
        <Field label="Пояснение">
          <TextArea
            value={home.advantages.subtitle}
            rows={2}
            onChange={(subtitle) => patchHome('advantages', { ...home.advantages, subtitle })}
          />
        </Field>

        <RepeatableList
          items={home.advantages.items}
          onChange={(items) => patchHome('advantages', { ...home.advantages, items })}
          create={() => ({ icon: 'check', title: '', text: '' })}
          titleOf={(item) => item.title}
          addLabel="Добавить преимущество"
          max={12}
          renderItem={(item, patch) => (
            <>
              <Field label="Иконка">
                <IconSelect value={item.icon} onChange={(icon) => patch({ icon })} />
              </Field>
              <Field label="Заголовок" required>
                <TextInput value={item.title} onChange={(title) => patch({ title })} />
              </Field>
              <Field label="Описание">
                <TextArea value={item.text} rows={3} onChange={(text) => patch({ text })} />
              </Field>
            </>
          )}
        />
      </EditorSection>

      <EditorSection title="Как проходит работа">
        <Field label="Заголовок блока">
          <TextInput
            value={home.steps.title}
            onChange={(title) => patchHome('steps', { ...home.steps, title })}
          />
        </Field>
        <Field label="Пояснение">
          <TextArea
            value={home.steps.subtitle}
            rows={2}
            onChange={(subtitle) => patchHome('steps', { ...home.steps, subtitle })}
          />
        </Field>

        <RepeatableList
          items={home.steps.items}
          onChange={(items) => patchHome('steps', { ...home.steps, items })}
          create={() => ({ title: '', text: '', duration: '' })}
          titleOf={(item) => item.title}
          addLabel="Добавить шаг"
          max={10}
          renderItem={(item, patch) => (
            <>
              <Field label="Название шага" required>
                <TextInput value={item.title} onChange={(title) => patch({ title })} />
              </Field>
              <Field label="Описание">
                <TextArea value={item.text} rows={3} onChange={(text) => patch({ text })} />
              </Field>
              <Field label="Срок" hint="Например: от 1 дня">
                <TextInput value={item.duration} onChange={(duration) => patch({ duration })} />
              </Field>
            </>
          )}
        />
      </EditorSection>

      <EditorSection title="Отрасли" description="Список сфер, с которыми вы работаете.">
        <Field label="Заголовок блока">
          <TextInput
            value={home.industries.title}
            onChange={(title) => patchHome('industries', { ...home.industries, title })}
          />
        </Field>
        <Field label="Пояснение">
          <TextArea
            value={home.industries.subtitle}
            rows={2}
            onChange={(subtitle) => patchHome('industries', { ...home.industries, subtitle })}
          />
        </Field>
        <Field label="Отрасли">
          <StringList
            value={home.industries.items}
            onChange={(items) => patchHome('industries', { ...home.industries, items })}
            placeholder="Например: Общественное питание"
            addLabel="Добавить отрасль"
          />
        </Field>
      </EditorSection>

      <EditorSection
        title="Отзывы"
        description="Если отзывов нет, блок не показывается — пустым он выглядит хуже, чем его отсутствие."
      >
        <Field label="Заголовок блока">
          <TextInput
            value={home.testimonials.title}
            onChange={(title) => patchHome('testimonials', { ...home.testimonials, title })}
          />
        </Field>

        <RepeatableList
          items={home.testimonials.items}
          onChange={(items) => patchHome('testimonials', { ...home.testimonials, items })}
          create={() => ({ text: '', author: '', position: '', company: '' })}
          titleOf={(item) => item.author || item.company}
          addLabel="Добавить отзыв"
          max={20}
          renderItem={(item, patch) => (
            <>
              <Field label="Текст отзыва" required>
                <TextArea value={item.text} rows={4} onChange={(text) => patch({ text })} />
              </Field>
              <Grid cols={3}>
                <Field label="Автор" required>
                  <TextInput value={item.author} onChange={(author) => patch({ author })} />
                </Field>
                <Field label="Должность">
                  <TextInput value={item.position} onChange={(position) => patch({ position })} />
                </Field>
                <Field label="Компания">
                  <TextInput value={item.company} onChange={(company) => patch({ company })} />
                </Field>
              </Grid>
            </>
          )}
        />
      </EditorSection>

      <EditorSection
        title="Частые вопросы"
        description="Эти вопросы и ответы поисковики показывают прямо в результатах поиска, поэтому отвечайте по делу."
      >
        <Field label="Заголовок блока">
          <TextInput
            value={home.faq.title}
            onChange={(title) => patchHome('faq', { ...home.faq, title })}
          />
        </Field>

        <RepeatableList
          items={home.faq.items}
          onChange={(items) => patchHome('faq', { ...home.faq, items })}
          create={() => ({ q: '', a: '' })}
          titleOf={(item) => item.q}
          addLabel="Добавить вопрос"
          max={20}
          renderItem={(item, patch) => (
            <>
              <Field label="Вопрос" required>
                <TextInput value={item.q} onChange={(q) => patch({ q })} />
              </Field>
              <Field label="Ответ" required>
                <TextArea value={item.a} rows={4} onChange={(a) => patch({ a })} />
              </Field>
            </>
          )}
        />
      </EditorSection>

      <EditorSection
        title="Блок заявки"
        description="Форма обратной связи внизу каждой страницы."
      >
        <Field label="Заголовок">
          <TextInput
            value={content.cta.title}
            onChange={(title) => update((current) => ({ ...current, cta: { ...current.cta, title } }))}
          />
        </Field>
        <Field label="Пояснение">
          <TextArea
            value={content.cta.subtitle}
            rows={2}
            onChange={(subtitle) =>
              update((current) => ({ ...current, cta: { ...current.cta, subtitle } }))
            }
          />
        </Field>
        <Field label="Приписка под кнопкой">
          <TextArea
            value={content.cta.consentText}
            rows={2}
            onChange={(consentText) =>
              update((current) => ({ ...current, cta: { ...current.cta, consentText } }))
            }
          />
        </Field>
      </EditorSection>

      <EditorSection
        title="Как страница выглядит в поиске"
        description="Заголовок и описание, которые видны в результатах Яндекса и Google."
      >
        <Field label="Заголовок в поиске" required hint="До 70 символов — иначе обрежется">
          <TextInput
            value={home.seo.title}
            onChange={(title) => patchHome('seo', { ...home.seo, title })}
          />
        </Field>
        <Field label="Описание в поиске" required hint="150–200 символов">
          <TextArea
            value={home.seo.description}
            rows={3}
            onChange={(description) => patchHome('seo', { ...home.seo, description })}
          />
        </Field>
      </EditorSection>
    </>
  )
}
