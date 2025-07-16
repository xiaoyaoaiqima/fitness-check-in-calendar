"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

interface SettingsFormProps {
  userId: string
}

export default function SettingsForm({ userId }: SettingsFormProps) {
  const [exerciseTypes, setExerciseTypes] = useState<string[]>([])
  const [weeklyGoal, setWeeklyGoal] = useState(3)
  const [newExerciseType, setNewExerciseType] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setExerciseTypes(data.exerciseTypes || ["跑步", "力量训练", "瑜伽", "游泳"])
        setWeeklyGoal(data.weeklyGoal || 3)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseTypes,
          weeklyGoal,
        }),
      })

      if (response.ok) {
        alert("设置已保存")
      }
    } catch (error) {
      console.error("Failed to save settings:", error)
      alert("保存失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  const addExerciseType = () => {
    if (newExerciseType.trim() && !exerciseTypes.includes(newExerciseType.trim())) {
      setExerciseTypes([...exerciseTypes, newExerciseType.trim()])
      setNewExerciseType("")
    }
  }

  const removeExerciseType = (type: string) => {
    setExerciseTypes(exerciseTypes.filter((t) => t !== type))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>运动类型管理</CardTitle>
          <CardDescription>自定义你的运动类型，这些选项将在打卡时显示</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {exerciseTypes.map((type) => (
              <Badge key={type} variant="secondary" className="flex items-center gap-1">
                {type}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeExerciseType(type)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="添加新的运动类型"
              value={newExerciseType}
              onChange={(e) => setNewExerciseType(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addExerciseType()}
            />
            <Button onClick={addExerciseType} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>每周目标</CardTitle>
          <CardDescription>设置你的每周运动目标次数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="weekly-goal">每周目标次数</Label>
            <Input
              id="weekly-goal"
              type="number"
              min="1"
              max="7"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(Number.parseInt(e.target.value) || 1)}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={isLoading} className="w-full">
        {isLoading ? "保存中..." : "保存设置"}
      </Button>
    </div>
  )
}
