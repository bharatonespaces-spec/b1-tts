import { NextResponse } from "next/server"
import { generateSpeech } from "@/lib/elevenlabs"
import { AudioService, VoiceService } from "@/lib/services"
import { randomUUID } from "crypto"
import fs from "fs/promises"
import path from "path"

// Unified data directory — both DB and audio live here on the persistent volume
const AUDIO_DIR = process.env.NODE_ENV === "production"
  ? "/app/data/audio"
  : path.join(process.cwd(), "data", "audio")

export async function POST(req: Request) {
  try {
    const { text, voiceId, speed } = await req.json()

    if (!text || !voiceId) {
      return NextResponse.json({ success: false, error: "Text and Voice ID are required" }, { status: 400 })
    }

    // C-02 FIX: Reject requests exceeding character limit
    const MAX_CHARS = 5000
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

    // 3. Save audio file to unified data directory (persistent volume on Railway)
    const fileName = `${randomUUID()}.mp3`
    await fs.mkdir(AUDIO_DIR, { recursive: true })
    const filePath = path.join(AUDIO_DIR, fileName)
    await fs.writeFile(filePath, Buffer.from(audioBuffer))

    // Audio served via /api/audio/[filename] route (not static public/)
    const audioUrl = `/api/audio/${fileName}`
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

