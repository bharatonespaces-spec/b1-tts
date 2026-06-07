import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { signToken } from "@/lib/auth"

const MIN_PASSWORD_LENGTH = 8

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // H-05 FIX: Enforce password complexity server-side (not just in HTML `required`)
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    const userCount = await prisma.user.count()
    let user = await prisma.user.findUnique({ where: { email } })

    if (userCount === 0 && !user) {
      // First login creates the admin user
      const hashedPassword = await bcrypt.hash(password, 12) // 12 rounds instead of 10
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword
        }
      })
    } else if (!user) {
      // H-04 FIX: Generic error — don't reveal whether the email exists or not
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    } else {
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
    }

    const token = await signToken({ userId: user.id, email: user.email })

    const response = NextResponse.json({ success: true })
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8 // 8 hours to match JWT TTL
    })

    return response
  } catch (error) {
    // H-04 FIX: Log full error server-side, return generic message to client
    console.error("[Auth] Login Error:", error)
    return NextResponse.json({ error: "An internal error occurred. Please try again." }, { status: 500 })
  }
}
