"use client"

import { usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // admin 인증 페이지들은 미들웨어에서 처리되므로 바로 렌더링
  if (pathname === '/admin/login' || pathname === '/admin/signup') {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  // 미들웨어에서 이미 인증을 처리했으므로 바로 렌더링
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}
