import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] 
    });

    if (existingUser) {
      return NextResponse.json({ error: "Username or email already commissioned." }, { status: 400 });
    }

    // Note: User model needs a 'password' field if using credentials
    // I will add it via a migration-style update in the model in the next step
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (githubId is null for credential users)
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword, // Temporary: model update coming
      githubId: "none", // Distinction for non-OAuth users
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
      streak: 0,
      totalPoints: 0,
      rank: 0,
    });

    return NextResponse.json({ success: "Account created successfully." }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Failed to commission account." }, { status: 500 });
  }
}
