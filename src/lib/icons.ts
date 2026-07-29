import {
  BarChart3,
  Calculator,
  Camera,
  Check,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileSignature,
  FileText,
  GraduationCap,
  ListChecks,
  MapPin,
  MessageCircle,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Target,
  Thermometer,
  Timer,
  TrendingUp,
  Users,
  Utensils,
  Workflow,
  type LucideIcon,
} from 'lucide-react'

/**
 * Иконки, доступные для выбора в админке.
 *
 * Набор намеренно ограничен: так заказчик не поставит случайную
 * картинку из тысячи вариантов, а страницы сохранят единый стиль.
 * Ключ хранится в базе, поэтому переименовывать ключи нельзя —
 * можно только добавлять новые.
 */
export const ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  check: { icon: Check, label: 'Галочка' },
  'check-circle': { icon: CheckCircle2, label: 'Галочка в круге' },
  shield: { icon: Shield, label: 'Щит' },
  'shield-check': { icon: ShieldCheck, label: 'Щит с галочкой' },
  'shield-alert': { icon: ShieldAlert, label: 'Щит с восклицанием' },
  clock: { icon: Clock, label: 'Часы' },
  timer: { icon: Timer, label: 'Секундомер' },
  'map-pin': { icon: MapPin, label: 'Точка на карте' },
  'file-text': { icon: FileText, label: 'Документ' },
  'file-signature': { icon: FileSignature, label: 'Документ с подписью' },
  'message-circle': { icon: MessageCircle, label: 'Сообщение' },
  scale: { icon: Scale, label: 'Весы' },
  search: { icon: Search, label: 'Лупа' },
  'list-checks': { icon: ListChecks, label: 'Список с галочками' },
  'bar-chart': { icon: BarChart3, label: 'График' },
  'clipboard-list': { icon: ClipboardList, label: 'Планшет со списком' },
  'clipboard-check': { icon: ClipboardCheck, label: 'Планшет с галочкой' },
  'graduation-cap': { icon: GraduationCap, label: 'Обучение' },
  camera: { icon: Camera, label: 'Фотоаппарат' },
  calculator: { icon: Calculator, label: 'Калькулятор' },
  users: { icon: Users, label: 'Люди' },
  'trending-up': { icon: TrendingUp, label: 'Рост' },
  workflow: { icon: Workflow, label: 'Схема процесса' },
  target: { icon: Target, label: 'Мишень' },
  thermometer: { icon: Thermometer, label: 'Термометр' },
  utensils: { icon: Utensils, label: 'Общепит' },
}

export function getIcon(name: string | undefined): LucideIcon {
  return ICONS[name ?? '']?.icon ?? Check
}

export const ICON_OPTIONS = Object.entries(ICONS).map(([value, { label }]) => ({ value, label }))
