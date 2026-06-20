import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import { toCabinetApiError } from './errors'

export const BASE = import.meta.env.VITE_API_BASE ?? ''

function logApiError(error: unknown, normalized: Error & { status?: number }) {
  if (!import.meta.env.DEV) return

  if (axios.isAxiosError(error)) {
    console.warn('[cabinet-api] request failed', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: normalized.status,
      message: normalized.message,
    })
    return
  }

  console.warn('[cabinet-api] request failed', {
    status: normalized.status,
    message: normalized.message,
  })
}

export function createClient(baseURL: string, headers?: Record<string, string>): AxiosInstance {
  const client = axios.create({
    baseURL,
    withCredentials: true,
    ...(headers ? { headers } : {}),
  })

  client.interceptors.response.use(
    response => response,
    error => {
      const normalized = toCabinetApiError(error)
      logApiError(error, normalized)
      return Promise.reject(normalized)
    },
  )

  return client
}

export function unwrap<T>(request: Promise<AxiosResponse<T>>): Promise<T> {
  return request.then(({ data }) => data)
}

// Приватное API пользователя (/api/user, requireUserAuth)
export const http = createClient(`${BASE}/api/user`, {
  'Content-Type': 'application/json',
})

// Публичное API (товары, промокоды, без /api/user)
export const pub = createClient(`${BASE}/api`)
