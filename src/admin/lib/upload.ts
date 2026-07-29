import { getFirebaseStorage } from '@/lib/firebase'
import type { ImageValue } from '@/schemas/content'

/**
 * Загрузка изображений.
 *
 * Картинка сжимается и переводится в WebP прямо в браузере до отправки.
 * Это важно: заказчик будет грузить фотографии с телефона по 5–8 МБ, а
 * на сайт должно попадать 100–200 КБ, иначе вся работа над скоростью
 * загрузки обесценится первой же публикацией.
 */

const MAX_DIMENSION = 1800
const QUALITY = 0.82
const MAX_SOURCE_BYTES = 25 * 1024 * 1024

export type UploadResult = ImageValue & { path: string; size: number }

export async function compressImage(
  file: File,
): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file)

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Не удалось обработать изображение')

  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', QUALITY),
  )
  if (!blob) throw new Error('Не удалось сжать изображение')

  return { blob, width, height }
}

export async function uploadImage(file: File, folder = 'images'): Promise<UploadResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Можно загружать только изображения')
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('Файл больше 25 МБ. Уменьшите изображение и попробуйте снова')
  }

  const { blob, width, height } = await compressImage(file)

  const [storage, { ref, uploadBytes, getDownloadURL }] = await Promise.all([
    getFirebaseStorage(),
    import('firebase/storage'),
  ])

  const safeName = file.name
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9а-яА-Я-]/g, '-')
    .slice(0, 40)
  const path = `${folder}/${Date.now()}-${safeName || 'image'}.webp`

  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, blob, {
    contentType: 'image/webp',
    cacheControl: 'public, max-age=31536000, immutable',
  })

  return {
    url: await getDownloadURL(storageRef),
    alt: '',
    width,
    height,
    path,
    size: blob.size,
  }
}

export async function deleteImage(path: string): Promise<void> {
  const [storage, { ref, deleteObject }] = await Promise.all([
    getFirebaseStorage(),
    import('firebase/storage'),
  ])
  await deleteObject(ref(storage, path))
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`
}
