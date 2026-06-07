import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// L-02 FIX: Health check endpoint for Docker HEALTHCHECK, load balancers, and uptime monitors.
// Without this, containers restart blindly with no visibility into DB connectivity.
export async function GET() {
  try {
    // Verify database connection is alive
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[Health] Database connectivity check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      },
      { status: 503 }
    )
  }
}
