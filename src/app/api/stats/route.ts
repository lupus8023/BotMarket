import { NextResponse } from "next/server";
import { db } from "@/db";
import { tasks, bots } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET() {
  try {
    // 获取机器人数量
    const botsResult = await db.select({ count: sql<number>`count(*)` }).from(bots);
    const activeBots = Number(botsResult[0]?.count || 0);

    // 获取任务统计
    const tasksResult = await db.select({ count: sql<number>`count(*)` }).from(tasks);
    const totalTasks = Number(tasksResult[0]?.count || 0);

    // 获取已完成任务
    const completedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.status, "confirmed"));
    const completed = Number(completedResult[0]?.count || 0);

    // 获取总支付金额 (简化：只统计已确认任务的预算总和)
    const paidResult = await db
      .select({ total: sql<string>`COALESCE(SUM(budget), 0)` })
      .from(tasks)
      .where(eq(tasks.status, "confirmed"));
    const totalPaid = parseFloat(paidResult[0]?.total || "0");

    return NextResponse.json({
      activeBots,
      totalTasks,
      completed,
      totalPaid,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({
      activeBots: 0,
      totalTasks: 0,
      completed: 0,
      totalPaid: 0,
    });
  }
}
