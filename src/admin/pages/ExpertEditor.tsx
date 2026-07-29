import { useDraftContent } from '../DraftProvider'
import { EditorSection, Grid, PageHeading } from '../components/EditorSection'
import { Field, ImageField, RepeatableList, TextArea, TextInput } from '../components/fields'

export default function ExpertEditor() {
  const [content, update] = useDraftContent()
  const { expert } = content

  const patch = (changes: Partial<typeof expert>) =>
    update((current) => ({ ...current, expert: { ...current.expert, ...changes } }))

  return (
    <>
      <PageHeading
        title="Об эксперте"
        description="Этот блок показывается на главной и на каждой странице услуги. Для B2B-клиента он часто важнее описания услуги."
      />

      <EditorSection title="Основное">
        <Grid>
          <Field label="Имя" required hint="Как подписываться на сайте">
            <TextInput value={expert.name} onChange={(name) => patch({ name })} />
          </Field>
          <Field label="Должность" required>
            <TextInput value={expert.role} onChange={(role) => patch({ role })} />
          </Field>
        </Grid>

        <ImageField
          value={expert.photo}
          onChange={(photo) => patch({ photo })}
          label="Фотография"
          folder="expert"
        />

        <Field
          label="О себе"
          hint="Опыт, отрасли, подход к работе. Пустая строка между абзацами разделит их на сайте"
        >
          <TextArea value={expert.bio} rows={8} onChange={(bio) => patch({ bio })} />
        </Field>
      </EditorSection>

      <EditorSection
        title="Цифры"
        description="Лет в профессии, выполненных проектов, отраслей. Показываются под текстом о вас."
      >
        <RepeatableList
          items={expert.stats}
          onChange={(stats) => patch({ stats })}
          create={() => ({ value: '', label: '' })}
          titleOf={(item) => `${item.value} — ${item.label}`}
          addLabel="Добавить цифру"
          max={6}
          renderItem={(item, patchItem) => (
            <Grid>
              <Field label="Значение" required>
                <TextInput value={item.value} onChange={(value) => patchItem({ value })} />
              </Field>
              <Field label="Подпись" required>
                <TextInput value={item.label} onChange={(label) => patchItem({ label })} />
              </Field>
            </Grid>
          )}
        />
      </EditorSection>

      <EditorSection
        title="Образование и документы"
        description="Дипломы, удостоверения, сертификаты. Показываются только на главной."
      >
        <RepeatableList
          items={expert.credentials}
          onChange={(credentials) => patch({ credentials })}
          create={() => ({ title: '', issuer: '', year: '', image: { url: '', alt: '' } })}
          titleOf={(item) => item.title}
          addLabel="Добавить документ"
          max={24}
          renderItem={(item, patchItem) => (
            <>
              <Field label="Название документа" required>
                <TextInput value={item.title} onChange={(title) => patchItem({ title })} />
              </Field>
              <Grid>
                <Field label="Кем выдан">
                  <TextInput value={item.issuer} onChange={(issuer) => patchItem({ issuer })} />
                </Field>
                <Field label="Год">
                  <TextInput value={item.year} onChange={(year) => patchItem({ year })} />
                </Field>
              </Grid>
              <ImageField
                value={item.image}
                onChange={(image) => patchItem({ image })}
                label="Скан или фотография документа"
                folder="credentials"
              />
            </>
          )}
        />
      </EditorSection>
    </>
  )
}
