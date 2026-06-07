import type { Metadata } from "next"
import "../globals.css"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppHeader } from "@/components/layout/app-header"

export const metadata: Metadata = {
  title: "b1 TTS - Dashboard",
  description: "Production-quality Voice Cloning & TTS Dashboard",
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 overflow-auto bg-muted/30">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
