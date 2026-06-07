"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
      router.refresh()
    }
    logout()
  }, [router])

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-muted/30">
      <p className="text-muted-foreground animate-pulse">Signing out...</p>
    </div>
  )
}
