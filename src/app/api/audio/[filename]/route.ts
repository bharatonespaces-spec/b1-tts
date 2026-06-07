import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

// Audio files are stored in /app/data/audio/ (persistent volume)
// and served through this API route with proper headers.
const AUDIO_DIR = process.env.NODE_ENV === "production"
  ? "/app/data/audio"
  : path.join(process.cwd(), "data", "audio")

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  // Security: only allow alphanumeric filenames with .mp3 extension
  if (!/^[a-zA-Z0-9_-]+\.mp3$/.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 })
  }

  try {
    const filePath = path.join(AUDIO_DIR, filename)
    const fileBuffer = await fs.readFile(filePath)

    return new Response(fileBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    })
  } catch {
    return NextResponse.json({ error: "Audio file not found" }, { status: 404 })
  }
}
