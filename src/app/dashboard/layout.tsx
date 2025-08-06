// app/dashboard/layout.tsx
"use client"

import { CekTaniSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CekTaniSidebar>
      <div className="">
        {children}
      </div>
    </CekTaniSidebar>
  )
}