"use client"

import { useAdminStore } from "@/stores/admin-store"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { initializeAdminAuth, initialized } = useAdminStore()

  useEffect(() => {
    if (!initialized) {
      initializeAdminAuth()
    }
  }, [initialized, initializeAdminAuth])

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
