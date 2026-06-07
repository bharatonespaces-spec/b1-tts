import { NextResponse } from "next/server"
import { generateSpeech } from "@/lib/elevenlabs"
import { AudioService, VoiceService } from "@/lib/services"
import { randomUUID } from "crypto"
import fs from "fs/promises"
import path from "path"

// C-02 FIX: Hard cap on input length to prevent ElevenLabs API quota exhaustion
const MAX_CHARS = 5000

export async function POST(req: Request) {
  try {
    const { text, voiceId, speed } = await req.json()

    if (!text || !voiceId) {
      return NextResponse.json({ success: false, error: "Text and Voice ID are required" }, { status: 400 })
    }

    // C-02 FIX: Reject requests exceeding character limit
    if (typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Text must be a non-empty string" }, { status: 400 })
    }

    if (text.length > MAX_CHARS) {
      return NextResponse.json(
        { success: false, error: `Text exceeds maximum length of ${MAX_CHARS} characters` },
        { status: 400 }
      )
    }

    // 1. Get voice details from database to pass provider ID
    const voice = await VoiceService.getVoice(voiceId)
    if (!voice) {
      return NextResponse.json({ success: false, error: "Selected voice not found in database" }, { status: 404 })
    }

    // 2. Generate speech via ElevenLabs
    const audioBuffer = await generateSpeech(voice.providerVoiceId, text, speed)

    // 3. Save audio file to public/audio
    const fileName = `${randomUUID()}.mp3`
    const audioDir = path.join(process.cwd(), "public", "audio")

    // Ensure directory exists
    try {
      await fs.access(audioDir)
    } catch {
      await fs.mkdir(audioDir, { recursive: true })
    }

    const filePath = path.join(audioDir, fileName)
    await fs.writeFile(filePath, Buffer.from(audioBuffer))

    const audioUrl = `/audio/${fileName}`
    const title = text.split(" ").slice(0, 5).join(" ") + (text.split(" ").length > 5 ? "..." : "")

    // 4. Save metadata to database
    const generatedAudio = await AudioService.createAudio({
      title,
      inputText: text,
      audioUrl,
    })

    return NextResponse.json({ success: true, data: generatedAudio })
  } catch (error: unknown) {
    // H-04 FIX: Log full details server-side, return generic message to client
    console.error("[Generate] Audio generation error:", error)
    const message = error instanceof Error ? error.message : "Failed to generate audio"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

