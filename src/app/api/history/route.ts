import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// M-01 FIX: Default pagination limit to prevent unbounded SELECT queries
const DEFAULT_LIMIT = 100
// M-04 FIX: Search query max length to prevent timeout attacks
const MAX_SEARCH_LENGTH = 200

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // M-04 FIX: Cap search input server-side
    const rawSearch = searchParams.get("search") || ""
    const search = rawSearch.slice(0, MAX_SEARCH_LENGTH)

    // M-01 FIX: Add pagination
    const limit = Math.min(parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT)), DEFAULT_LIMIT)

    const audios = await prisma.generatedAudio.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search } },
              { inputText: { contains: search } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return NextResponse.json({ success: true, data: audios })
  } catch (error) {
    console.error("[History] Fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch audio history" }, { status: 500 })
  }
}
