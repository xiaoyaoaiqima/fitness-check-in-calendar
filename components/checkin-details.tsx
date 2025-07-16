"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, FileText, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

interface CheckinRecord {
  id: string
  date: string
  exerciseType: string
  duration: number
  note?: string
}

interface CheckinDetailsProps {
  checkin: CheckinRecord | null
  onClose: () => void
  onUpdate: () => void
}

export default function CheckinDetails({ checkin, onClose, onUpdate }: CheckinDetailsProps) {
  const [allCheckins, setAllCheckins] = useState<CheckinRecord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (checkin) {
      fetchAllCheckinsForDate(checkin.date)
      // 找到当前checkin在数组中的位置
      setCurrentIndex(0)
    }
  }, [checkin])

  const fetchAllCheckinsForDate = async (date: string) => {
    try {
      const response = await fetch(`/api/checkins?date=${date}`)
      if (response.ok) {
        const data = await response.json()
        setAllCheckins(data.checkins || [])
      }
    } catch (error) {
      console.error("Failed to fetch checkins for date:", error)
    }
  }

  if (!checkin || allCheckins.length === 0) return null

  const currentCheckin = allCheckins[currentIndex]
  const hasMultipleCheckins = allCheckins.length > 1

  const handleDelete = async () => {
    if (!confirm("确定要删除这条打卡记录吗？")) return

    try {
      const response = await fetch(`/api/checkins/${currentCheckin.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onUpdate()
        // 如果删除后还有其他记录，显示下一条；否则关闭弹窗
        if (allCheckins.length > 1) {
          const newCheckins = allCheckins.filter(c => c.id !== currentCheckin.id)
          setAllCheckins(newCheckins)
          setCurrentIndex(Math.min(currentIndex, newCheckins.length - 1))
        } else {
          onClose()
        }
      }
    } catch (error) {
      console.error("Failed to delete checkin:", error)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("zh-CN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={!!checkin} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>打卡详情</span>
            {hasMultipleCheckins && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span>{currentIndex + 1} / {allCheckins.length}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentIndex(Math.min(allCheckins.length - 1, currentIndex + 1))}
                  disabled={currentIndex === allCheckins.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(currentCheckin.date)}</span>
            {hasMultipleCheckins && (
              <span className="text-xs text-gray-400">
                ({formatTime(currentCheckin.createdAt)})
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <Badge variant="secondary" className="text-sm">
                {currentCheckin.exerciseType}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{currentCheckin.duration} 分钟</span>
            </div>

            {currentCheckin.note && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">备注</span>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{currentCheckin.note}</p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              关闭
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              删除
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
