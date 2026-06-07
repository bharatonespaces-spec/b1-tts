import { NextResponse } from "next/server"
import { VoiceService } from "@/lib/services"
import { deleteVoice } from "@/lib/elevenlabs"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    
    // 1. Get the voice from database to find the providerVoiceId
    const voice = await VoiceService.getVoice(id)
    if (!voice) {
      return NextResponse.json({ success: false, error: "Voice not found" }, { status: 404 })
    }

    // 2. Delete from ElevenLabs
    try {
      await deleteVoice(voice.providerVoiceId)
    } catch (elevenLabsError) {
      console.error("Non-fatal ElevenLabs deletion error:", elevenLabsError)
      // We might still want to delete it from our DB if ElevenLabs already deleted it or it's out of sync
    }

    // 3. Delete from database
    await VoiceService.deleteVoice(id)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Delete Voice Error:", error)
    const message = error instanceof Error ? error.message : "Failed to delete voice"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
