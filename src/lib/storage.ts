import { CardState, createCardState } from "./sm2";
import { QUESTIONS } from "./questions";

const STORAGE_KEY = "patente_quiz_cards";
const HIDDEN_KEY  = "patente_quiz_hidden";

export function loadCards(): CardState[] {
  if (typeof window === "undefined") return initCards();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initCards();
    const saved: CardState[] = JSON.parse(raw);
    // Merge: add any new questions not yet in storage
    const savedIds = new Set(saved.map((c) => c.questionId));
    const newCards = QUESTIONS
      .filter((q) => !savedIds.has(q.id))
      .map((q) => createCardState(q.id));
    return [...saved, ...newCards];
  } catch {
    return initCards();
  }
}

export function saveCards(cards: CardState[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function resetCards(): CardState[] {
  const fresh = initCards();
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    localStorage.removeItem(HIDDEN_KEY);
  }
  return fresh;
}

// ── Hidden questions ──────────────────────────────────────────────────────────

export function loadHidden(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function hideQuestion(id: string): void {
  if (typeof window === "undefined") return;
  const hidden = loadHidden();
  hidden.add(id);
  localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden]));
}

export function unhideQuestion(id: string): void {
  if (typeof window === "undefined") return;
  const hidden = loadHidden();
  hidden.delete(id);
  localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden]));
}

function initCards(): CardState[] {
  return QUESTIONS.map((q) => createCardState(q.id));
}
