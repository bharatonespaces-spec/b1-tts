"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AudioWaveform, FileAudio, Keyboard, PlayCircle } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function Dashboard() {
  const [data, setData] = useState({
    totalVoices: 0,
    totalAudioFiles: 0,
    charactersGenerated: 0,
    recentActivity: [] as { id: string, title: string, createdAt: string, audioUrl: string }[]
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch("/api/dashboard")
        const json = await res.json()
        if (json.success) {
          setData(json.data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Voices
            </CardTitle>
            <AudioWaveform className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              <div className="text-2xl font-bold">{data.totalVoices}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Audio Files
            </CardTitle>
            <FileAudio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              <div className="text-2xl font-bold">{data.totalAudioFiles}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Characters Generated
            </CardTitle>
            <Keyboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-muted"></div>
            ) : (
              <div className="text-2xl font-bold">{data.charactersGenerated}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your most recent text-to-speech generations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded bg-muted"></div>
                ))}
              </div>
            ) : data.recentActivity.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Generated On</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.title}</TableCell>
                      <TableCell>{new Date(activity.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <a href={activity.audioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                          <PlayCircle className="mr-1 h-4 w-4" /> Listen
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No generated audio files yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
