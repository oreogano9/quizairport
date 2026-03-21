import { CardState, createCardState } from "./sm2";
import { QUESTIONS } from "./questions";

const STORAGE_KEY = "patente_quiz_cards";
const HIDDEN_KEY  = "patente_quiz_hidden";

export function loadCards(): CardState[] {
  if (typeof window === "undefined") return createInitialCards();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialCards();
    const saved: CardState[] = JSON.parse(raw);
    return mergeCardsWithQuestionBank(saved);
  } catch {
    return createInitialCards();
  }
}

export function saveCards(cards: CardState[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function resetCards(): CardState[] {
  const fresh = createInitialCards();
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
  saveHidden(hidden);
}

export function unhideQuestion(id: string): void {
  if (typeof window === "undefined") return;
  const hidden = loadHidden();
  hidden.delete(id);
  saveHidden(hidden);
}

export function saveHidden(hidden: Iterable<string>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden]));
}

export function createInitialCards(): CardState[] {
  return QUESTIONS.map((q) => createCardState(q.id));
}

export function mergeCardsWithQuestionBank(saved: CardState[]): CardState[] {
  const questionIds = new Set(QUESTIONS.map((question) => question.id));
  const pruned = saved.filter((card) => questionIds.has(card.questionId));
  const savedIds = new Set(pruned.map((card) => card.questionId));
  const newCards = QUESTIONS
    .filter((question) => !savedIds.has(question.id))
    .map((question) => createCardState(question.id));
  return [...pruned, ...newCards];
}
