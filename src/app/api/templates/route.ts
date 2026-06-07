import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const defaultTemplates = [
  {
    name: "Property Advertisement",
    content: "Welcome to your dream home. This stunning 4-bedroom, 3-bathroom property features an open-concept living space, a modern chef's kitchen, and a beautiful backyard oasis. Located in a quiet, family-friendly neighborhood, it's the perfect place to put down roots. Contact us today to schedule a viewing."
  },
  {
    name: "Office Rental Promotion",
    content: "Elevate your business in our premium downtown office spaces. We offer flexible leasing terms, high-speed internet, state-of-the-art conference rooms, and 24/7 security. Perfect for startups and established enterprises alike. Book a tour today and discover your team's new headquarters."
  },
  {
    name: "Local Area News",
    content: "Good morning, residents. In today's local news, the city council has approved the new downtown park renovation project, set to begin next month. Additionally, expect minor traffic delays on Main Street this weekend due to the annual summer festival. Stay tuned for more updates."
  },
  {
    name: "WhatsApp Voice Broadcast",
    content: "Hey everyone! Just a quick reminder that our special weekend sale starts tomorrow at 9 AM. Everything in the store will be 30% off. Don't miss out on these amazing deals. See you there!"
  },
  {
    name: "Podcast Narration",
    content: "Welcome back to the Daily Tech Insights podcast. I'm your host, and today we're diving deep into the future of artificial intelligence and how generative models are reshaping the way we work, live, and create. Let's get started."
  }
]

export async function GET() {
  try {
    // C-05 FIX: Use upsert to prevent race conditions and duplicate data
    // The old pattern (check-then-insert) fails under concurrent requests —
    // multiple workers can simultaneously see 0 templates and all insert duplicates.
    await Promise.all(
      defaultTemplates.map((t) =>
        prisma.template.upsert({
          where: { name: t.name },
          update: {}, // Don't overwrite user-edited templates
          create: t,
        })
      )
    )

    const templates = await prisma.template.findMany({ orderBy: { createdAt: "asc" } })
    return NextResponse.json({ success: true, data: templates })
  } catch (error) {
    console.error("[Templates] Fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch templates" }, { status: 500 })
  }
}

