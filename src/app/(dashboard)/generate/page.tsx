"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Mic, PlayCircle, Loader2, Wand2 } from "lucide-react"

type Voice = {
  id: string
  name: string
}

type Template = {
  id: string
  name: string
  content: string
}

export default function GeneratePage() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [text, setText] = useState("")
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [speed, setSpeed] = useState<number[]>([1])
  
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState("")
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const fetchVoices = async () => {
    try {
      const res = await fetch("/api/voices")
      const json = await res.json()
      if (json.success) {
        setVoices(json.data)
        if (json.data.length > 0) {
          setSelectedVoice(json.data[0].id)
        }
      }
    } catch {
      console.error("Failed to fetch voices")
    }
  }

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates")
      const json = await res.json()
      if (json.success) {
        setTemplates(json.data)
      }
    } catch {
      console.error("Failed to fetch templates")
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVoices()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTemplates()
  }, [])

  const applyTemplate = (content: string) => {
    setText(content)
  }

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Please enter some text to generate speech.")
      return
    }
    if (!selectedVoice) {
      setError("Please select a voice.")
      return
    }

    setError("")
    setAudioUrl(null)
    setGenerating(true)

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voiceId: selectedVoice,
          speed: speed[0]
        })
      })
      
      const json = await res.json()
      if (json.success) {
        setAudioUrl(json.data.audioUrl)
      } else {
        setError(json.error || "Failed to generate audio.")
      }
    } catch {
      setError("An unexpected error occurred.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Generate Audio</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <div className="col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Templates</CardTitle>
              <CardDescription>Select a pre-written template to get started quickly.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {templates.length > 0 ? (
                  templates.map((template) => (
                    <Button 
                      key={template.id} 
                      variant="outline" 
                      size="sm"
                      onClick={() => applyTemplate(template.content)}
                      className="text-xs"
                    >
                      <Wand2 className="mr-2 h-3 w-3" />
                      {template.name}
                    </Button>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Loading templates...</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Text to Speech</CardTitle>
              <CardDescription>Convert your text to lifelike speech using your cloned voices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && <div className="text-sm font-medium text-destructive">{error}</div>}
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="text-input">Text Input</Label>
                  <span className="text-xs text-muted-foreground">{text.length} characters</span>
                </div>
                <Textarea
                  id="text-input"
                  placeholder="Enter the text you want to synthesize or select a template above..."
                  className="min-h-[200px] resize-y"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  disabled={generating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice-select">Voice</Label>
                <Select value={selectedVoice} onValueChange={(val) => setSelectedVoice(val || "")} disabled={generating || voices.length === 0}>
                  <SelectTrigger id="voice-select">
                    <SelectValue placeholder={voices.length === 0 ? "No voices available" : "Select a voice"} />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map(voice => (
                      <SelectItem key={voice.id} value={voice.id}>{voice.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <Label>Speed ({speed[0]}x)</Label>
                </div>
                <Slider
                  value={speed}
                  onValueChange={(val) => setSpeed(Array.isArray(val) ? [...val] : [val])}
                  max={2}
                  min={0.5}
                  step={0.1}
                  disabled={generating}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleGenerate} disabled={generating || voices.length === 0 || !text.trim()}>
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Audio...
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" /> Generate Audio
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>Your generated audio will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center min-h-[300px] bg-muted/20 rounded-md border border-dashed m-6">
            {audioUrl ? (
              <div className="w-full max-w-sm space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <PlayCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Audio Ready</h3>
                <audio controls src={audioUrl} className="w-full mt-4" autoPlay>
                  Your browser does not support the audio element.
                </audio>
                <div className="pt-4">
                  <Button variant="outline" render={<a href={audioUrl} download />}>
                    Download MP3
                  </Button>
                </div>
              </div>
            ) : generating ? (
              <div className="flex flex-col items-center text-muted-foreground space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Synthesizing voice...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-muted-foreground space-y-2">
                <Mic className="h-8 w-8 opacity-50" />
                <p className="text-sm">Enter text and click generate to listen.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
