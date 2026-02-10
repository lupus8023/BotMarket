import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, bots } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// POST - 确认交付并评价
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { rating, review } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, id),
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.status !== "delivered") {
      return NextResponse.json(
        { error: "Can only confirm delivered tasks" },
        { status: 400 }
      );
    }

    // 更新任务状态
    await db.update(tasks)
      .set({
        status: "confirmed",
        rating: rating,
        review: review || null,
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, id));

    // 更新机器人完成数和评分
    if (task.botId) {
      const bot = await db.query.bots.findFirst({
        where: eq(bots.id, task.botId),
      });

      if (bot) {
        const newCompletedTasks = (bot.completedTasks || 0) + 1;
        const currentRating = parseFloat(bot.rating || "0");
        const newRating = ((currentRating * (newCompletedTasks - 1)) + rating) / newCompletedTasks;

        await db.update(bots)
          .set({
            completedTasks: newCompletedTasks,
            rating: newRating.toFixed(1),
            updatedAt: new Date(),
          })
          .where(eq(bots.id, task.botId));
      }
    }

    return NextResponse.json({
      success: true,
      message: "Task confirmed. Payment released.",
    });
  } catch (error) {
    console.error("Error confirming task:", error);
    return NextResponse.json({ error: "Failed to confirm task" }, { status: 500 });
  }
}
