import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createCheckin, getCheckinsByMonth, getCheckinsByDate } from "@/lib/db"

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const year = Number.parseInt(searchParams.get("year") || new Date().getFullYear().toString())
  const month = Number.parseInt(searchParams.get("month") || (new Date().getMonth() + 1).toString())
  const date = searchParams.get("date") // 新增：支持按日期查询

  try {
    let checkins
    if (date) {
      // 如果指定了日期，获取该日期的所有打卡记录
      checkins = await getCheckinsByDate(session.userId, date)
    } else {
      // 否则获取整月的打卡记录
      checkins = await getCheckinsByMonth(session.userId, year, month)
    }
    
    return NextResponse.json({ checkins })
  } catch (error) {
    console.error("Failed to get checkins:", error)
    return NextResponse.json({ error: "Failed to get checkins" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { date, exerciseType, duration, note } = await request.json()

    if (!date || !exerciseType || !duration) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const checkin = await createCheckin({
      userId: session.userId,
      date,
      exerciseType,
      duration,
      note,
    })

    return NextResponse.json({ checkin })
  } catch (error) {
    console.error("Failed to create checkin:", error)
    return NextResponse.json({ error: "Failed to create checkin" }, { status: 500 })
  }
}
