import { NextResponse } from "next/server"
import { VoiceService } from "@/lib/services"
import { addVoice } from "@/lib/elevenlabs"

// C-03 FIX: Server-side whitelist. HTML 'accept' is client-only and trivially bypassed.
const ALLOWED_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/ogg",
  "audio/webm",
])
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_VOICE_NAME_LENGTH = 100

export async function GET() {
  try {
    const voices = await VoiceService.getVoices()
    return NextResponse.json({ success: true, data: voices })
  } catch (error) {
    console.error("[Voices] Fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch voices" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const name = formData.get("name") as string
    const file = formData.get("file") as File

    if (!name || !file) {
      return NextResponse.json({ success: false, error: "Name and file are required" }, { status: 400 })
    }

    // C-03 FIX: Validate voice name length
    if (name.trim().length === 0 || name.length > MAX_VOICE_NAME_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Voice name must be between 1 and ${MAX_VOICE_NAME_LENGTH} characters` },
        { status: 400 }
      )
    }

    // C-03 FIX: Validate file size server-side
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: `File size exceeds maximum of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // C-03 FIX: Validate MIME type server-side — HTML `accept` is trivially bypassed
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only MP3, WAV, OGG, and WebM audio are allowed." },
        { status: 400 }
      )
    }

    // 1. Send to ElevenLabs
    const providerVoiceId = await addVoice(name.trim(), file)

    if (!providerVoiceId) {
      return NextResponse.json({ success: false, error: "ElevenLabs API failed to return a voice ID" }, { status: 500 })
    }

    // 2. Save to database
    const newVoice = await VoiceService.createVoice({
      name: name.trim(),
      providerVoiceId
    })

    return NextResponse.json({ success: true, data: newVoice })
  } catch (error: unknown) {
    console.error("[Voices] Create error:", error)
    const message = error instanceof Error ? error.message : "Failed to create voice"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

