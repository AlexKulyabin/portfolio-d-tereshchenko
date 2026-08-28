import { useEffect, useRef } from 'react'
import { trackGoal, type AnalyticsSection } from './metrika'

/**
 * Считает осмысленный просмотр секции, а не краткое касание при прокрутке.
 * Для короткого блока нужно увидеть 50% его площади, для высокого — область
 * высотой не менее половины экрана. На одном отображении страницы событие
 * для конкретного компонента отправляется только один раз.
 */
export function useSectionView(section?: AnalyticsSection) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!section || !element || typeof IntersectionObserver === 'undefined') return

    const height = Math.max(element.getBoundingClientRect().height, 1)
    const threshold = Math.min(0.5, (window.innerHeight * 0.5) / height)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || entry.intersectionRatio < threshold) return
        trackGoal('section_view', { section })
        observer.disconnect()
      },
      { threshold },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [section])

  return ref
}
