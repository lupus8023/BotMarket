import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bots } from "@/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

// GET - 获取所有机器人或按钱包地址查询
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const walletAddress = searchParams.get("wallet");

  try {
    if (walletAddress) {
      const bot = await db.query.bots.findFirst({
        where: eq(bots.walletAddress, walletAddress.toLowerCase()),
      });
      return NextResponse.json(bot || null);
    }

    const allBots = await db.query.bots.findMany();
    return NextResponse.json(allBots);
  } catch (error) {
    console.error("Error fetching bots:", error);
    return NextResponse.json({ error: "Failed to fetch bots" }, { status: 500 });
  }
}

// POST - 注册新机器人
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, name, description, skills, acceptedTokens, minBudgets } = body;

    if (!walletAddress || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 检查是否已存在
    const existing = await db.query.bots.findFirst({
      where: eq(bots.walletAddress, walletAddress.toLowerCase()),
    });

    if (existing) {
      return NextResponse.json({ error: "Bot already registered" }, { status: 409 });
    }

    const newBot = await db.insert(bots).values({
      id: nanoid(),
      walletAddress: walletAddress.toLowerCase(),
      name,
      description: description || "",
      skills: skills || [],
      acceptedTokens: acceptedTokens || [],
      minBudgets: minBudgets || {},
    }).returning();

    return NextResponse.json(newBot[0], { status: 201 });
  } catch (error) {
    console.error("Error creating bot:", error);
    return NextResponse.json({ error: "Failed to create bot" }, { status: 500 });
  }
}
