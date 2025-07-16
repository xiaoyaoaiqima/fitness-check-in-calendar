import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import LoginForm from "@/components/login-form"

export default async function LoginPage() {
  const session = await getSession()

  if (session) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">健身打卡日历</h2>
          <p className="mt-2 text-center text-sm text-gray-600">登录或注册开始你的健身之旅</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
