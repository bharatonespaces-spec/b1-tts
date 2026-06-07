"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Search, DownloadCloud, HistoryIcon } from "lucide-react"

type AudioRecord = {
  id: string
  title: string
  inputText: string
  audioUrl: string
  createdAt: string
}

export default function HistoryPage() {
  const [audios, setAudios] = useState<AudioRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)


  const fetchHistory = async (searchQuery: string = "") => {
    setLoading(true)
    try {
      const url = searchQuery ? `/api/history?search=${encodeURIComponent(searchQuery)}` : "/api/history"
      const res = await fetch(url)
      const json = await res.json()
      if (json.success) {
        setAudios(json.data)
      }
    } catch {
      console.error("Failed to fetch history")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchHistory()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHistory(search)
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [search])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this generated audio?")) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: "DELETE",
      })
      const json = await res.json()

      if (json.success) {
        setAudios((prev) => prev.filter((a) => a.id !== id))
      } else {
        alert(json.error || "Failed to delete audio.")
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
        <h2 className="text-3xl font-bold tracking-tight">Audio History</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Files</CardTitle>
          <CardDescription>View, play, download, and manage your text-to-speech generations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title or text..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title & Snippet</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && audios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex items-center justify-center text-muted-foreground">
                        Loading...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : audios.length > 0 ? (
                  audios.map((audio) => (
                    <TableRow key={audio.id}>
                      <TableCell className="max-w-[300px]">
                        <div className="font-medium truncate" title={audio.title}>{audio.title}</div>
                        <div className="text-xs text-muted-foreground truncate mt-1" title={audio.inputText}>
                          {audio.inputText}
                        </div>
                      </TableCell>
                      <TableCell>
                        <audio controls controlsList="nodownload" className="h-8 w-48">
                          <source src={audio.audioUrl} type="audio/mpeg" />
                        </audio>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(audio.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" render={<a href={audio.audioUrl} download />} title="Download">
                          <DownloadCloud className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(audio.id)}
                          disabled={deleting === audio.id}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      <HistoryIcon className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                      No audio files found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
