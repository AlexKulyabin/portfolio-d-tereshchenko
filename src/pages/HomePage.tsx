import { useContent } from '@/lib/ContentProvider'
import { faqSchema, organizationSchema } from '@/lib/schema-org'
import { Seo } from '@/components/Seo'
import { Hero } from '@/components/sections/Hero'
import { ServicesGrid } from '@/components/sections/ServicesGrid'
import { ExpertBlock } from '@/components/sections/ExpertBlock'
import { Advantages } from '@/components/sections/Advantages'
import { Steps } from '@/components/sections/Steps'
import { Industries } from '@/components/sections/Industries'
import { Testimonials } from '@/components/sections/Testimonials'
import { FaqSection } from '@/components/sections/FaqSection'
import { CtaSection } from '@/components/sections/CtaSection'

export default function HomePage() {
  const content = useContent()
  const { home } = content

  const schemas = [organizationSchema(content), faqSchema(home.faq.items)].filter(
    (schema): schema is Record<string, unknown> => schema !== null,
  )

  return (
    <>
      <Seo
        title={home.seo.title}
        description={home.seo.description}
        path="/"
        ogImage={home.seo.ogImage}
        jsonLd={schemas}
      />
      <Hero />
      <ServicesGrid />
      <Advantages />
      <ExpertBlock />
      <Steps />
      <Industries />
      <Testimonials />
      <FaqSection items={home.faq.items} title={home.faq.title || 'Частые вопросы'} />
      <CtaSection />
    </>
  )
}
