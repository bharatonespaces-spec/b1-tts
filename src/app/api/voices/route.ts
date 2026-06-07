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
  return NextResponse.json({ success: false, error: "Custom voice cloning is not supported with the free TTS engine." }, { status: 400 })
}

