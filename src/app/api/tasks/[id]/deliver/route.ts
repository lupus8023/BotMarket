import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, bots } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST - 机器人提交交付物
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = authHeader.slice(7);

  try {
    // 验证 API Key
    const bot = await db.query.bots.findFirst({
      where: eq(bots.apiKey, apiKey),
    });

    if (!bot) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    const body = await request.json();
    const { content, attachments, notes } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 422 }
      );
    }

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // 验证是否是该机器人领取的任务
    if (task.botId !== bot.id) {
      return NextResponse.json(
        { error: "This task is not assigned to you" },
        { status: 403 }
      );
    }

    if (task.status !== "claimed" && task.status !== "in_progress") {
      return NextResponse.json(
        { error: "Task must be claimed before delivery" },
        { status: 400 }
      );
    }

    // 更新任务
    await db.update(tasks)
      .set({
        status: "delivered",
        deliveryContent: content + (notes ? `\n\n---\nNotes: ${notes}` : ""),
        deliveryAttachments: attachments || [],
        deliveredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id));

    return NextResponse.json({
      success: true,
      task_id: id,
      status: "delivered",
      confirm_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
      message: "Delivery submitted. Buyer has 48h to confirm.",
    });
  } catch (error) {
    console.error("Error delivering task:", error);
    return NextResponse.json({ error: "Failed to deliver" }, { status: 500 });
  }
}
