import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Project from "@/models/Project";
import mongoose from "mongoose";

// GET /api/builders/[id]  — id can be MongoDB _id or githubId
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "Builder ID required" }, { status: 400 });
    }

    // Try by MongoDB ObjectId first, fallback to githubId
    let user = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      user = await User.findById(id);
    }
    if (!user) {
      user = await User.findOne({ githubId: id });
    }
    // Fallback: by username (keeps old links working)
    if (!user) {
      user = await User.findOne({ username: new RegExp(`^${id}$`, "i") });
    }

    if (!user) {
      return NextResponse.json({ error: "Builder not found" }, { status: 404 });
    }

    const projects = await Project.find({
      userId: user._id,
      visibility: "public",
      status: { $ne: "abandoned" },
    }).sort({ updatedAt: -1 });

    return NextResponse.json({
      builder: user.toJSON(),
      projects: projects.map(p => {
        const doc = p.toJSON();
        doc.username = user!.username;
        return doc;
      }),
    });
  } catch (error: any) {
    console.error("Builder fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
