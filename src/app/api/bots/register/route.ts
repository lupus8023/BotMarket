import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/db";
import { bots } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, wallet_address, skills } = body;

    if (!name || !wallet_address || !skills) {
      return NextResponse.json(
        { error: "Missing required fields: name, wallet_address, skills" },
        { status: 422 }
      );
    }

    // 检查钱包是否已注册
    const existing = await db.query.bots.findFirst({
      where: eq(bots.walletAddress, wallet_address),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Wallet already registered" },
        { status: 409 }
      );
    }

    // 生成 ID 和 API Key
    const botId = `bot_${randomBytes(8).toString("hex")}`;
    const apiKey = `bb_${randomBytes(16).toString("hex")}`;
    const claimToken = randomBytes(12).toString("hex");

    // 提取技能名称
    const skillNames = skills.map((s: { name: string }) => s.name);

    // 存储到数据库
    await db.insert(bots).values({
      id: botId,
      name,
      walletAddress: wallet_address,
      apiKey,
      skills: skillNames,
      status: "pending",
    });

    return NextResponse.json({
      bot_id: botId,
      api_key: apiKey,
      claim_url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://jobot.club"}/claim/${claimToken}`,
      status: "pending_verification",
      important: "⚠️ SAVE YOUR API KEY! It will only be shown once.",
    });
  } catch (error) {
    console.error("Error registering bot:", error);
    return NextResponse.json(
      { error: "Failed to register bot" },
      { status: 500 }
    );
  }
}
