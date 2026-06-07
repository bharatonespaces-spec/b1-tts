export async function addVoice(name: string, file: File): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set")

  const formData = new FormData()
  formData.append("name", name)
  formData.append("files", file)

  const response = await fetch("https://api.elevenlabs.io/v1/voices/add", {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("ElevenLabs Add Voice Error:", errorText)
    throw new Error(`Failed to add voice to ElevenLabs: ${response.statusText}`)
  }

  const data = await response.json()
  return data.voice_id
}

export async function deleteVoice(voiceId: string): Promise<boolean> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set")

  const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
    method: "DELETE",
    headers: {
      "xi-api-key": apiKey,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("ElevenLabs Delete Voice Error:", errorText)
    throw new Error(`Failed to delete voice from ElevenLabs: ${response.statusText}`)
  }

  return true
}

import { EdgeTTS } from 'node-edge-tts';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';

export async function generateSpeech(voiceId: string, text: string, speed: number = 1): Promise<Buffer> {
  const tts = new EdgeTTS({ voice: voiceId });
  const tempPath = path.join(process.cwd(), `temp-${randomUUID()}.mp3`);
  
  await tts.ttsPromise(text, tempPath);
  const buffer = await fs.readFile(tempPath);
  await fs.unlink(tempPath);
  return buffer;
}
