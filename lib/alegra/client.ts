/**
 * lib/alegra/client.ts
 *
 * Módulo cliente HTTP centralizado para la API de Alegra.
 * NINGUNA parte del proyecto llama directamente a Alegra fuera de este módulo.
 *
 * Responsabilidades:
 * - Autenticación HTTP Basic (ALEGRA_USER + ALEGRA_TOKEN en base64)
 * - Control proactivo de rate-limit leyendo X-Rate-Limit-Remaining / X-Rate-Limit-Reset
 * - Retry con backoff exponencial ante 429 y 500
 * - Sin reintento ante 400, 401, 403, 404 (errores de datos o permisos)
 */

const ALEGRA_BASE_URL = 'https://api.alegra.com/api/v1'

/** Umbral de remanente bajo. Si remaining <= RATE_LIMIT_FLOOR, se espera hasta el reset. */
const RATE_LIMIT_FLOOR = 5

/** Máximo de reintentos ante errores transitorios (429, 500). */
const MAX_RETRIES = 3

/** Estado de rate-limit en memoria compartido por todas las llamadas en el mismo proceso. */
const rateLimitState = {
  remaining: Infinity,
  resetAt: 0, // timestamp en ms cuando se resetea la ventana
}

/** Errores de Alegra que se pueden reintentar (saturación / error temporal de servidor). */
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])

/** Errores de Alegra que NO se reintentan (datos o permisos incorrectos). */
const NO_RETRY_STATUSES = new Set([400, 401, 403, 404])

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildAuthHeader(): string {
  const user = process.env.ALEGRA_USER
  const token = process.env.ALEGRA_TOKEN

  if (!user || !token) {
    throw new AlegraConfigError(
      'Credenciales de Alegra no configuradas. Define ALEGRA_USER y ALEGRA_TOKEN en las variables de entorno.'
    )
  }

  const encoded = Buffer.from(`${user}:${token}`).toString('base64')
  return `Basic ${encoded}`
}

function updateRateLimitState(headers: Headers): void {
  const remaining = headers.get('X-Rate-Limit-Remaining')
  const reset = headers.get('X-Rate-Limit-Reset')

  if (remaining !== null) {
    rateLimitState.remaining = parseInt(remaining, 10)
  }
  if (reset !== null) {
    // X-Rate-Limit-Reset suele ser unix timestamp en segundos
    rateLimitState.resetAt = parseInt(reset, 10) * 1000
  }
}

async function waitForRateLimitIfNeeded(): Promise<void> {
  if (rateLimitState.remaining <= RATE_LIMIT_FLOOR) {
    const now = Date.now()
    const waitMs = Math.max(0, rateLimitState.resetAt - now) + 200 // +200ms de margen
    if (waitMs > 0) {
      console.warn(
        `[Alegra] Rate-limit bajo (remaining=${rateLimitState.remaining}). Esperando ${waitMs}ms hasta el reset.`
      )
      await new Promise(resolve => setTimeout(resolve, waitMs))
    }
  }
}

function backoffMs(attempt: number): number {
  // Backoff exponencial: 1s, 2s, 4s, con jitter de ±200ms
  const base = Math.pow(2, attempt) * 1000
  const jitter = Math.floor(Math.random() * 400) - 200
  return base + jitter
}

// ─── Tipos de error ───────────────────────────────────────────────────────────

export class AlegraConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AlegraConfigError'
  }
}

export class AlegraApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | null,
    message: string
  ) {
    super(message)
    this.name = 'AlegraApiError'
  }
}

// ─── Cliente principal ────────────────────────────────────────────────────────

export interface AlegraRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Parámetros de query string adicionales */
  params?: Record<string, string>
}

/**
 * Hace una llamada autenticada al API de Alegra.
 *
 * @param path - Ruta relativa a la base URL, ej: '/items/123', '/inventory-adjustments'
 * @param options - Método HTTP, body y params opcionales
 * @returns El body JSON de la respuesta ya parseado
 * @throws AlegraConfigError si las credenciales no están configuradas
 * @throws AlegraApiError si la API devuelve un error HTTP
 */
export async function alegraRequest<T = unknown>(
  path: string,
  options: AlegraRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, params } = options

  let url = `${ALEGRA_BASE_URL}${path}`
  if (params && Object.keys(params).length > 0) {
    const qs = new URLSearchParams(params).toString()
    url = `${url}?${qs}`
  }

  const headers: Record<string, string> = {
    Authorization: buildAuthHeader(),
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // Esperar si el rate-limit está bajo antes de cada intento
    await waitForRateLimitIfNeeded()

    let response: Response
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      })
    } catch (networkError) {
      // Error de red (sin respuesta) — siempre reintentable
      lastError = networkError instanceof Error ? networkError : new Error(String(networkError))
      if (attempt < MAX_RETRIES) {
        const wait = backoffMs(attempt)
        console.warn(`[Alegra] Error de red en ${method} ${path} (intento ${attempt + 1}/${MAX_RETRIES + 1}). Reintentando en ${wait}ms.`)
        await new Promise(resolve => setTimeout(resolve, wait))
        continue
      }
      throw lastError
    }

    // Actualizar estado de rate-limit con cada respuesta
    updateRateLimitState(response.headers)

    if (response.ok) {
      // 204 No Content — retornar objeto vacío
      if (response.status === 204) return {} as T
      return (await response.json()) as T
    }

    // Leer cuerpo del error para logging y mensajes
    let errorBody: { message?: string; code?: string } = {}
    try {
      errorBody = await response.json()
    } catch {
      // Si el body no es JSON, lo ignoramos
    }

    const errorMessage = errorBody.message ?? `HTTP ${response.status} en ${method} ${path}`

    // Errores que NO se reintentan
    if (NO_RETRY_STATUSES.has(response.status)) {
      throw new AlegraApiError(response.status, errorBody.code ?? null, errorMessage)
    }

    // Errores reintentables
    if (RETRYABLE_STATUSES.has(response.status)) {
      lastError = new AlegraApiError(response.status, errorBody.code ?? null, errorMessage)

      if (attempt < MAX_RETRIES) {
        let wait: number
        if (response.status === 429) {
          // Preferir el header Retry-After si existe
          const retryAfter = response.headers.get('Retry-After')
          wait = retryAfter ? parseInt(retryAfter, 10) * 1000 : backoffMs(attempt)
        } else {
          wait = backoffMs(attempt)
        }
        console.warn(
          `[Alegra] ${response.status} en ${method} ${path} (intento ${attempt + 1}/${MAX_RETRIES + 1}). Reintentando en ${wait}ms.`
        )
        await new Promise(resolve => setTimeout(resolve, wait))
        continue
      }
      throw lastError
    }

    // Cualquier otro status no contemplado — no reintentar
    throw new AlegraApiError(response.status, errorBody.code ?? null, errorMessage)
  }

  // No debería llegar aquí, pero TypeScript lo requiere
  throw lastError ?? new Error(`[Alegra] Fallo inesperado en ${method} ${path}`)
}

/**
 * Expone el estado actual del rate-limit en memoria.
 * Útil para diagnóstico o dashboards de salud de la integración.
 */
export function getAlegraRateLimitState(): Readonly<typeof rateLimitState> {
  return rateLimitState
}
