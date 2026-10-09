const errors = {
  CATALOG_INVALID_INPUT: { status: 400, message: 'Confira o nome, a quantidade, a unidade, os nutrientes e os dados de origem do alimento.' },
  CATALOG_INVALID_DECIMAL: { status: 400, message: 'Informe valores não negativos, com até 35 dígitos inteiros e 30 casas decimais. A quantidade deve ser maior que zero.' },
  CATALOG_INVALID_SOURCE: { status: 400, message: 'Confira a origem e os dados originais do alimento USDA.' },
  CATALOG_REVIEW_REQUIRED: { status: 400, message: 'Revise os nutrientes para a quantidade e unidade informadas e confirme a revisão.' },
  CATALOG_NOT_FOUND: { status: 404, message: 'Alimento cadastrado não encontrado. Atualize a lista e tente novamente.' },
  CATALOG_UNAVAILABLE: { status: 503, message: 'Não foi possível acessar o catálogo. Tente novamente.' },
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
