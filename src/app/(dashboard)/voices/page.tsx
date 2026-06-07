"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Mic, UploadCloud } from "lucide-react"

type Voice = {
  id: string
  name: string
  providerVoiceId: string
  createdAt: string
}

export default function VoicesPage() {
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  const [name, setName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchVoices = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/voices")
      const json = await res.json()
      if (json.success) {
        setVoices(json.data)
      }
    } catch (err) {
      console.error("Failed to fetch voices:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVoices()
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !file) {
      setError("Please provide a voice name and select an audio sample.")
      return
    }

    setError("")
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("file", file)

      const res = await fetch("/api/voices", {
        method: "POST",
        body: formData,
      })
      const json = await res.json()

      if (json.success) {
        setName("")
        setFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
        fetchVoices() // refresh the list
      } else {
        setError(json.error || "Failed to upload voice.")
      }
    } catch {
      setError("An unexpected error occurred during upload.")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voice? This cannot be undone.")) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/voices/${id}`, {
        method: "DELETE",
      })
      const json = await res.json()

      if (json.success) {
        setVoices((prev) => prev.filter((v) => v.id !== id))
      } else {
        alert(json.error || "Failed to delete voice.")
      }
    } catch {
      alert("An unexpected error occurred during deletion.")
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Voice Cloning</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card className="col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Create New Voice</CardTitle>
            <CardDescription>Upload a high-quality audio sample to clone a voice using ElevenLabs.</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpload}>
            <CardContent className="space-y-4">
              {error && <div className="text-sm text-destructive font-medium">{error}</div>}
              
              <div className="space-y-2">
                <Label htmlFor="voice-name">Voice Name</Label>
                <Input
                  id="voice-name"
                  placeholder="e.g. John (Podcast)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={uploading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voice-file">Audio Sample</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="voice-file"
                    type="file"
                    accept="audio/mp3, audio/wav, audio/mpeg"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    disabled={uploading}
                    ref={fileInputRef}
                    required
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground">MP3 or WAV up to 10MB.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? (
                  <>
                    <UploadCloud className="mr-2 h-4 w-4 animate-bounce" /> Cloning...
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" /> Clone Voice
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Voices</CardTitle>
            <CardDescription>Manage your cloned voices available for text-to-speech generation.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded bg-muted"></div>
                ))}
              </div>
            ) : voices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voice Name</TableHead>
                    <TableHead>ElevenLabs ID</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {voices.map((voice) => (
                    <TableRow key={voice.id}>
                      <TableCell className="font-medium">{voice.name}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{voice.providerVoiceId}</TableCell>
                      <TableCell>{new Date(voice.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(voice.id)}
                          disabled={deleting === voice.id}
                          title="Delete voice"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-sm text-muted-foreground border rounded-md">
                <Mic className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                No cloned voices yet. Upload a sample to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
