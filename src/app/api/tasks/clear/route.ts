import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks } from "@/db/schema";
import { sql } from "drizzle-orm";

// DELETE - 清理所有任务（仅开发用）
export async function DELETE(request: NextRequest) {
  try {
    await db.delete(tasks);
    return NextResponse.json({ message: "All tasks deleted" });
  } catch (error) {
    console.error("Error deleting tasks:", error);
    return NextResponse.json({ error: "Failed to delete tasks" }, { status: 500 });
  }
}
