import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentUser,
  getQuizStateForUser,
  isAuthConfigured,
  saveQuizStateForUser,
} from "@/lib/server/auth";
import { mergeCardsWithQuestionBank } from "@/lib/storage";
import { CardState } from "@/lib/sm2";

export async function GET() {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Auth non configurata." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  const state = await getQuizStateForUser(user.id);
  return NextResponse.json({ state });
}

export async function PUT(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({ error: "Auth non configurata." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Non autenticato." }, { status: 401 });
  }

  const body = await request.json();
  const cards = Array.isArray(body.cards) ? (body.cards as CardState[]) : [];
  const hidden = Array.isArray(body.hidden) ? body.hidden.map(String) : [];

  await saveQuizStateForUser(user.id, {
    cards: mergeCardsWithQuestionBank(cards),
    hidden,
  });

  return NextResponse.json({ ok: true });
}
