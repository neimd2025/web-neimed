"use client"

import MobileHeader from "@/components/mobile-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, MapPin, Share } from "lucide-react"
import { useRouter } from "next/navigation"
import QRCode from "qrcode"
import { useEffect, useState } from "react"

export default function MyQRPage() {
  const router = useRouter()
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("")

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const url = await QRCode.toDataURL("https://neimd.link/1s2v", {
          width: 240,
          margin: 2,
          color: {
            dark: "#7C38ED",
            light: "#FFFFFF",
          },
        })
        setQrCodeDataURL(url)
      } catch (err) {
        console.error("QR Code generation failed:", err)
      }
    }
    generateQRCode()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <MobileHeader title="내 QR코드" showBackButton onBack={() => router.back()} showMenuButton />

      <div className="px-4 py-6 space-y-6">
        {/* QR Code Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 text-center space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">허수정</h2>
              <p className="text-gray-500">QR코드를 스캔하여 명함을 확인할 수 있어요</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center justify-center">
                {qrCodeDataURL ? (
                  <img
                    src={qrCodeDataURL || "/placeholder.svg"}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">QR 코드 생성 중...</span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-500">neimd.link/1s2v</p>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl">
                <Share className="h-5 w-5 mr-2" />
                공유
              </Button>
              <Button variant="outline" className="border-2 border-gray-200 py-3 rounded-xl bg-transparent">
                <Download className="h-5 w-5 mr-2" />
                저장
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QR Code Usage Tip */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-purple-900 mb-1">QR 코드 사용 팁</h4>
                <p className="text-sm text-purple-700">
                  스마트폰 카메라로 QR코드를 스캔하거나, Named 앱의 QR 스캔 기능을 사용해보세요!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
