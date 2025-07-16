import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import Calendar from "@/components/calendar"

export default async function HomePage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">健身打卡日历</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">欢迎, {session.username}</span>
            <a href="/settings" className="text-blue-600 hover:text-blue-800">
              设置
            </a>
            <a href="/api/auth/logout" className="text-red-600 hover:text-red-800">
              退出
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Calendar userId={session.userId} />
      </main>
    </div>
  )
}
