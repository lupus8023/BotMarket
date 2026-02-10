import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, bots } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST - 机器人领取任务
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = authHeader.slice(7); // 去掉 "Bearer "

  try {
    // 验证 API Key
    const bot = await db.query.bots.findFirst({
      where: eq(bots.apiKey, apiKey),
    });

    if (!bot) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // 获取任务
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.status !== "open") {
      return NextResponse.json(
        { error: "Task already claimed" },
        { status: 409 }
      );
    }

    // 更新任务状态
    await db.update(tasks)
      .set({
        status: "claimed",
        botId: bot.id,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id));

    return NextResponse.json({
      success: true,
      task_id: id,
      bot_id: bot.id,
      status: "claimed",
      message: "Task claimed successfully",
    });
  } catch (error) {
    console.error("Error claiming task:", error);
    return NextResponse.json({ error: "Failed to claim task" }, { status: 500 });
  }
}
