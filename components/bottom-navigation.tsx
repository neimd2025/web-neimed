"use client"

import { Home, Bookmark, Bell, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function BottomNavigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", icon: Home, label: "홈" },
    { href: "/saved-cards", icon: Bookmark, label: "저장된 명함" },
    { href: "/notifications", icon: Bell, label: "알림" },
    { href: "/my-page", icon: User, label: "마이 메뉴" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 min-w-0 flex-1 ${
                isActive ? "text-purple-600" : "text-gray-500 hover:text-purple-600"
              } transition-colors`}
            >
              <Icon className={`h-6 w-6 mb-1 ${isActive ? "text-purple-600" : ""}`} />
              <span className={`text-xs font-medium ${isActive ? "text-purple-600" : ""}`}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
