import { NextRequest, NextResponse } from "next/server";
import {
  getQuizStateForUser,
  isAuthConfigured,
  registerUser,
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

  try {
    const user = await registerUser(username, pin);
    const state = await getQuizStateForUser(user.id);
    return NextResponse.json({ user, state });
  } catch (error) {
    const message =
      error instanceof Error && /duplicate key/i.test(error.message)
        ? "Username già esistente."
        : "Registrazione non riuscita.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
