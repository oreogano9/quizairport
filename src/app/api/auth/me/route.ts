import { NextResponse } from "next/server";
import {
  getCurrentUser,
  getQuizStateForUser,
  isAuthConfigured,
} from "@/lib/server/auth";

export async function GET() {
  if (!isAuthConfigured()) {
    return NextResponse.json({ authEnabled: false, user: null, state: null });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authEnabled: true, user: null, state: null });
  }

  const state = await getQuizStateForUser(user.id);
  return NextResponse.json({ authEnabled: true, user, state });
}
