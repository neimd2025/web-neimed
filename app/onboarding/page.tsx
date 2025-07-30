"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, ChevronLeft, ChevronRight, Smartphone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()

  const slides = [
    {
      icon: Smartphone,
      iconColor: "text-blue-600",
      title: "명함을 디지털로",
      subtitle: "종이 명함은 이제 그만!",
      description: "디지털 명함으로 더 스마트하게 네트워킹하세요. 언제 어디서든 쉽게 공유할 수 있습니다.",
      type: "onboarding",
    },
    {
      icon: BarChart3,
      iconColor: "text-orange-600",
      title: "연결을 관리하세요",
      subtitle: "수집한 명함 정리",
      description: "만난 사람들의 명함을 체계적으로 관리하고, 언제든지 다시 연락할 수 있어요.",
      type: "onboarding",
    },
    {
      type: "start",
      title: "Neimd",
      subtitle: "모두의 특별함이, 나답게 연결되는 시작",
    },
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const currentSlideData = slides[currentSlide]

  // 시작 화면 렌더링
  if (currentSlideData.type === "start") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-12">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">logo</span>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => router.push("/home")}>
            건너뛰기
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 space-y-8">
          {/* Logo */}
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 bg-red-500 rounded-2xl mx-auto mb-4"></div>
              <div className="w-20 h-20 bg-pink-300 rounded-full absolute top-2 left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                <span className="text-red-500 font-bold text-lg">logo</span>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white">{currentSlideData.title}</h1>
              <div className="text-white/90 space-y-1">
                <p className="text-lg">모두의 특별함이,</p>
                <p className="text-lg">나답게 연결되는 시작</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-sm space-y-6">
            <Button
              className="w-full bg-white text-purple-600 hover:bg-white/90 py-4 text-lg font-semibold rounded-2xl"
              onClick={() => {
                localStorage.setItem('hasSeenOnboarding', 'true')
                router.push('/home')
              }}
            >
              시작하기
            </Button>
            <Link href="/signup">
              <Button
                variant="outline"
                className="w-full border-2 border-white text-white hover:bg-white/10 py-4 text-lg font-semibold rounded-2xl bg-transparent"
              >
                회원가입
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between p-6 pb-12">
          <Button variant="ghost" className="text-white hover:bg-white/10 flex items-center" onClick={prevSlide}>
            <ChevronLeft className="h-5 w-5 mr-1" />
            이전
          </Button>
          <div className="flex justify-center space-x-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
          <div className="w-16"></div> {/* 균형을 위한 빈 공간 */}
        </div>
      </div>
    )
  }

  // 온보딩 슬라이드 렌더링
  const Icon = currentSlideData.icon!

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12">
        <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">logo</span>
        </div>
        <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => router.push("/home")}>
          건너뛰기
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl mx-4">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center">
              <Icon className={`h-10 w-10 ${currentSlideData.iconColor}`} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">{currentSlideData.title}</h2>
              <p className="text-lg font-medium text-purple-600">{currentSlideData.subtitle}</p>
            </div>

            <p className="text-gray-600 leading-relaxed">{currentSlideData.description}</p>
          </CardContent>
        </Card>

        {/* Page Indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-6 pb-12">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 flex items-center"
          onClick={prevSlide}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          이전
        </Button>

        <Button
          className="bg-white text-purple-600 hover:bg-white/90 px-8 py-3 rounded-xl font-semibold flex items-center"
          onClick={nextSlide}
        >
          다음
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>
    </div>
  )
}
