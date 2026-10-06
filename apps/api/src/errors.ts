const errors = {
  INVALID_INPUT: { status: 400, message: 'Parâmetros inválidos.' },
  FOOD_NOT_FOUND: { status: 404, message: 'Alimento não encontrado.' },
  ROUTE_NOT_FOUND: { status: 404, message: 'Rota não encontrada.' },
  USDA_RATE_LIMIT: { status: 429, message: 'Limite de consultas à USDA atingido. Tente mais tarde.' },
  USDA_INVALID_RESPONSE: { status: 502, message: 'Resposta inválida do serviço de alimentos.' },
  USDA_UNAVAILABLE: { status: 503, message: 'Serviço de alimentos temporariamente indisponível.' },
  USDA_TIMEOUT: { status: 504, message: 'O serviço de alimentos demorou para responder.' },
  INTERNAL_ERROR: { status: 500, message: 'Não foi possível concluir a solicitação.' },
} as const

export type ErrorCode = keyof typeof errors
const publicErrors = new WeakMap<Error, ErrorCode>()

export function apiError(code: ErrorCode): Error {
  const error = new Error(errors[code].message)
  publicErrors.set(error, code)
  return error
}

export function publicError(error: unknown) {
  const code = error instanceof Error ? publicErrors.get(error) ?? 'INTERNAL_ERROR' : 'INTERNAL_ERROR'
  return { status: errors[code].status, body: { error: { code, message: errors[code].message } } }
}
