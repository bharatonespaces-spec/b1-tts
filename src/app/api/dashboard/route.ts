import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const totalVoices = await prisma.voice.count()
    const totalAudioFiles = await prisma.generatedAudio.count()
    
    // Calculate total characters generated
    const allAudios = await prisma.generatedAudio.findMany({
      select: { inputText: true }
    })
    const charactersGenerated = allAudios.reduce((acc: number, audio: { inputText: string }) => acc + (audio.inputText?.length || 0), 0)

    // Fetch recent activity
    const recentActivity = await prisma.generatedAudio.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        createdAt: true,
        audioUrl: true,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalVoices,
        totalAudioFiles,
        charactersGenerated,
        recentActivity
      }
    })
  } catch (error) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
