import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * Минимальное чтение .env-файлов.
 *
 * Отдельная зависимость ради разбора десяти строк не нужна: Vite и так
 * читает эти файлы сам, а скриптам сборки достаточно вот этого.
 */
export function loadEnv(root = process.cwd()) {
  const env = { ...process.env }

  for (const name of ['.env', '.env.local', '.env.production', '.env.production.local']) {
    const path = resolve(root, name)
    if (!existsSync(path)) continue

    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const index = trimmed.indexOf('=')
      if (index === -1) continue

      const key = trimmed.slice(0, index).trim()
      const value = trimmed
        .slice(index + 1)
        .trim()
        .replace(/^["']|["']$/g, '')

      // Переменные окружения важнее файлов: так работает CI.
      if (!(key in process.env)) env[key] = value
    }
  }

  return env
}
