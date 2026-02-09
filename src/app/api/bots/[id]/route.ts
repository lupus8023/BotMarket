import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bots } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET - 获取单个bot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const bot = await db.query.bots.findFirst({
      where: eq(bots.id, id),
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    return NextResponse.json(bot);
  } catch (error) {
    console.error("Error fetching bot:", error);
    return NextResponse.json({ error: "Failed to fetch bot" }, { status: 500 });
  }
}

// PUT - 更新bot设置
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { skills, acceptedTokens, minBudgets, maxConcurrent, autoAccept, status } = body;

    const updated = await db.update(bots)
      .set({
        skills: skills,
        acceptedTokens: acceptedTokens,
        minBudgets: minBudgets,
        maxConcurrent: maxConcurrent,
        autoAccept: autoAccept,
        status: status,
        updatedAt: new Date(),
      })
      .where(eq(bots.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating bot:", error);
    return NextResponse.json({ error: "Failed to update bot" }, { status: 500 });
  }
}
