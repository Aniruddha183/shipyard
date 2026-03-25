import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Project from "@/models/Project";

// GET /api/user/[username] — public profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  await connectDB();
  const { username } = await params;

  const user = await User.findOne({ username })
    .select("username avatar streak totalPoints rank createdAt")
    .lean();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Get public projects
  const projects = await Project.find({
    userId: user._id,
    visibility: "public",
    status: { $ne: "abandoned" },
  })
    .select("name description stack status tasks createdAt")
    .lean();

  // Get abandoned projects count
  const graveyardCount = await Project.countDocuments({
    userId: user._id,
    status: "abandoned",
  });

  return NextResponse.json({
    user,
    projects,
    graveyardCount,
    activeProjectCount: projects.length,
  });
}
