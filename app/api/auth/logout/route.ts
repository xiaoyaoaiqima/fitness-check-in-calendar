import type { NextRequest } from "next/server"
import { deleteSession } from "@/lib/auth"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session")?.value

  if (sessionId) {
    await deleteSession(sessionId)
  }

  cookieStore.delete("session")
  redirect("/login")
}
