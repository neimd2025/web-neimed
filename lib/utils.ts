import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 개발 환경에서만 콘솔 에러를 출력하는 유틸리티 함수
 * @param message 에러 메시지
 * @param error 에러 객체
 */
export const logError = (message: string, error?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, error)
  }
}

/**
 * 개발 환경에서만 콘솔 로그를 출력하는 유틸리티 함수
 * @param message 로그 메시지
 * @param data 로그 데이터
 */
export const logInfo = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data)
  }
}

/**
 * 개발 환경에서만 콘솔 경고를 출력하는 유틸리티 함수
 * @param message 경고 메시지
 * @param data 경고 데이터
 */
export const logWarning = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(message, data)
  }
}
