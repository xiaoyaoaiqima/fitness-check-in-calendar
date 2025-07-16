"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import CheckinModal from "./checkin-modal"
import CheckinDetails from "./checkin-details"

interface CheckinRecord {
  id: string
  date: string
  exerciseType: string
  duration: number
  note?: string
}

interface CalendarProps {
  userId: string
}

export default function Calendar({ userId }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [checkins, setCheckins] = useState<CheckinRecord[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedCheckin, setSelectedCheckin] = useState<CheckinRecord | null>(null)
  const [weeklyGoal, setWeeklyGoal] = useState(3)

  useEffect(() => {
    fetchCheckins()
    fetchSettings()
  }, [currentDate])

  const fetchCheckins = async () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1

    try {
      const response = await fetch(`/api/checkins?year=${year}&month=${month}`)
      if (response.ok) {
        const data = await response.json()
        setCheckins(data.checkins || [])
      }
    } catch (error) {
      console.error("Failed to fetch checkins:", error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setWeeklyGoal(data.weeklyGoal || 3)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getCheckinForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return checkins.find((checkin) => checkin.date === dateStr)
  }

  const handleDateClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const existingCheckin = getCheckinForDate(day)

    if (existingCheckin) {
      setSelectedCheckin(existingCheckin)
    } else {
      setSelectedDate(dateStr)
      setIsModalOpen(true)
    }
  }

  const handleCheckinSuccess = () => {
    setIsModalOpen(false)
    fetchCheckins()
  }

  const calculateWeeklyProgress = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const weekCheckins = checkins.filter((checkin) => {
      const checkinDate = new Date(checkin.date)
      return checkinDate >= startOfWeek && checkinDate <= today
    })

    return Math.min((weekCheckins.length / weeklyGoal) * 100, 100)
  }

  const calculateMonthlyProgress = () => {
    const daysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    return (checkins.length / daysInCurrentMonth) * 100
  }

  const days = getDaysInMonth(currentDate)
  const weeklyProgress = calculateWeeklyProgress()
  const monthlyProgress = calculateMonthlyProgress()

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">本周进度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(weeklyProgress)}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${weeklyProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">目标: 每周{weeklyGoal}次</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">本月打卡</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{checkins.length}天</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${monthlyProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">打卡率: {Math.round(monthlyProgress)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">连续打卡</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0天</div>
            <p className="text-xs text-gray-500 mt-1">保持运动习惯</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                今天
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={index} className="p-2" />
              }

              const checkin = getCheckinForDate(day)
              const isToday =
                new Date().toDateString() ===
                new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

              return (
                <Button
                  key={day}
                  variant={checkin ? "default" : "ghost"}
                  className={`
                    p-2 h-12 relative
                    ${isToday ? "ring-2 ring-blue-500" : ""}
                    ${checkin ? "bg-green-500 hover:bg-green-600 text-white" : "hover:bg-gray-100"}
                  `}
                  onClick={() => handleDateClick(day)}
                >
                  <span className="text-sm">{day}</span>
                  {checkin && <div className="absolute bottom-1 right-1 w-2 h-2 bg-white rounded-full" />}
                  {!checkin && isToday && <Plus className="absolute bottom-1 right-1 w-3 h-3 text-blue-500" />}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <CheckinModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate}
        onSuccess={handleCheckinSuccess}
      />

      <CheckinDetails checkin={selectedCheckin} onClose={() => setSelectedCheckin(null)} onUpdate={fetchCheckins} />
    </div>
  )
}
