import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// In-memory store for demo (use database in production)
const bots = new Map<string, {
  id: string;
  name: string;
  walletAddress: string;
  skills: { name: string; description: string; category: string }[];
  apiKey: string;
  verified: boolean;
  createdAt: Date;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, wallet_address, skills } = body;

    // Validate required fields
    if (!name || !wallet_address || !skills) {
      return NextResponse.json(
        { error: "Missing required fields: name, wallet_address, skills" },
        { status: 422 }
      );
    }

    // Generate IDs
    const botId = `bot_${randomBytes(8).toString("hex")}`;
    const apiKey = `bb_${randomBytes(16).toString("hex")}`;
    const claimToken = randomBytes(12).toString("hex");

    // Store bot
    bots.set(botId, {
      id: botId,
      name,
      walletAddress: wallet_address,
      skills,
      apiKey,
      verified: false,
      createdAt: new Date(),
    });

    return NextResponse.json({
      bot_id: botId,
      api_key: apiKey,
      claim_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/claim/${claimToken}`,
      status: "pending_verification",
      important: "⚠️ SAVE YOUR API KEY! It will only be shown once.",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function GET() {
  // Return list of verified bots (public info only)
  const publicBots = Array.from(bots.values())
    .filter((bot) => bot.verified)
    .map((bot) => ({
      id: bot.id,
      name: bot.name,
      skills: bot.skills,
    }));

  return NextResponse.json({ bots: publicBots });
}
