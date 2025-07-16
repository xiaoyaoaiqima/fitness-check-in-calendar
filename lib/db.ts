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
    const userData = await redis.get(`user:${username}`)
    return userData ? JSON.parse(userData as string) : null
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
        const checkin = JSON.parse(checkinData as string) as CheckinRecord
        const checkinDate = new Date(checkin.date)
        if (checkinDate.getFullYear() === year && checkinDate.getMonth() + 1 === month) {
          checkins.push(checkin)
        }
      }
    }

    return checkins.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error("Failed to get checkins:", error)
    return []
  }
}

export async function deleteCheckin(id: string, userId: string): Promise<void> {
  const checkinData = await redis.get(`checkin:${id}`)
  if (checkinData) {
    const checkin = JSON.parse(checkinData as string) as CheckinRecord
    await redis.del(`checkin:${id}`)
    await redis.srem(`user_checkins:${userId}`, id)
    await redis.srem(`date_checkins:${userId}:${checkin.date}`, id)
  }
}

// Settings operations
export async function getUserSettings(userId: string): Promise<UserSettings> {
  try {
    const settingsData = await redis.get(`settings:${userId}`)
    if (settingsData) {
      return JSON.parse(settingsData as string)
    }

    // Return default settings if none exist
    const defaultSettings: UserSettings = {
      userId,
      exerciseTypes: ["跑步", "力量训练", "瑜伽", "游泳"],
      weeklyGoal: 3,
    }
    await redis.set(`settings:${userId}`, JSON.stringify(defaultSettings))
    return defaultSettings
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
