import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

const USER_COUNT_KEY = "github_roaster_user_count";
let localUserCount = 0;

async function getCount() {
  if (process.env.VERCEL_ENV === "production") {
    return (await kv.get<number>(USER_COUNT_KEY)) || 0;
  } else {
    return localUserCount;
  }
}

async function incrementCount() {
  if (process.env.VERCEL_ENV === "production") {
    return await kv.incr(USER_COUNT_KEY);
  } else {
    return ++localUserCount;
  }
}

export async function GET() {
  try {
    const count = await getCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Error fetching user count:", error);
    return NextResponse.json(
      { error: "Failed to fetch user count" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const newCount = await incrementCount();
    return NextResponse.json({ count: newCount });
  } catch (error) {
    console.error("Error incrementing user count:", error);
    return NextResponse.json(
      { error: "Failed to update user count" },
      { status: 500 }
    );
  }
}
