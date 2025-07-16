"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, FileText, Trash2 } from "lucide-react"

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
  if (!checkin) return null

  const handleDelete = async () => {
    if (!confirm("确定要删除这条打卡记录吗？")) return

    try {
      const response = await fetch(`/api/checkins/${checkin.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onUpdate()
        onClose()
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

  return (
    <Dialog open={!!checkin} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>打卡详情</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(checkin.date)}</span>
          </div>

          <div className="space-y-3">
            <div>
              <Badge variant="secondary" className="text-sm">
                {checkin.exerciseType}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{checkin.duration} 分钟</span>
            </div>

            {checkin.note && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">备注</span>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{checkin.note}</p>
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
