// 이미지 최적화 유틸리티

export interface ImageOptimizationOptions {
  quality?: number
  width?: number
  height?: number
  format?: 'webp' | 'jpeg' | 'png'
  blur?: number
}

// 이미지 압축 함수
export const compressImage = async (
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> => {
  const {
    quality = 0.8,
    width,
    height,
    format = 'webp'
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new window.Image()

    img.onload = () => {
      // 캔버스 크기 설정
      let targetWidth = width || img.width
      let targetHeight = height || img.height

      // 비율 유지하면서 크기 조정
      if (width && height) {
        const ratio = Math.min(width / img.width, height / img.height)
        targetWidth = img.width * ratio
        targetHeight = img.height * ratio
      }

      canvas.width = targetWidth
      canvas.height = targetHeight

      // 이미지 그리기
      ctx?.drawImage(img, 0, 0, targetWidth, targetHeight)

      // 압축된 이미지 생성
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: `image/${format}`,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            reject(new Error('이미지 압축 실패'))
          }
        },
        `image/${format}`,
        quality
      )
    }

    img.onerror = () => reject(new Error('이미지 로드 실패'))
    img.src = URL.createObjectURL(file)
  })
}

// 프로필 이미지 최적화
export const optimizeProfileImage = async (file: File): Promise<File> => {
  return compressImage(file, {
    quality: 0.8,
    width: 400,
    height: 400,
    format: 'webp'
  })
}

// QR코드 이미지 최적화
export const optimizeQRCodeImage = async (file: File): Promise<File> => {
  return compressImage(file, {
    quality: 0.9,
    width: 300,
    height: 300,
    format: 'png'
  })
}

// 이미지 크기 검증
export const validateImageSize = (file: File, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

// 이미지 형식 검증
export const validateImageFormat = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return allowedTypes.includes(file.type)
}

// 이미지 미리보기 URL 생성
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string)
      } else {
        reject(new Error('이미지 미리보기 생성 실패'))
      }
    }
    reader.onerror = () => reject(new Error('이미지 읽기 실패'))
    reader.readAsDataURL(file)
  })
}

// 이미지 메타데이터 추출
export const extractImageMetadata = (file: File): Promise<{
  width: number
  height: number
  size: number
  type: string
}> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type
      })
    }
    img.onerror = () => reject(new Error('이미지 메타데이터 추출 실패'))
    img.src = URL.createObjectURL(file)
  })
}

// 이미지 캐싱 전략
export class ImageCache {
  private cache = new Map<string, string>()
  private maxSize = 50 // 최대 캐시 개수

  set(key: string, value: string): void {
    if (this.cache.size >= this.maxSize) {
      // LRU 캐시 정책: 가장 오래된 항목 제거
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }

  get(key: string): string | undefined {
    return this.cache.get(key)
  }

  has(key: string): boolean {
    return this.cache.has(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

// 전역 이미지 캐시 인스턴스
export const imageCache = new ImageCache()

// 이미지 로딩 상태 관리
export const useImageLoader = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadImage = async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      // 캐시 확인
      const cacheKey = `${file.name}-${file.size}-${file.lastModified}`
      if (imageCache.has(cacheKey)) {
        setIsLoading(false)
        return imageCache.get(cacheKey)!
      }

      // 이미지 최적화
      const optimizedFile = await optimizeProfileImage(file)
      const previewUrl = await createImagePreview(optimizedFile)

      // 캐시에 저장
      imageCache.set(cacheKey, previewUrl)

      setIsLoading(false)
      return previewUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : '이미지 로딩 실패')
      setIsLoading(false)
      throw err
    }
  }

  return {
    loadImage,
    isLoading,
    error
  }
}

// React import 추가
import { useState } from 'react'
