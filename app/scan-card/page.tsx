'use client'

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import jsQR from 'jsqr'
import { ArrowLeft, Flashlight, Image, Keyboard } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'

export default function ScanCardPage() {
  const [isFlashOn, setIsFlashOn] = useState(false)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 카메라 활성화
  const activateCamera = useCallback(() => {
    setIsCameraActive(true)
    setIsScanning(true)
  }, [])

  // QR 코드 스캔
  const scanQRCode = useCallback(() => {
    if (webcamRef.current && canvasRef.current) {
      const video = webcamRef.current.video
      if (video) {
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        if (context) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          context.drawImage(video, 0, 0, canvas.width, canvas.height)

          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)

          if (code) {
            console.log('QR 코드 감지:', code.data)
            // QR 코드 데이터 처리
            handleQRCodeDetected(code.data)
            return
          }
        }
      }
    }

    // QR 코드가 감지되지 않으면 계속 스캔
    if (isScanning) {
      requestAnimationFrame(scanQRCode)
    }
  }, [isScanning])

  // QR 코드 감지 시 처리
  const handleQRCodeDetected = useCallback((qrData: string) => {
    setIsScanning(false)
    console.log('QR 코드 데이터:', qrData)

    // 여기서 QR 코드 데이터를 파싱하여 명함 정보 추출
    try {
      const cardData = JSON.parse(qrData)
      // 명함 데이터 처리 및 저장
      console.log('명함 데이터:', cardData)

      // 성공 메시지 표시 후 명함 상세 페이지로 이동
      alert('명함이 성공적으로 스캔되었습니다!')
      // 실제로는 여기서 명함 데이터를 저장하고 상세 페이지로 이동
      // router.push(`/saved-cards/${cardData.id}`)
    } catch (error) {
      console.error('QR 코드 파싱 오류:', error)

      // QR 코드가 JSON이 아닌 경우 다른 형식으로 처리
      if (qrData.startsWith('named.link/')) {
        // 공유 링크 형식인 경우
        const cardId = qrData.split('/').pop()
        console.log('명함 링크 감지:', cardId)
        alert('명함 링크가 감지되었습니다!')
        // router.push(`/business-card/${cardId}`)
      } else {
        alert('유효하지 않은 QR 코드입니다.')
      }
    }
  }, [])

  // 카메라 활성화 시 QR 스캔 시작
  useEffect(() => {
    if (isCameraActive && isScanning) {
      scanQRCode()
    }
  }, [isCameraActive, isScanning, scanQRCode])

  // 사진 촬영
  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      setCapturedImage(imageSrc)
    }
  }, [])

  // 갤러리에서 이미지 선택
  const handleGallerySelect = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageSrc = e.target?.result as string
          setCapturedImage(imageSrc)

          // 갤러리 이미지에서 QR 코드 스캔
          const img = new window.Image()
          img.onload = () => {
            const canvas = canvasRef.current
            if (canvas) {
              const context = canvas.getContext('2d')
              if (context) {
                canvas.width = img.width
                canvas.height = img.height
                context.drawImage(img, 0, 0)

                const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
                const code = jsQR(imageData.data, imageData.width, imageData.height)

                if (code) {
                  handleQRCodeDetected(code.data)
                } else {
                  alert('이미지에서 QR 코드를 찾을 수 없습니다.')
                }
              }
            }
          }
          img.src = imageSrc
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }, [handleQRCodeDetected])

  // 수동 입력 페이지로 이동
  const handleManualInput = useCallback(() => {
    // 수동 입력 페이지로 이동하는 로직
    console.log('수동 입력 페이지로 이동')
  }, [])

  // QR 코드 스캔 시뮬레이션 (개발용)
  const simulateQRScan = useCallback(() => {
    const mockQRData = JSON.stringify({
      id: '123',
      name: '김철수',
      company: '테크컴퍼니',
      position: '개발자',
      email: 'kim@tech.com',
      phone: '010-1234-5678'
    })
    handleQRCodeDetected(mockQRData)
  }, [handleQRCodeDetected])

  return (
    <div className="min-h-screen bg-black">
      {/* 숨겨진 캔버스 (QR 스캔용) */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 헤더 */}
      <div className="absolute top-0 left-0 right-0 z-10 px-5 py-4">
        <div className="flex items-center justify-between">
          <Link href="/home">
            <Button variant="ghost" size="sm" className="p-2 bg-white/10 hover:bg-white/20">
              <ArrowLeft className="w-4 h-4 text-white" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-white">명함 스캔</h1>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 bg-white/10 hover:bg-white/20"
            onClick={() => setIsFlashOn(!isFlashOn)}
          >
            <Flashlight className={`w-4 h-4 ${isFlashOn ? 'text-yellow-400' : 'text-white'}`} />
          </Button>
        </div>
      </div>

      {/* 카메라 뷰 */}
      <div className="relative w-full h-full min-h-screen">
        {!isCameraActive ? (
          // 카메라 시작 화면
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black">
            {/* 스캔 프레임 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-white rounded-2xl relative">
                {/* 스캔 영역 표시 */}
                <div className="absolute inset-0 border-2 border-white rounded-2xl"></div>

                {/* 모서리 표시 */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-purple-600 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-purple-600 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-purple-600 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-purple-600 rounded-br-lg"></div>
              </div>
            </div>

            {/* 안내 텍스트 */}
            <div className="absolute bottom-32 left-0 right-0 text-center px-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-lg font-semibold text-white mb-2">
                  상대방의 명함 QR 코드를 스캔하세요
                </h2>
                <p className="text-gray-300 text-sm">
                  자동으로 인식되어 명함이 저장됩니다
                </p>
              </motion.div>
            </div>

            {/* 카메라 시작 버튼 */}
            <div className="absolute bottom-40 left-0 right-0 text-center">
              <Button
                onClick={activateCamera}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
              >
                카메라 시작
              </Button>
            </div>
          </div>
        ) : (
          // 실제 카메라 화면
          <div className="relative w-full h-full">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: "environment" // 후면 카메라 사용
              }}
            />

            {/* 스캔 프레임 오버레이 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-2 border-white rounded-2xl relative">
                {/* 모서리 표시 */}
                <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-purple-600 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-purple-600 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-purple-600 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-purple-600 rounded-br-lg"></div>
              </div>
            </div>

            {/* 스캔 중 표시 */}
            {isScanning && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-white text-center">
                  <div className="animate-pulse">QR 코드 스캔 중...</div>
                </div>
              </div>
            )}

            {/* 촬영 버튼 */}
            <div className="absolute bottom-32 left-0 right-0 text-center">
              <Button
                onClick={capturePhoto}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center"
              >
                <div className="w-12 h-12 bg-purple-600 rounded-full"></div>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼들 */}
      <div className="absolute bottom-20 left-0 right-0 px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center gap-3"
        >
          <Button
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={handleGallerySelect}
          >
            <Image className="w-4 h-4 mr-2" />
            갤러리
          </Button>

          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleManualInput}
          >
            <Keyboard className="w-4 h-4 mr-2" />
            수동 입력
          </Button>
        </motion.div>
      </div>


      {/* QR 스캔 시뮬레이션 버튼 (개발용) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-20 right-5">
          <Button
            onClick={simulateQRScan}
            className="bg-red-600 hover:bg-red-700 text-white text-xs"
          >
            QR 스캔 시뮬레이션
          </Button>
        </div>
      )}
    </div>
  )
}
