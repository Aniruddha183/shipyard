import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// GET /api/leaderboard — top 20 users by points
export async function GET() {
  await connectDB();
  const users = await User.find()
    .sort({ totalPoints: -1 })
    .limit(20)
    .select("username avatar streak totalPoints rank")
    .lean();

  return NextResponse.json(users);
}
