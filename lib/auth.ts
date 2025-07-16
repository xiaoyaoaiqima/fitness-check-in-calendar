import { cookies } from "next/headers"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface Session {
  userId: string
  username: string
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (!sessionId) {
    return null
  }

  try {
    const session = await redis.get(`session:${sessionId}`)
    return session as Session | null
  } catch (error) {
    console.error("Failed to get session:", error)
    return null
  }
}

export async function createSession(userId: string, username: string): Promise<string> {
  const sessionId = crypto.randomUUID()
  const session: Session = { userId, username }

  // Store session for 30 days
  await redis.setex(`session:${sessionId}`, 30 * 24 * 60 * 60, JSON.stringify(session))

  return sessionId
}

export async function deleteSession(sessionId: string): Promise<void> {
  await redis.del(`session:${sessionId}`)
}
