import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import SettingsForm from "@/components/settings-form"

export default async function SettingsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">设置</h1>
          <a href="/" className="text-blue-600 hover:text-blue-800">
            返回日历
          </a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <SettingsForm userId={session.userId} />
      </main>
    </div>
  )
}
