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

export async function generateSpeech(voiceId: string, text: string, _speed: number = 1.0): Promise<ArrayBuffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not set")

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg"
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("ElevenLabs Generate Speech Error:", errorText)
    throw new Error(`Failed to generate speech: ${response.statusText}`)
  }

  // ElevenLabs doesn't have a direct "speed" parameter in the core API request, but it's part of the Voice Settings or we just ignore it if it's not supported by standard models without specific SSML. For this implementation, we will pass standard voice_settings.
  return await response.arrayBuffer()
}

