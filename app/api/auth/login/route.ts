import { type NextRequest, NextResponse } from "next/server"
import { getUserByUsername, verifyPassword } from "@/lib/db"
import { createSession } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 })
    }

    const user = await getUserByUsername(username)
    if (!user) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 })
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 })
    }

    const sessionId = await createSession(user.id, user.username)

    const cookieStore = await cookies()
    cookieStore.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "登录失败" }, { status: 500 })
  }
}
