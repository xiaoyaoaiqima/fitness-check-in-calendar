"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface CheckinModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  onSuccess: () => void
}

export default function CheckinModal({ isOpen, onClose, date, onSuccess }: CheckinModalProps) {
  const [exerciseType, setExerciseType] = useState("")
  const [duration, setDuration] = useState("30")
  const [note, setNote] = useState("")
  const [exerciseTypes, setExerciseTypes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchExerciseTypes()
    }
  }, [isOpen])

  const fetchExerciseTypes = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setExerciseTypes(data.exerciseTypes || ["跑步", "力量训练", "瑜伽", "游泳"])
      }
    } catch (error) {
      console.error("Failed to fetch exercise types:", error)
      setExerciseTypes(["跑步", "力量训练", "瑜伽", "游泳"])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exerciseType) return

    setIsLoading(true)

    try {
      const response = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          exerciseType,
          duration: Number.parseInt(duration),
          note: note.trim() || undefined,
        }),
      })

      if (response.ok) {
        onSuccess()
        setExerciseType("")
        setDuration("30")
        setNote("")
      }
    } catch (error) {
      console.error("Failed to create checkin:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>运动打卡 - {date}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exercise-type">运动类型</Label>
            <Select value={exerciseType} onValueChange={setExerciseType} required>
              <SelectTrigger>
                <SelectValue placeholder="选择运动类型" />
              </SelectTrigger>
              <SelectContent>
                {exerciseTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">时长（分钟）</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              max="300"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">备注（可选）</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="记录今天的运动感受..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              取消
            </Button>
            <Button type="submit" disabled={isLoading || !exerciseType} className="flex-1">
              {isLoading ? "提交中..." : "确认打卡"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
