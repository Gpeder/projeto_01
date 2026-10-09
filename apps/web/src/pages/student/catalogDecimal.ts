// Texto decimal canônico: mantém os dígitos do formulário sem passar por Number.
export function catalogDecimal(text: string): string {
  const match = /^\+?(?:(\d+)(?:\.(\d*))?|\.(\d+))(?:[eE]([+-]?\d{1,3}))?$/.exec(text.trim())
  if (!match) throw new Error('Informe um número decimal válido e não negativo.')
  const integer = match[1] ?? '0'
  const digits = integer + (match[2] ?? match[3] ?? '')
  const point = integer.length + Number(match[4] ?? 0)
  const expanded = point <= 0 ? `0.${'0'.repeat(-point)}${digits}`
    : point >= digits.length ? digits + '0'.repeat(point - digits.length) : `${digits.slice(0, point)}.${digits.slice(point)}`
  const [whole = '0', fraction = ''] = expanded.split('.')
  const normalizedWhole = whole.replace(/^0+(?=\d)/, '')
  const normalizedFraction = fraction.replace(/0+$/, '')
  if (normalizedWhole.length > 35 || normalizedFraction.length > 30) throw new Error('Use até 35 dígitos inteiros e 30 casas decimais, sem arredondamento.')
  return normalizedWhole + (normalizedFraction ? `.${normalizedFraction}` : '')
}
