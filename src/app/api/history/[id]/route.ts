import { NextResponse } from "next/server"
import { AudioService } from "@/lib/services"
import fs from "fs/promises"
import path from "path"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    
    // 1. Get the audio record to find the file path
    const audio = await AudioService.getAudio(id)
    if (!audio) {
      return NextResponse.json({ success: false, error: "Audio record not found" }, { status: 404 })
    }

    // 2. Delete from database
    await AudioService.deleteAudio(id)

    // 3. Delete from filesystem (non-fatal if missing)
    if (audio.audioUrl.startsWith("/audio/")) {
      const fileName = path.basename(audio.audioUrl)
      const filePath = path.join(process.cwd(), "public", "audio", fileName)
      try {
        await fs.unlink(filePath)
      } catch (fsError) {
        console.error("Failed to delete audio file from filesystem:", fsError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Delete Audio Error:", error)
    const message = error instanceof Error ? error.message : "Failed to delete audio"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
