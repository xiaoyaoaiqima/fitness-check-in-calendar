import { Redis } from "@upstash/redis"
import bcrypt from "bcryptjs"

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

export interface User {
  id: string
  username: string
  passwordHash: string
  createdAt: string
}

export interface CheckinRecord {
  id: string
  userId: string
  date: string
  exerciseType: string
  duration: number
  note?: string
  createdAt: string
}

export interface UserSettings {
  userId: string
  exerciseTypes: string[]
  weeklyGoal: number
}

// User operations
export async function createUser(username: string, password: string): Promise<User> {
  const existingUser = await redis.get(`user:${username}`)
  if (existingUser) {
    throw new Error("用户名已存在")
  }

  const userId = crypto.randomUUID()
  const passwordHash = await bcrypt.hash(password, 10)
  const user: User = {
    id: userId,
    username,
    passwordHash,
    createdAt: new Date().toISOString(),
  }

  await redis.set(`user:${username}`, JSON.stringify(user))
  await redis.set(`user:id:${userId}`, JSON.stringify(user))

  // Initialize default settings
  const defaultSettings: UserSettings = {
    userId,
    exerciseTypes: ["跑步", "力量训练", "瑜伽", "游泳"],
    weeklyGoal: 3,
  }
  await redis.set(`settings:${userId}`, JSON.stringify(defaultSettings))

  return user
}

export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    console.log("查找用户 key:", `user:${username}`)
    const userStr = await redis.get(`user:${username}`)
    console.log("redis 返回:", userStr)
    if (!userStr) return null
    if (typeof userStr === "string") {
      return JSON.parse(userStr)
    }
    // 已经是对象，直接返回
    return userStr as User
  } catch (error) {
    console.error("Failed to get user:", error)
    return null
  }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Checkin operations
export async function createCheckin(checkin: Omit<CheckinRecord, "id" | "createdAt">): Promise<CheckinRecord> {
  const id = crypto.randomUUID()
  const record: CheckinRecord = {
    ...checkin,
    id,
    createdAt: new Date().toISOString(),
  }

  await redis.set(`checkin:${id}`, JSON.stringify(record))
  await redis.sadd(`user_checkins:${checkin.userId}`, id)
  await redis.sadd(`date_checkins:${checkin.userId}:${checkin.date}`, id)

  return record
}

export async function getCheckinsByMonth(userId: string, year: number, month: number): Promise<CheckinRecord[]> {
  try {
    const checkinIds = await redis.smembers(`user_checkins:${userId}`)
    const checkins: CheckinRecord[] = []

    for (const id of checkinIds) {
      const checkinData = await redis.get(`checkin:${id}`)
      if (checkinData) {
        let checkin: CheckinRecord
        
        if (typeof checkinData === "string") {
          try {
            checkin = JSON.parse(checkinData) as CheckinRecord
          } catch (parseError) {
            console.error(`Failed to parse checkin data for ${id}:`, parseError)
            continue
          }
        } else if (typeof checkinData === "object" && checkinData !== null) {
          checkin = checkinData as CheckinRecord
        } else {
          console.error(`Invalid checkin data format for ${id}:`, checkinData)
          continue
        }

        if (!checkin.date || !checkin.exerciseType || !checkin.duration) {
          console.error(`Incomplete checkin data for ${id}:`, checkin)
          continue
        }

        const checkinDate = new Date(checkin.date)
        if (checkinDate.getFullYear() === year && checkinDate.getMonth() + 1 === month) {
          checkins.push(checkin)
        }
      }
    }

    // 按日期和时间排序
    return checkins.sort((a, b) => {
      const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      if (dateComparison === 0) {
        // 如果日期相同，按创建时间排序
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      return dateComparison
    })
  } catch (error) {
    console.error("Failed to get checkins:", error)
    return []
  }
}

// 新增：获取指定日期的所有打卡记录
export async function getCheckinsByDate(userId: string, date: string): Promise<CheckinRecord[]> {
  try {
    const checkinIds = await redis.smembers(`date_checkins:${userId}:${date}`)
    const checkins: CheckinRecord[] = []

    for (const id of checkinIds) {
      const checkinData = await redis.get(`checkin:${id}`)
      if (checkinData) {
        let checkin: CheckinRecord
        
        if (typeof checkinData === "string") {
          try {
            checkin = JSON.parse(checkinData) as CheckinRecord
          } catch (parseError) {
            console.error(`Failed to parse checkin data for ${id}:`, parseError)
            continue
          }
        } else if (typeof checkinData === "object" && checkinData !== null) {
          checkin = checkinData as CheckinRecord
        } else {
          continue
        }

        if (checkin.date === date) {
          checkins.push(checkin)
        }
      }
    }

    // 按创建时间排序
    return checkins.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  } catch (error) {
    console.error("Failed to get checkins by date:", error)
    return []
  }
}

export async function deleteCheckin(id: string, userId: string): Promise<void> {
  const checkinData = await redis.get(`checkin:${id}`)
  if (checkinData) {
    let checkin: CheckinRecord
    
    if (typeof checkinData === "string") {
      try {
        checkin = JSON.parse(checkinData) as CheckinRecord
      } catch (error) {
        console.error(`Failed to parse checkin data for deletion ${id}:`, error)
        return
      }
    } else if (typeof checkinData === "object" && checkinData !== null) {
      checkin = checkinData as CheckinRecord
    } else {
      console.error(`Invalid checkin data format for deletion ${id}:`, checkinData)
      return
    }

    await redis.del(`checkin:${id}`)
    await redis.srem(`user_checkins:${userId}`, id)
    await redis.srem(`date_checkins:${userId}:${checkin.date}`, id)
  }
}

// Settings operations
export async function getUserSettings(userId: string): Promise<UserSettings> {
  try {
    const settingsData = await redis.get(`settings:${userId}`)
    console.log("settingsData", settingsData)
    if (!settingsData) return null
    if (typeof settingsData === "string") {
      return JSON.parse(settingsData) as UserSettings
    }
    // 已经是对象，直接返回
    return settingsData as UserSettings
  } catch (error) {
    console.error("Failed to get settings:", error)
    return {
      userId,
      exerciseTypes: ["跑步", "力量训练", "瑜伽", "游泳"],
      weeklyGoal: 3,
    }
  }
}

export async function updateUserSettings(settings: UserSettings): Promise<void> {
  await redis.set(`settings:${settings.userId}`, JSON.stringify(settings))
}
