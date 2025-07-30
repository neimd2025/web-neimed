import MobileBottomNav from "@/components/mobile-bottom-nav"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "../styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Named - 이름으로 시작하는 새로운 연결",
  description: "당신의 이름에 담긴 의미를 발견하고, 특별한 명함을 만들어 세상과 연결되세요.",
  generator: 'v0.dev'
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#7C38ED',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Named" />
      </head>
      <body className={`${inter.className} bg-gray-100 overflow-x-hidden`}>
        {/* 전체 앱 컨테이너 */}
        <div className="min-h-screen max-w-md mx-auto bg-white shadow-xl relative">
          <main>{children}</main>
        </div>
        {/* 네비게이션바는 컨테이너 밖에서 하단 고정 */}
        <MobileBottomNav />
      </body>
    </html>
  )
}
