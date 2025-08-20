import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function logError(message: string, error: any) {
  console.error(message, error)
}

// 환경에 따른 사이트 URL 결정
export function getSiteUrl(): string {
  // 환경변수가 설정되어 있으면 사용
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  // 클라이언트 사이드에서는 현재 도메인 사용
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // 서버 사이드에서는 환경에 따라 결정
  const isProduction = process.env.NODE_ENV === 'production'
  return isProduction
    ? 'https://web-neimed.vercel.app' // Vercel 배포 URL
    : 'http://localhost:3000'
}

// QR 코드 URL 생성
export function generateQRCodeUrl(cardId: string): string {
  const siteUrl = getSiteUrl()
  return `${siteUrl}/business-card/${cardId}`
}
