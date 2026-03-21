import { NextRequest, NextResponse } from "next/server";
import {
  getQuizStateForUser,
  isAuthConfigured,
  loginUser,
  validateCredentials,
} from "@/lib/server/auth";

export async function POST(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { error: "DATABASE_URL non configurato. Il login persistente non è ancora attivo." },
      { status: 503 }
    );
  }

  const body = await request.json();
  const username = String(body.username ?? "");
  const pin = String(body.pin ?? "");

  const validation = validateCredentials(username, pin);
  if (validation) {
    return NextResponse.json({ error: validation }, { status: 400 });
  }

  const user = await loginUser(username, pin);
  if (!user) {
    return NextResponse.json({ error: "Credenziali non valide." }, { status: 401 });
  }

  const state = await getQuizStateForUser(user.id);
  return NextResponse.json({ user, state });
}
