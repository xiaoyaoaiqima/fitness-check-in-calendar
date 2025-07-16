import { type NextRequest, NextResponse } from "next/server"
import { createUser } from "@/lib/db"
import { createSession } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 })
    }

    if (username.length < 3 || password.length < 6) {
      return NextResponse.json({ error: "用户名至少3位，密码至少6位" }, { status: 400 })
    }

    const user = await createUser(username, password)
    const sessionId = await createSession(user.id, user.username)

    const cookieStore = await cookies()
    cookieStore.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Register error:", error)
    return NextResponse.json({ error: error.message || "注册失败" }, { status: 500 })
  }
}
