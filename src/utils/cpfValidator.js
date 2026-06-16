export function stripCpf(value) {
  return String(value ?? '').replace(/\D/g, '')
}

export function formatCpf(value) {
  const digits = stripCpf(value).slice(0, 11)

  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function allSameDigits(digits) {
  return digits.split('').every((digit) => digit === digits[0])
}

function calcCheckDigit(digits, factor) {
  let sum = 0

  for (let i = 0; i < digits.length; i += 1) {
    sum += Number(digits[i]) * (factor - i)
  }

  const remainder = (sum * 10) % 11
  return remainder === 10 ? 0 : remainder
}

export function isValidCpf(cpf) {
  const digits = stripCpf(cpf)

  if (digits.length !== 11 || allSameDigits(digits)) {
    return false
  }

  const base = digits.slice(0, 9)
  const firstCheck = calcCheckDigit(base, 10)
  const secondCheck = calcCheckDigit(base + String(firstCheck), 11)

  return digits === base + String(firstCheck) + String(secondCheck)
}
