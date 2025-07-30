"use client"

import { ArrowLeft, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderNavigationProps {
  title?: string
  showBackButton?: boolean
  showQRButton?: boolean
  onBack?: () => void
}

export default function HeaderNavigation({
  title,
  showBackButton = false,
  showQRButton = false,
  onBack,
}: HeaderNavigationProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={onBack} className="mr-2 p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
        </div>

        {showQRButton && (
          <Button variant="ghost" size="sm" className="p-2">
            <QrCode className="h-5 w-5" />
          </Button>
        )}
      </div>
    </header>
  )
}
