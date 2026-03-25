import { NextRequest, NextResponse } from "next/server";
import { processStreaks, recalculateRanks } from "@/lib/points";

// GET /api/cron/streaks — daily streak processing
// Should be triggered by Vercel Cron or external scheduler at midnight IST
export async function GET(req: NextRequest) {
  // Simple auth check — use a secret header in production
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "shipyard-cron-secret";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await processStreaks();
    await recalculateRanks();

    return NextResponse.json({
      success: true,
      message: "Streaks processed and ranks recalculated",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Streak processing failed", details: String(error) },
      { status: 500 }
    );
  }
}
