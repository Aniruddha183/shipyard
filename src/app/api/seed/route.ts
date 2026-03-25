import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Project from "@/models/Project";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const session = await auth();

    // ── 1. Leaderboard "Ghost" users ────────────────────────────────────────
    const masterUsers = [
      { githubId: "ghost_1", username: "V. Kaelen",      email: "kaelen@shipyard.io",  streak: 12, totalPoints: 12808, rank: 1 },
      { githubId: "ghost_2", username: "S. Thorne",      email: "thorne@shipyard.io",  streak: 8,  totalPoints: 11288, rank: 2 },
      { githubId: "ghost_3", username: "Captain Cipher", email: "cipher@shipyard.io",  streak: 42, totalPoints: 9482,  rank: 3 },
    ];

    for (const u of masterUsers) {
      await User.findOneAndUpdate({ githubId: u.githubId }, u, { upsert: true });
    }

    // ── 2. Identify target accounts ─────────────────────────────────────────
    const targetUsers = [];

    // Always seed for the template architect
    const templateUser = await User.findOneAndUpdate(
      { githubId: "template_architect" },
      { username: "The Architect", email: "architect@shipyard.io", streak: 5, totalPoints: 3419, rank: 142 },
      { upsert: true, new: true }
    );
    targetUsers.push(templateUser);

    // If signed in, also seed for the real user
    if (session?.user?.email) {
      const realUser = await User.findOne({ email: session.user.email });
      if (realUser && realUser.githubId !== "template_architect") {
        targetUsers.push(realUser);
      }
    }

    // ── 3. Mock projects (regular) ──────────────────────────────────────────
    const getMockProjects = (userId: string) => [
      {
        userId,
        name: "Project Aegis",
        description: "Real-time encryption layer for distributed communication systems.",
        stack: ["Rust", "K8S", "gRPC"],
        status: "active",
        visibility: "public",
        deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        tasks: [
          { title: "Implement OAuth2 Flow",    status: "todo"       },
          { title: "Refactor API middleware",  status: "done"       },
          { title: "Setup K8S Cluster",        status: "inprogress" },
          { title: "Define gRPC Proto files",  status: "done"       },
        ],
      },
      {
        userId,
        name: "Neon Scribe",
        description: "Minimalist markdown editor with generative focus modes.",
        stack: ["Next.js", "Tailwind", "TipTap"],
        status: "paused",
        visibility: "private",
        tasks: [
          { title: "Fix editor flickering", status: "todo" },
          { title: "Implement dark mode",   status: "done" },
        ],
      },
    ];

    // ── 4. Community projects (public / shipped) ─────────────────────────────
    const getMockCommunityProjects = (userId: string) => [
      {
        userId,
        name: "Aurelius Engine",
        description: "A high-performance asynchronous runtime for distributed ship-to-shore communications.",
        stack: ["Rust", "gRPC", "K8S"],
        status: "shipped",
        visibility: "public",
        tasks: [
          { title: "Core runtime loop",      status: "done" },
          { title: "gRPC bridge",            status: "done" },
          { title: "K8S deployment config",  status: "done" },
          { title: "Documentation",          status: "done" },
        ],
      },
      {
        userId,
        name: "The Icarus Protocol",
        description: "Decentralized flight path optimization for high-altitude drones.",
        stack: ["Go", "WebAssembly"],
        status: "active",
        visibility: "public",
        tasks: [
          { title: "Path optimizer module", status: "done"       },
          { title: "WASM compilation",      status: "inprogress" },
          { title: "Geo-fence safety layer",status: "todo"       },
        ],
      },
      {
        userId,
        name: "Chrono-Sync V2",
        description: "Precision timing mechanism for sub-millisecond database reconciliation.",
        stack: ["Elixir", "PostgreSQL"],
        status: "reviewing",
        visibility: "public",
        tasks: [
          { title: "NTP synchronisation",   status: "done"       },
          { title: "Conflict resolver",     status: "done"       },
          { title: "Integration tests",     status: "inprogress" },
        ],
      },
    ];

    // ── 5. Graveyard projects (abandoned) ────────────────────────────────────
    const getMockGraveyardProjects = (userId: string) => [
      {
        userId,
        name: "LuminaOS",
        description: "A distributed operating system for remote instrumented environments.",
        stack: ["Rust", "Assembly"],
        status: "abandoned",
        visibility: "public",
        abandonedAt: new Date("2024-11-16"),
        completionSnapshot: 64,
        tasks: [
          { title: "Kernel boot sequence",  status: "done" },
          { title: "Memory allocator",      status: "done" },
          { title: "Driver interface",      status: "todo" },
          { title: "Network stack",         status: "todo" },
          { title: "Shell",                 status: "todo" },
        ],
      },
      {
        userId,
        name: "Project Aether",
        description: "Real-time mesh networking protocol for satellite autonomous systems.",
        stack: ["C++", "UX"],
        status: "abandoned",
        visibility: "public",
        abandonedAt: new Date("2024-05-12"),
        completionSnapshot: 12,
        tasks: [
          { title: "Mesh topology design",  status: "done" },
          { title: "Packet routing logic",  status: "todo" },
          { title: "Satellite handshake",   status: "todo" },
          { title: "Fault tolerance layer", status: "todo" },
          { title: "Dashboard UI",          status: "todo" },
          { title: "Load tests",            status: "todo" },
          { title: "Docs",                  status: "todo" },
          { title: "Deployment scripts",    status: "todo" },
        ],
      },
      {
        userId,
        name: "Sentient-JS",
        description: "A framework that predicts the next line of code from developer bias.",
        stack: ["TypeScript", "TensorFlow"],
        status: "abandoned",
        visibility: "public",
        abandonedAt: new Date("2024-02-22"),
        completionSnapshot: 88,
        tasks: [
          { title: "Bias detection model",  status: "done" },
          { title: "VSCode extension",      status: "done" },
          { title: "Training pipeline",     status: "done" },
          { title: "Publishing",            status: "todo" },
        ],
      },
      {
        userId,
        name: "Vault-Key",
        description: "Physical hardware security key built on non-volatile shuttle memory.",
        stack: ["Solidity", "Hardware"],
        status: "abandoned",
        visibility: "public",
        abandonedAt: new Date("2023-07-04"),
        completionSnapshot: 45,
        tasks: [
          { title: "Hardware spec",          status: "done" },
          { title: "Firmware base",          status: "done" },
          { title: "Solidity bridge",        status: "inprogress" },
          { title: "PCB design",             status: "todo" },
          { title: "Manufacturing partner",  status: "todo" },
        ],
      },
    ];

    // ── 6. Seed everything ───────────────────────────────────────────────────
    for (const user of targetUsers) {
      const allProjects = [
        ...getMockProjects(user._id),
        ...getMockCommunityProjects(user._id),
        ...getMockGraveyardProjects(user._id),
      ];

      for (const p of allProjects) {
        await Project.findOneAndUpdate(
          { userId: user._id, name: p.name },
          p,
          { upsert: true }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Shipyard fully populated for ${targetUsers.length} account(s). Regular, community & graveyard projects seeded.`,
      accounts: targetUsers.map((u) => u.username),
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
