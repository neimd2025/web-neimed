/**
 * 쿠폰 코드 생성 유틸리티
 */

// 쿠폰 코드에 사용할 문자 (혼동하기 쉬운 문자 제외: 0, O, I, 1, l)
const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

/**
 * 랜덤 문자열 생성
 */
function generateRandomString(length: number): string {
  let result = ""
  for (let i = 0; i < length; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length))
  }
  return result
}

/**
 * 체크섬 계산 (간단한 검증용)
 */
function calculateChecksum(code: string): string {
  let sum = 0
  for (let i = 0; i < code.length; i++) {
    sum += code.charCodeAt(i) * (i + 1)
  }
  return CHARACTERS.charAt(sum % CHARACTERS.length)
}

/**
 * 쿠폰 코드 생성
 * 형태: XXXX-YYYY-ZZZZ (12자리 + 대시 2개)
 */
export function generateCouponCode(): string {
  const part1 = generateRandomString(4)
  const part2 = generateRandomString(4)
  const part3 = generateRandomString(3)

  // 체크섬 추가
  const baseCode = part1 + part2 + part3
  const checksum = calculateChecksum(baseCode)

  return `${part1}-${part2}-${part3}${checksum}`
}

/**
 * 쿠폰 코드 유효성 검증
 */
export function validateCouponCode(code: string): boolean {
  // 형태 검증: XXXX-YYYY-ZZZZ
  const pattern = /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/
  if (!pattern.test(code)) {
    return false
  }

  // 체크섬 검증
  const cleanCode = code.replace(/-/g, "")
  const baseCode = cleanCode.slice(0, -1)
  const providedChecksum = cleanCode.slice(-1)
  const calculatedChecksum = calculateChecksum(baseCode)

  return providedChecksum === calculatedChecksum
}

/**
 * 프리미엄 쿠폰 코드 생성 (더 긴 코드)
 * 형태: PREMIUM-XXXX-YYYY-ZZZZ
 */
export function generatePremiumCouponCode(): string {
  const part1 = generateRandomString(4)
  const part2 = generateRandomString(4)
  const part3 = generateRandomString(4)

  return `PREMIUM-${part1}-${part2}-${part3}`
}

/**
 * 이벤트 전용 쿠폰 코드 생성
 * 형태: EVENT-XXXX-YYYY
 */
export function generateEventCouponCode(): string {
  const part1 = generateRandomString(4)
  const part2 = generateRandomString(4)

  return `EVENT-${part1}-${part2}`
}

/**
 * 쿠폰 타입별 코드 생성
 */
export function generateCouponCodeByType(type: "standard" | "premium" | "event" = "standard"): string {
  switch (type) {
    case "premium":
      return generatePremiumCouponCode()
    case "event":
      return generateEventCouponCode()
    default:
      return generateCouponCode()
  }
}

/**
 * 배치 쿠폰 코드 생성 (중복 방지)
 */
export function generateBatchCouponCodes(count: number, type: "standard" | "premium" | "event" = "standard"): string[] {
  const codes = new Set<string>()

  while (codes.size < count) {
    const code = generateCouponCodeByType(type)
    codes.add(code)
  }

  return Array.from(codes)
}
