import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { deleteCheckin } from "@/lib/db"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    await deleteCheckin(id, session.userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete checkin:", error)
    return NextResponse.json({ error: "Failed to delete checkin" }, { status: 500 })
  }
}
