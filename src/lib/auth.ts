import { jwtVerify, SignJWT } from "jose"

// C-01 FIX: Never fall back to a hardcoded default secret.
// A known default would let anyone forge valid session tokens.
// The guard runs at RUNTIME (inside the function) rather than module-level,
// because Next.js evaluates modules at build time during static analysis.
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error(
      "[b1 TTS] FATAL: JWT_SECRET environment variable is not set. " +
      "Generate one with: openssl rand -base64 64 " +
      "and add it to your .env file."
    )
  }
  return new TextEncoder().encode(secret)
}

export async function signToken(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getJwtSecret())
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload
  } catch {
    return null
  }
}

