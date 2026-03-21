import { CardState, createCardState } from "./sm2";
import { QUESTIONS } from "./questions";

const STORAGE_KEY = "patente_quiz_cards";
const HIDDEN_KEY  = "patente_quiz_hidden";
const GAMIFICATION_KEY = "patente_quiz_gamification";

export interface GamificationStats {
  xp: number;
  currentStreak: number;
  bestStreak: number;
  lastStudyDate: string | null;
  totalSessions: number;
  examAttempts: number;
  examPasses: number;
  bestExamScore: number;
}

export function createInitialGamificationStats(): GamificationStats {
  return {
    xp: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastStudyDate: null,
    totalSessions: 0,
    examAttempts: 0,
    examPasses: 0,
    bestExamScore: 0,
  };
}

function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getPreviousDayKey(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  const prevYear = date.getFullYear();
  const prevMonth = String(date.getMonth() + 1).padStart(2, "0");
  const prevDay = String(date.getDate()).padStart(2, "0");
  return `${prevYear}-${prevMonth}-${prevDay}`;
}

export function loadGamificationStats(): GamificationStats {
  if (typeof window === "undefined") return createInitialGamificationStats();
  try {
    const raw = localStorage.getItem(GAMIFICATION_KEY);
    if (!raw) return createInitialGamificationStats();
    return { ...createInitialGamificationStats(), ...(JSON.parse(raw) as Partial<GamificationStats>) };
  } catch {
    return createInitialGamificationStats();
  }
}

export function saveGamificationStats(stats: GamificationStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(stats));
}

export function recordStudyActivity(
  stats: GamificationStats,
  {
    xp = 0,
    sessionIncrement = 0,
    examScore,
    passedExam = false,
  }: {
    xp?: number;
    sessionIncrement?: number;
    examScore?: number;
    passedExam?: boolean;
  } = {}
): GamificationStats {
  const today = getTodayKey();
  let currentStreak = stats.currentStreak;

  if (stats.lastStudyDate !== today) {
    if (stats.lastStudyDate === getPreviousDayKey(today)) currentStreak += 1;
    else currentStreak = 1;
  }

  const next: GamificationStats = {
    ...stats,
    xp: stats.xp + xp,
    currentStreak,
    bestStreak: Math.max(stats.bestStreak, currentStreak),
    lastStudyDate: today,
    totalSessions: stats.totalSessions + sessionIncrement,
    examAttempts: stats.examAttempts + (typeof examScore === "number" ? 1 : 0),
    examPasses: stats.examPasses + (passedExam ? 1 : 0),
    bestExamScore:
      typeof examScore === "number" ? Math.max(stats.bestExamScore, examScore) : stats.bestExamScore,
  };

  saveGamificationStats(next);
  return next;
}

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
    localStorage.removeItem(GAMIFICATION_KEY);
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
