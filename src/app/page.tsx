"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Question, QUESTIONS } from "@/lib/questions";
import { CATEGORY_LABELS, GLOSSARY, GlossaryEntry } from "@/lib/glossary";
import {
  CardState,
  applyRating,
  createCardState,
  isDue,
  RATING_AGAIN,
  RATING_EASY,
  RATING_GOOD,
  RATING_HARD,
} from "@/lib/sm2";
import {
  GamificationStats,
  hideGlossaryEntry,
  hideQuestion,
  loadCards,
  loadGamificationStats,
  loadHidden,
  loadHiddenGlossary,
  mergeCardsWithQuestionBank,
  recordStudyActivity,
  resetCards,
  saveCards,
  saveGamificationStats,
  saveHidden,
  saveHiddenGlossary,
  unhideGlossaryEntry,
  unhideQuestion,
} from "@/lib/storage";

type View =
  | "dashboard"
  | "debug"
  | "settings"
  | "search"
  | "topic_detail"
  | "quiz"
  | "result"
  | "exam_quiz"
  | "exam_result"
  | "glossary"
  | "acronym_quiz"
  | "acronym_result";

interface ShuffledOption {
  text: string;
  originalIndex: number;
}

interface AcronymQuizItem {
  entry: GlossaryEntry & { fullForm: string };
  options: string[];
}

interface ExamAnswer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
}

interface ExamQuestionState {
  question: Question;
  shuffled: ShuffledOption[];
}

interface SaveTransferPayload {
  version: 1;
  exportedAt: string;
  cards: CardState[];
  hidden: string[];
  hiddenGlossary: string[];
  gamification: GamificationStats;
}

type ImportMode = "overwrite" | "merge";
const QUIZ_BATCH_SIZE = 20;

function getQuestion(id: string): Question {
  return QUESTIONS.find((q) => q.id === id)!;
}

function mergeImportedCards(currentCards: CardState[], importedCards: CardState[]): CardState[] {
  const byId = new Map<string, CardState>();
  for (const card of currentCards) byId.set(card.questionId, card);
  for (const card of importedCards) {
    const current = byId.get(card.questionId);
    if (!current) {
      byId.set(card.questionId, card);
      continue;
    }

    const currentScore =
      current.repetitions * 1000 +
      current.correctReviews * 10 +
      current.totalReviews +
      current.easeFactor;
    const importedScore =
      card.repetitions * 1000 +
      card.correctReviews * 10 +
      card.totalReviews +
      card.easeFactor;

    byId.set(card.questionId, importedScore >= currentScore ? card : current);
  }

  return mergeCardsWithQuestionBank([...byId.values()]);
}

function mergeGamificationStats(current: GamificationStats, incoming?: Partial<GamificationStats>): GamificationStats {
  if (!incoming) return current;
  return {
    xp: Math.max(current.xp, incoming.xp ?? 0),
    currentStreak: Math.max(current.currentStreak, incoming.currentStreak ?? 0),
    bestStreak: Math.max(current.bestStreak, incoming.bestStreak ?? 0),
    lastStudyDate:
      !current.lastStudyDate || !incoming.lastStudyDate
        ? current.lastStudyDate ?? incoming.lastStudyDate ?? null
        : current.lastStudyDate > incoming.lastStudyDate
          ? current.lastStudyDate
          : incoming.lastStudyDate,
    totalSessions: Math.max(current.totalSessions, incoming.totalSessions ?? 0),
    examAttempts: Math.max(current.examAttempts, incoming.examAttempts ?? 0),
    examPasses: Math.max(current.examPasses, incoming.examPasses ?? 0),
    bestExamScore: Math.max(current.bestExamScore, incoming.bestExamScore ?? 0),
  };
}

function shuffleArray<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function getDueCards(cards: CardState[], hidden: Set<string>, topic?: string): CardState[] {
  return cards.filter(
    (card) =>
      isDue(card) &&
      !hidden.has(card.questionId) &&
      (!topic || getQuestion(card.questionId).topic === topic)
  );
}

function getQuizPoolCandidates(
  cards: CardState[],
  hidden: Set<string>,
  topic?: string,
  excludedQuestionIds: Set<string> = new Set()
): CardState[] {
  return cards.filter(
    (card) =>
      !hidden.has(card.questionId) &&
      !excludedQuestionIds.has(card.questionId) &&
      (!topic || getQuestion(card.questionId).topic === topic)
  );
}

function compareDueCards(a: CardState, b: CardState): number {
  const dueDiff =
    new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime();
  return (
    b.stabilityBoostSessionsLeft - a.stabilityBoostSessionsLeft ||
    b.struggleScore - a.struggleScore ||
    b.recentHardStreak - a.recentHardStreak ||
    dueDiff ||
    a.questionId.localeCompare(b.questionId)
  );
}

function compareFragileCards(a: CardState, b: CardState): number {
  return (
    b.stabilityBoostSessionsLeft - a.stabilityBoostSessionsLeft ||
    b.struggleScore - a.struggleScore ||
    b.recentHardStreak - a.recentHardStreak ||
    b.totalReviews - a.totalReviews ||
    a.questionId.localeCompare(b.questionId)
  );
}

function compareStableCards(a: CardState, b: CardState): number {
  const aIsNew = a.totalReviews === 0 ? 1 : 0;
  const bIsNew = b.totalReviews === 0 ? 1 : 0;
  return (
    bIsNew - aIsNew ||
    b.totalReviews - a.totalReviews ||
    a.questionId.localeCompare(b.questionId)
  );
}

function buildQuizBatch(
  cards: CardState[],
  hidden: Set<string>,
  topic?: string,
  excludedQuestionIds: Set<string> = new Set()
): { batch: CardState[]; updatedCards: CardState[]; remainingPoolCount: number } {
  const pool = getQuizPoolCandidates(cards, hidden, topic, excludedQuestionIds);
  const dueCards = pool.filter(isDue).sort(compareDueCards);
  const fragileCards = pool
    .filter(
      (card) =>
        !isDue(card) &&
        (card.stabilityBoostSessionsLeft > 0 || card.struggleScore > 0 || card.recentHardStreak > 0)
    )
    .sort(compareFragileCards);
  const stableCards = pool
    .filter(
      (card) =>
        !isDue(card) &&
        card.stabilityBoostSessionsLeft === 0 &&
        card.struggleScore === 0 &&
        card.recentHardStreak === 0
    )
    .sort(compareStableCards);

  const ordered = [...dueCards, ...fragileCards, ...stableCards];
  const batchIds = new Set<string>();
  const selected = ordered.filter((card) => {
    if (batchIds.has(card.questionId)) return false;
    if (batchIds.size >= QUIZ_BATCH_SIZE) return false;
    batchIds.add(card.questionId);
    return true;
  });

  const selectedIds = new Set(selected.map((card) => card.questionId));
  const updatedCards = cards.map((card) => {
    if (!selectedIds.has(card.questionId) || card.stabilityBoostSessionsLeft <= 0) return card;
    return {
      ...card,
      stabilityBoostSessionsLeft: Math.max(0, card.stabilityBoostSessionsLeft - 1),
    };
  });
  const updatedSelected = selected.map(
    (card) => updatedCards.find((candidate) => candidate.questionId === card.questionId) ?? card
  );

  return {
    batch: updatedSelected,
    updatedCards,
    remainingPoolCount: Math.max(0, pool.length - updatedSelected.length),
  };
}

function shuffleOptions(question: Question): ShuffledOption[] {
  return shuffleArray(question.options.map((text, originalIndex) => ({ text, originalIndex })));
}

function topicColor(topic: string): string {
  const map: Record<string, string> = {
    Definizioni: "bg-blue-900/50 text-blue-300",
    ADC: "bg-purple-900/50 text-purple-300",
    Sanzioni: "bg-red-900/50 text-red-300",
    "Obblighi conducente": "bg-yellow-900/50 text-yellow-300",
    Velocità: "bg-orange-900/50 text-orange-300",
    Precedenze: "bg-green-900/50 text-green-300",
    Luci: "bg-cyan-900/50 text-cyan-300",
    Segnaletica: "bg-teal-900/50 text-teal-300",
    "Taxiway e piazzole": "bg-indigo-900/50 text-indigo-300",
    "Parcheggio e sosta": "bg-pink-900/50 text-pink-300",
    Viabilità: "bg-amber-900/50 text-amber-300",
    Rifornimento: "bg-lime-900/50 text-lime-300",
    Emergenze: "bg-red-800/50 text-red-200",
    "Bassa visibilità": "bg-slate-700/50 text-slate-300",
    "Dotazione veicoli": "bg-emerald-900/50 text-emerald-300",
    "Area di Manovra": "bg-violet-900/50 text-violet-300",
    "Accesso senza ADC": "bg-rose-900/50 text-rose-300",
    "Mezzi speciali": "bg-sky-900/50 text-sky-300",
    Normativa: "bg-gray-700/50 text-gray-300",
    Inibizione: "bg-orange-800/50 text-orange-200",
    "Distanze di sicurezza": "bg-blue-800/50 text-blue-200",
  };
  return map[topic] ?? "bg-gray-700/50 text-gray-300";
}

function ratingLabel(n: number): string {
  return ["Di nuovo", "Difficile", "Bene", "Facile"][n] ?? "";
}

function ratingColor(n: number): string {
  return [
    "bg-red-600 hover:bg-red-500 active:bg-red-700",
    "bg-orange-500 hover:bg-orange-400 active:bg-orange-600",
    "bg-blue-600 hover:bg-blue-500 active:bg-blue-700",
    "bg-green-600 hover:bg-green-500 active:bg-green-700",
  ][n] ?? "";
}

function ratingIntervalHint(card: CardState, rating: number): string {
  if (rating === RATING_AGAIN) return "< 1 min";
  const next = applyRating(card, rating);
  const days = next.interval;
  if (days <= 1) {
    if (rating === RATING_HARD) return "< 6 min";
    if (rating === RATING_GOOD) return "< 10 min";
    return "1 giorno";
  }
  if (days < 7) return `tra ${days} giorni`;
  if (days < 30) return `tra ${Math.round(days / 7)} sett.`;
  return `tra ${Math.round(days / 30)} mesi`;
}

function formatNextReview(card: CardState): string {
  if (card.totalReviews === 0) return "nuova";
  const nextReview = new Date(card.nextReviewDate);
  const now = new Date();
  const diff = Math.ceil((nextReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "da ripassare";
  if (diff === 1) return "domani";
  if (diff < 7) return `tra ${diff} giorni`;
  if (diff < 30) return `tra ${Math.round(diff / 7)} sett.`;
  return `tra ${Math.round(diff / 30)} mesi`;
}


function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeGlossaryKey(value: string): string {
  return value.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
}

function getAcronymDottedVariant(value: string): string | null {
  if (!/^[A-Z]{2,}$/.test(value)) return null;
  return `${value.split("").join(".")}.`;
}

const GLOSSARY_ALIASES: Record<string, string[]> = {
  "gl-adc": ["A.D.C."],
  "gl-ade": ["A.D.E."],
  "gl-airside": ["air side"],
  "gl-apron": ["Apron", "piazzale", "piazzali"],
  "gl-aca": ["ACA mezzi", "Autorizzazione alla Circolazione"],
  "gl-beacon": ["luce anticollisione"],
  "gl-cea": ["CEA ADR"],
  "gl-centerline": ["center-line"],
  "gl-chocks": ["wheel chocks", "tacchi", "chocks"],
  "gl-conspicuous": ["conspicuous color"],
  "gl-enav": ["ENAV/TWR", "TWR ENAV"],
  "gl-passo-duomo": ["passo d'uomo"],
  "gl-qr-adr": ["QR code ADR", "Quick References"],
  "gl-rwy-strip": ["RWY STRIP NO ENTRY"],
  "gl-stand": ["Aircraft Stand", "Piazzola", "piazzola aeromobile", "piazzole"],
  "gl-stop-aeronautico": ["stop aeronautico"],
  "gl-uld": ["carrelli ULD"],
  "gl-viabilita": ["veicolare", "veicolari", "via di scorrimento", "vie di scorrimento"],
  "gl-zebratura-rossa": ["zebratura rossa"],
};

const GLOSSARY_MATCHERS = Array.from(
  new Map(
    GLOSSARY.flatMap((entry) => {
      const needles = [
        entry.term,
        ...(getAcronymDottedVariant(entry.term) ? [getAcronymDottedVariant(entry.term)!] : []),
        ...(entry.fullForm ? [entry.fullForm] : []),
        ...(GLOSSARY_ALIASES[entry.id] ?? []),
      ];
      return needles.map((needle) => [normalizeGlossaryKey(needle), { needle, entry }] as const);
    })
  ).values()
).sort((a, b) => b.needle.length - a.needle.length);

const GLOSSARY_LOOKUP = new Map(
  GLOSSARY_MATCHERS.map(({ needle, entry }) => [normalizeGlossaryKey(needle), entry])
);

const GLOSSARY_REGEX = new RegExp(
  `(${GLOSSARY_MATCHERS.map(({ needle }) => escapeRegExp(needle)).join("|")})`,
  "gi"
);

const GLOSSARY_BY_CATEGORY = Object.entries(CATEGORY_LABELS).map(([category, label]) => ({
  category: category as GlossaryEntry["category"],
  label,
  entries: GLOSSARY.filter((entry) => entry.category === category).sort((a, b) =>
    a.term.localeCompare(b.term, "it")
  ),
}));

const ACRONYM_ENTRIES = GLOSSARY.filter(
  (entry): entry is GlossaryEntry & { fullForm: string } =>
    entry.category === "acronym" && typeof entry.fullForm === "string"
);

function getGlossaryEntry(value: string): GlossaryEntry | undefined {
  return GLOSSARY_LOOKUP.get(normalizeGlossaryKey(value));
}

function isV2Question(question: Question): boolean {
  return question.versionTag === "v2";
}

function getQuestionDisplayText(raw: string): string {
  return raw.replace(/\s+\(([A-Z0-9./-]{2,})\)/g, "").trim();
}

function InlineGlossaryTerm({ entry, text }: { entry: GlossaryEntry; text: string }) {
  const [open, setOpen] = useState(false);
  const [openDownward, setOpenDownward] = useState(false);
  const [horizontalAlign, setHorizontalAlign] = useState<"center" | "left" | "right">("center");
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    if (!open) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setOpenDownward(rect.top < 180);
      const popupWidth = Math.min(288, window.innerWidth - 48);
      const centerLeft = rect.left + rect.width / 2 - popupWidth / 2;
      const centerRight = rect.left + rect.width / 2 + popupWidth / 2;
      if (centerLeft < 16) setHorizontalAlign("left");
      else if (centerRight > window.innerWidth - 16) setHorizontalAlign("right");
      else setHorizontalAlign("center");
    }

    const close = (event: Event) => {
      const target = event.target;
      if (target instanceof Node && containerRef.current?.contains(target)) return;
      setOpen(false);
    };

    const closeOnScroll = () => setOpen(false);

    document.addEventListener("pointerdown", close);
    document.addEventListener("touchstart", close, { passive: true });
    window.addEventListener("scroll", closeOnScroll, { passive: true });

    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("touchstart", close);
      window.removeEventListener("scroll", closeOnScroll);
    };
  }, [open]);

  return (
    <span ref={containerRef} className="relative inline-block align-baseline">
      <span
        className="border-b border-dotted border-slate-400 cursor-help"
        onMouseEnter={(event) => {
          if ("ontouchstart" in window) return;
          event.stopPropagation();
          setOpen(true);
        }}
        onMouseLeave={(event) => {
          if ("ontouchstart" in window) return;
          event.stopPropagation();
          setOpen(false);
        }}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        onTouchStart={(event) => {
          event.stopPropagation();
        }}
      >
        {text}
      </span>
      {open && (
        <span
          className={`absolute z-50 w-72 max-w-[calc(100vw-3rem)] rounded-xl border border-slate-600 bg-slate-900 p-3 text-left text-xs leading-relaxed text-slate-200 shadow-2xl ${
            horizontalAlign === "center"
              ? "left-1/2 -translate-x-1/2"
              : horizontalAlign === "left"
                ? "left-0"
                : "right-0"
          } ${
            openDownward
              ? "top-full mt-2"
              : "top-0 -translate-y-[calc(100%+0.5rem)]"
          }`}
        >
          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${entry.color}`}>
            {entry.term}
          </span>
          {entry.fullForm && (
            <span className="mt-2 block font-semibold text-slate-100">{entry.fullForm}</span>
          )}
          <span className="mt-1 block text-slate-300">{entry.definition}</span>
        </span>
      )}
    </span>
  );
}

function GlossaryText({ text, interactive = true }: { text: string; interactive?: boolean }) {
  if (!interactive) return <>{text}</>;

  const parts = text.split(GLOSSARY_REGEX);

  return (
    <>
      {parts.map((part, index) => {
        const entry = getGlossaryEntry(part);
        if (!entry) return <span key={`${part}-${index}`}>{part}</span>;
        return <InlineGlossaryTerm key={`${entry.id}-${index}`} entry={entry} text={part} />;
      })}
    </>
  );
}

function ExplanationText({
  text,
  interactive = true,
  size = "sm",
}: {
  text: string;
  interactive?: boolean;
  size?: "xs" | "sm";
}) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const whyIndex = normalized.indexOf("Perché?");
  const rememberIndex = normalized.indexOf("💡 Ricorda:");

  let intro = normalized;
  let why = "";
  let remember = "";

  if (whyIndex >= 0) {
    intro = normalized.slice(0, whyIndex).trim();
    if (rememberIndex >= 0 && rememberIndex > whyIndex) {
      why = normalized.slice(whyIndex + "Perché?".length, rememberIndex).trim();
      remember = normalized.slice(rememberIndex + "💡 Ricorda:".length).trim();
    } else {
      why = normalized.slice(whyIndex + "Perché?".length).trim();
    }
  } else if (rememberIndex >= 0) {
    intro = normalized.slice(0, rememberIndex).trim();
    remember = normalized.slice(rememberIndex + "💡 Ricorda:".length).trim();
  }

  const bodyClass = size === "xs" ? "text-xs" : "text-sm";

  return (
    <div className="space-y-3">
      {intro && (
        <div className={`${bodyClass} leading-relaxed text-slate-200`}>
          <GlossaryText text={intro} interactive={interactive} />
        </div>
      )}
      {why && (
        <div className="rounded-lg border border-slate-700 bg-slate-950/40 p-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Perche</div>
          <div className={`${bodyClass} leading-relaxed text-slate-300`}>
            <GlossaryText text={why} interactive={interactive} />
          </div>
        </div>
      )}
      {remember && (
        <div className="rounded-lg border border-blue-900/60 bg-blue-950/20 p-3">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-blue-300">Ricorda</div>
          <div className={`${bodyClass} leading-relaxed text-blue-100`}>
            <GlossaryText text={remember} interactive={interactive} />
          </div>
        </div>
      )}
    </div>
  );
}

function IconBack() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function IconChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);

  return (
    <svg width="88" height="88" className="rotate-[-90deg]">
      <circle cx="44" cy="44" r={radius} fill="none" stroke="#1e293b" strokeWidth="8" />
      <circle
        cx="44"
        cy="44"
        r={radius}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

function ConfirmRow({
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
      <span className="text-slate-400">{message}</span>
      <button onClick={onConfirm} className={`font-semibold ${confirmColor}`}>
        {confirmLabel}
      </button>
      <button onClick={onCancel} className="text-slate-500 hover:text-slate-300">
        Annulla
      </button>
    </div>
  );
}

function Dashboard({
  cards,
  hidden,
  onStartQuiz,
  onStartExamSimulation,
  onOpenTopic,
  onOpenGlossary,
  onOpenSettings,
  onOpenSearch,
  onReset,
}: {
  cards: CardState[];
  hidden: Set<string>;
  onStartQuiz: () => void;
  onStartExamSimulation: () => void;
  onOpenTopic: (topic: string) => void;
  onOpenGlossary: () => void;
  onOpenSettings: () => void;
  onOpenSearch: () => void;
  onReset: () => void;
}) {
  const [resetStep, setResetStep] = useState<0 | 1 | 2>(0);
  const [resetPhrase, setResetPhrase] = useState("");
  const activeCards = cards.filter((card) => !hidden.has(card.questionId));
  const dueCount = getDueCards(cards, hidden).length;
  const availableQuizCount = activeCards.length;
  const newCount = activeCards.filter((card) => card.totalReviews === 0).length;
  const masteredCount = activeCards.filter((card) => card.repetitions >= 3).length;
  const totalReviews = activeCards.reduce((sum, card) => sum + card.totalReviews, 0);
  const correctReviews = activeCards.reduce((sum, card) => sum + card.correctReviews, 0);
  const accuracy = totalReviews === 0 ? 0 : Math.round((correctReviews / totalReviews) * 100);
  const hasStartedStudying = totalReviews > 0;
  const topicMap: Record<string, { total: number; mastered: number; due: number; reviews: number; accuracySum: number }> = {};
  for (const question of QUESTIONS) {
    if (hidden.has(question.id)) continue;
    if (!topicMap[question.topic]) {
      topicMap[question.topic] = { total: 0, mastered: 0, due: 0, reviews: 0, accuracySum: 0 };
    }
    topicMap[question.topic].total += 1;
    const card = cards.find((candidate) => candidate.questionId === question.id);
    if (!card) continue;
    if (card.repetitions >= 3) topicMap[question.topic].mastered += 1;
    if (isDue(card)) topicMap[question.topic].due += 1;
    if (card.totalReviews > 0) {
      topicMap[question.topic].reviews += 1;
      topicMap[question.topic].accuracySum += card.correctReviews / card.totalReviews;
    }
  }
  const weakTopics = Object.entries(topicMap)
    .map(([topic, value]) => {
      const mastery = value.total === 0 ? 0 : value.mastered / value.total;
      const accuracyValue = value.reviews === 0 ? 0.5 : value.accuracySum / value.reviews;
      const pressure = value.total === 0 ? 0 : value.due / value.total;
      const score = mastery * 0.45 + accuracyValue * 0.3 + (1 - pressure) * 0.25;
      return {
        topic,
        ...value,
        accuracy: Math.round(accuracyValue * 100),
        score,
      };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="space-y-1 text-center">
        <div className="text-2xl font-bold text-white">Patente Airside</div>
        <div className="text-sm text-slate-400">ADC-A · Fiumicino / Ciampino</div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Da ripassare", value: dueCount, color: "text-yellow-400" },
          { label: "Nuove", value: newCount, color: "text-blue-400" },
          { label: "Domande Apprese", value: masteredCount, color: "text-green-400" },
          { label: "Precisione", value: `${accuracy}%`, color: "text-purple-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl bg-slate-800 p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="mt-1 text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-xl bg-slate-800 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">Progresso totale</span>
          <span className="text-slate-400">
            {masteredCount} / {activeCards.length}
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-700">
          <div
            className="h-2.5 rounded-full bg-blue-500 transition-all duration-500"
            style={{
              width: `${activeCards.length === 0 ? 0 : (masteredCount / activeCards.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <button
        onClick={onStartQuiz}
        disabled={availableQuizCount === 0}
        className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {availableQuizCount > 0
          ? `Inizia ripasso · fino a ${Math.min(QUIZ_BATCH_SIZE, availableQuizCount)} domande`
          : "Nessuna domanda disponibile"}
      </button>

      <button
        onClick={onOpenGlossary}
        className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700 active:bg-slate-600"
      >
        Glossario
      </button>

      <button
        onClick={onOpenSearch}
        className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700 active:bg-slate-600"
      >
        Cerca domande
      </button>

      <button
        onClick={onStartExamSimulation}
        className="w-full rounded-xl border border-emerald-700/60 bg-emerald-900/30 py-3 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-900/50 active:bg-emerald-950/60"
      >
        Simulazione Esame ADC
      </button>

      {hasStartedStudying && (
        <div className="space-y-3 rounded-xl bg-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-200">Focus consigliato</div>
            <div className="text-xs text-slate-500">Topic da consolidare</div>
          </div>
          <div className="grid gap-2">
            {weakTopics.map((topic) => (
              <button
                key={topic.topic}
                onClick={() => onOpenTopic(topic.topic)}
                className="rounded-xl border border-slate-700 bg-slate-900/40 p-3 text-left transition-colors hover:bg-slate-700/60"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${topicColor(topic.topic)}`}>
                    {topic.topic}
                  </span>
                  <span className="text-xs text-slate-500">{topic.due} da ripassare</span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-400">
                  <div>
                    <span className="block text-slate-500">Apprese</span>
                    <span className="font-semibold text-slate-200">
                      {topic.mastered}/{topic.total}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Precisione</span>
                    <span className="font-semibold text-slate-200">{topic.accuracy}%</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Pressione</span>
                    <span className="font-semibold text-slate-200">
                      {topic.total === 0 ? 0 : Math.round((topic.due / topic.total) * 100)}%
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="grid gap-2">
          {Object.entries(topicMap)
            .sort((a, b) => a[1].mastered / a[1].total - b[1].mastered / b[1].total)
            .map(([topic, { total, mastered }]) => (
              <button
                key={topic}
                onClick={() => onOpenTopic(topic)}
                className="flex w-full items-center gap-3 rounded-xl bg-slate-800 p-3 text-left transition-colors hover:bg-slate-700 active:bg-slate-600"
              >
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${topicColor(topic)}`}>
                  {topic}
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-slate-700">
                  <div
                    className="h-1.5 rounded-full bg-green-500 transition-all duration-500"
                    style={{ width: `${(mastered / total) * 100}%` }}
                  />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="tabular-nums text-xs text-slate-500">
                    {mastered}/{total}
                  </span>
                  <IconChevronDown open={false} />
                </div>
              </button>
            ))}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onOpenSettings}
          className="mb-4 text-sm font-semibold text-slate-400 transition-colors hover:text-slate-200"
        >
          Impostazioni
        </button>
      </div>

      <div className="text-center">
        <button
          onClick={() => {
            setResetStep(1);
            setResetPhrase("");
          }}
          className="text-xs text-slate-600 transition-colors hover:text-slate-400"
        >
          Azzera tutti i progressi
        </button>
      </div>

      {resetStep > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
            {resetStep === 1 ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-lg font-semibold text-white">Conferma azzeramento</div>
                  <div className="text-sm leading-relaxed text-slate-400">
                    Questa azione elimina tutto il progresso locale, incluse domande nascoste e stato del glossario.
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setResetStep(0)}
                    className="rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700"
                  >
                    No
                  </button>
                  <button
                    onClick={() => setResetStep(2)}
                    className="rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500"
                  >
                    Si, continua
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="text-lg font-semibold text-white">Conferma finale</div>
                  <div className="text-sm leading-relaxed text-slate-400">
                    Per confermare davvero, scrivi <span className="font-semibold text-slate-200">ACCETTO</span>.
                  </div>
                </div>
                <input
                  autoFocus
                  value={resetPhrase}
                  onChange={(event) => setResetPhrase(event.target.value)}
                  placeholder="Scrivi ACCETTO"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setResetStep(0);
                      setResetPhrase("");
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={() => {
                      onReset();
                      setResetStep(0);
                      setResetPhrase("");
                    }}
                    disabled={resetPhrase.trim().toUpperCase() !== "ACCETTO"}
                    className="rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Azzera tutto
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DebugView({
  hidden,
  onBack,
}: {
  hidden: Set<string>;
  onBack: () => void;
}) {
  const hiddenQuestions = QUESTIONS.filter((question) => hidden.has(question.id));
  const plainText = hiddenQuestions
    .map((question) => `${question.id}\n${getQuestionDisplayText(question.question)}`)
    .join("\n\n");
  const [copied, setCopied] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="shrink-0 p-1 text-slate-400 transition-colors hover:text-white">
          <IconBack />
        </button>
        <div className="flex-1">
          <div className="text-xl font-bold text-white">Debug</div>
          <div className="text-sm text-slate-400">Elenco domande nascoste in testo semplice, facilmente copiabile.</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-200">
            Domande nascoste: {hiddenQuestions.length}
          </div>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(plainText);
                setCopied(true);
                setCopyMessage(null);
                window.setTimeout(() => setCopied(false), 1500);
              } catch {
                setCopyMessage("Copia non riuscita in questo browser.");
              }
            }}
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
          >
            {copied ? "Copiato" : "Copia tutto"}
          </button>
        </div>
        <textarea
          readOnly
          value={plainText}
          className="min-h-[24rem] w-full rounded-lg border border-slate-700 bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-300 outline-none"
        />
        {copyMessage && <div className="mt-2 text-xs text-slate-500">{copyMessage}</div>}
      </div>
    </div>
  );
}

function SettingsView({
  cards,
  hidden,
  hiddenGlossary,
  gamification,
  onImport,
  onUnhideQuestion,
  onUnhideGlossary,
  onOpenDebug,
  onBack,
}: {
  cards: CardState[];
  hidden: Set<string>;
  hiddenGlossary: Set<string>;
  gamification: GamificationStats;
  onImport: (payload: SaveTransferPayload, mode: "overwrite" | "merge") => { ok: boolean; message: string };
  onUnhideQuestion: (id: string) => void;
  onUnhideGlossary: (id: string) => void;
  onOpenDebug: () => void;
  onBack: () => void;
}) {
  const exportPayload: SaveTransferPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    cards,
    hidden: [...hidden],
    hiddenGlossary: [...hiddenGlossary],
    gamification,
  };
  const hiddenQuestions = QUESTIONS.filter((question) => hidden.has(question.id));
  const hiddenGlossaryEntries = ACRONYM_ENTRIES.filter((entry) => hiddenGlossary.has(entry.id));
  const [copiedSave, setCopiedSave] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [importText, setImportText] = useState("");
  const [importMessage, setImportMessage] = useState<string | null>(null);

  let parsedImport: SaveTransferPayload | null = null;
  try {
    const parsed = JSON.parse(importText);
    if (parsed && parsed.version === 1 && Array.isArray(parsed.cards)) parsedImport = parsed;
  } catch {}

  const preview = parsedImport
    ? {
        cards: parsedImport.cards.length,
        hidden: Array.isArray(parsedImport.hidden) ? parsedImport.hidden.length : 0,
        hiddenGlossary: Array.isArray(parsedImport.hiddenGlossary) ? parsedImport.hiddenGlossary.length : 0,
        exportedAt: parsedImport.exportedAt,
      }
    : null;

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="shrink-0 p-1 text-slate-400 transition-colors hover:text-white">
          <IconBack />
        </button>
        <div className="flex-1">
          <div className="text-xl font-bold text-white">Impostazioni</div>
          <div className="text-sm text-slate-400">Gestione salvataggio locale, elementi nascosti e strumenti di servizio.</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-200">Esporta progresso</div>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(JSON.stringify(exportPayload, null, 2));
                setCopiedSave(true);
                setCopyMessage(null);
                window.setTimeout(() => setCopiedSave(false), 1500);
              } catch {
                setCopyMessage("Copia non riuscita in questo browser.");
              }
            }}
            className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
          >
            {copiedSave ? "Copiato" : "Copia salvataggio"}
          </button>
        </div>
        <textarea
          readOnly
          value={JSON.stringify(exportPayload, null, 2)}
          className="min-h-[14rem] w-full rounded-lg border border-slate-700 bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-300 outline-none"
        />
        {copyMessage && <div className="mt-2 text-xs text-slate-500">{copyMessage}</div>}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
        <div className="mb-2 text-sm font-semibold text-slate-200">Importa progresso</div>
        <textarea
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          placeholder="Incolla qui il JSON esportato da un altro browser"
          className="min-h-[14rem] w-full rounded-lg border border-slate-700 bg-slate-900 p-3 font-mono text-xs leading-relaxed text-slate-300 outline-none placeholder:text-slate-500"
        />
        {preview ? (
          <div className="mt-3 rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-xs text-slate-400">
            <div className="font-semibold text-slate-300">Anteprima importazione</div>
            <div className="mt-1">
              {preview.cards} schede · {preview.hidden} domande nascoste · {preview.hiddenGlossary} voci glossario nascoste
            </div>
            <div className="mt-1">Esportato il: {preview.exportedAt || "data non disponibile"}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const result = onImport(parsedImport!, "overwrite");
                  setImportMessage(result.message);
                  if (result.ok) setImportText("");
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
              >
                Sovrascrivi
              </button>
              <button
                onClick={() => {
                  const result = onImport(parsedImport!, "merge");
                  setImportMessage(result.message);
                  if (result.ok) setImportText("");
                }}
                className="rounded-lg border border-slate-600 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-slate-700"
              >
                Unisci
              </button>
            </div>
          </div>
        ) : importText.trim() ? (
          <div className="mt-3 text-xs text-slate-500">Formato non valido: incolla un JSON di esportazione completo.</div>
        ) : null}
        {importMessage && <div className="mt-2 text-xs text-slate-400">{importMessage}</div>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="mb-2 text-sm font-semibold text-slate-200">Domande nascoste</div>
          <div className="mb-3 text-xs text-slate-500">{hiddenQuestions.length} elementi</div>
          <div className="max-h-72 space-y-2 overflow-auto">
            {hiddenQuestions.length === 0 && <div className="text-xs text-slate-500">Nessuna domanda nascosta.</div>}
            {hiddenQuestions.map((question) => (
              <div key={question.id} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                <div className="text-xs font-semibold text-slate-400">{question.id}</div>
                <div className="mt-1 text-sm text-slate-200">{getQuestionDisplayText(question.question)}</div>
                <button
                  onClick={() => onUnhideQuestion(question.id)}
                  className="mt-2 text-xs font-semibold text-blue-300 transition-colors hover:text-blue-200"
                >
                  Ripristina
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="mb-2 text-sm font-semibold text-slate-200">Voci glossario nascoste</div>
          <div className="mb-3 text-xs text-slate-500">{hiddenGlossaryEntries.length} elementi</div>
          <div className="max-h-72 space-y-2 overflow-auto">
            {hiddenGlossaryEntries.length === 0 && <div className="text-xs text-slate-500">Nessuna voce nascosta.</div>}
            {hiddenGlossaryEntries.map((entry) => (
              <div key={entry.id} className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                <div className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${entry.color}`}>
                  {entry.term}
                </div>
                <div className="mt-2 text-xs text-slate-400">{entry.fullForm || "Voce glossario"}</div>
                <button
                  onClick={() => onUnhideGlossary(entry.id)}
                  className="mt-2 text-xs font-semibold text-blue-300 transition-colors hover:text-blue-200"
                >
                  Ripristina
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onOpenDebug}
          className="text-xs text-slate-500 transition-colors hover:text-slate-300"
        >
          Apri debug avanzato
        </button>
      </div>
    </div>
  );
}

function SearchQuestionsView({
  hidden,
  onBack,
}: {
  hidden: Set<string>;
  onBack: () => void;
}) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const results = QUESTIONS.filter((question) => {
    if (!normalized) return true;
    const haystack = [
      question.question,
      ...question.options,
      question.explanation,
      question.topic,
      question.versionTag ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="shrink-0 p-1 text-slate-400 transition-colors hover:text-white">
          <IconBack />
        </button>
        <div className="flex-1">
          <div className="text-xl font-bold text-white">Cerca domande</div>
          <div className="text-sm text-slate-400">Ricerca in testo domanda, risposte, spiegazione e argomento.</div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cerca nel questionario"
          className="w-full bg-transparent px-2 py-1 text-sm text-slate-100 outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="text-xs text-slate-500">{results.length} risultati</div>

      <div className="space-y-2">
        {results.map((question) => (
          <div key={question.id} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${topicColor(question.topic)}`}>
                {question.topic}
              </span>
              {question.versionTag && (
                <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-200">
                  {question.versionTag}
                </span>
              )}
              {hidden.has(question.id) && (
                <span className="rounded-full bg-red-900/40 px-2 py-0.5 text-xs font-medium text-red-300">
                  Nascosta
                </span>
              )}
            </div>
            <div className="text-sm font-medium leading-relaxed text-slate-100">
              <GlossaryText text={getQuestionDisplayText(question.question)} />
            </div>
            <div className="mt-3 text-xs text-slate-500">Risposta corretta</div>
            <div className="mt-1 text-sm text-green-200">
              <GlossaryText text={question.options[question.correctIndex]} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GlossaryView({
  onBack,
  onStartAcronymQuiz,
  availableAcronymCount,
}: {
  onBack: () => void;
  onStartAcronymQuiz: () => void;
  availableAcronymCount: number;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(true);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<GlossaryEntry["category"] | "all">("all");

  const normalizedQuery = query.trim().toLowerCase();
  const sections = GLOSSARY_BY_CATEGORY.map(({ category, label, entries }) => ({
    category,
    label,
    entries: entries.filter((entry) => {
      if (activeCategory !== "all" && entry.category !== activeCategory) return false;
      if (!normalizedQuery) return true;
      return (
        entry.term.toLowerCase().includes(normalizedQuery) ||
        entry.definition.toLowerCase().includes(normalizedQuery) ||
        entry.fullForm?.toLowerCase().includes(normalizedQuery)
      );
    }),
  })).filter(({ entries }) => entries.length > 0);

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="shrink-0 p-1 text-slate-400 transition-colors hover:text-white">
          <IconBack />
        </button>
        <div className="flex-1">
          <div className="text-xl font-bold text-white">Glossario</div>
          <div className="text-sm text-slate-400">
            Termini tecnici, acronimi e gergo operativo da memorizzare.
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => setShowAll((current) => !current)}
          className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700"
        >
          {showAll ? "Nascondi tutte le definizioni" : "Mostra tutte le definizioni"}
        </button>
        <button
          onClick={onStartAcronymQuiz}
          disabled={availableAcronymCount === 0}
          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Quiz solo acronimi
        </button>
      </div>
      {availableAcronymCount === 0 && (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm text-slate-400">
          Non ci sono voci disponibili per il quiz acronimi: sono tutte nascoste.
        </div>
      )}

      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filtra sezioni</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === "all"
                ? "border-blue-600 bg-blue-900/40 text-blue-200"
                : "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
            }`}
          >
            Tutte
          </button>
          {GLOSSARY_BY_CATEGORY.map(({ category, label }) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeCategory === category
                  ? "border-blue-600 bg-blue-900/40 text-blue-200"
                  : "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {sections.map(({ category, label, entries }) => (
          <section key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-300">{label}</span>
              <span className="text-xs text-slate-500">{entries.length} voci</span>
            </div>
            <div className="space-y-2">
              {entries.map((entry) => {
                const isOpen = showAll || expanded.has(entry.id);
                return (
                  <button
                    key={entry.id}
                    onClick={() => toggle(entry.id)}
                    className="w-full rounded-xl border border-slate-700/70 bg-slate-800 p-4 text-left transition-colors hover:bg-slate-750"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:w-48">
                          <span className={`rounded-full px-4 py-2 text-base font-semibold ${entry.color}`}>
                            {entry.term}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          {entry.fullForm && (
                            <div className="rounded-lg bg-slate-900/70 p-3">
                              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                                Forma estesa
                              </div>
                              <div
                                className={`text-[0.7rem] text-slate-200 transition-all ${
                                  isOpen ? "" : "select-none blur-sm"
                                }`}
                              >
                                {entry.fullForm}
                              </div>
                            </div>
                          )}
                          <div className="rounded-lg bg-slate-900/70 p-3">
                            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                              Definizione
                            </div>
                            <div
                              className={`text-[0.7rem] leading-relaxed text-slate-300 transition-all ${
                                isOpen ? "" : "select-none blur-sm"
                              }`}
                            >
                              {entry.definition}
                            </div>
                          </div>
                        </div>
                      </div>
                      <IconChevronDown open={isOpen} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        {sections.length === 0 && (
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-sm text-slate-400">
            Nessun termine trovato per “{query}”.
          </div>
        )}
      </div>

      <div className="fixed bottom-5 right-5 z-30 flex items-center justify-end">
        {searchOpen && (
          <div className="mr-3 w-[min(20rem,calc(100vw-6rem))] rounded-full border border-slate-700 bg-slate-800/95 p-2 shadow-2xl backdrop-blur">
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cerca nel glossario"
              className="w-full bg-transparent px-3 py-1.5 text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
          </div>
        )}
        <button
          onClick={() => {
            if (searchOpen && query) {
              setQuery("");
              return;
            }
            setSearchOpen((current) => !current);
          }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl transition-colors hover:bg-blue-500"
          aria-label={searchOpen ? (query ? "Pulisci ricerca" : "Chiudi ricerca") : "Apri ricerca"}
          title={searchOpen ? (query ? "Pulisci ricerca" : "Chiudi ricerca") : "Apri ricerca"}
        >
          {searchOpen && query ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
              <circle cx="11" cy="11" r="6" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function TopicDetail({
  topic,
  cards,
  hidden,
  onBack,
  onStartFocusedQuiz,
}: {
  topic: string;
  cards: CardState[];
  hidden: Set<string>;
  onBack: () => void;
  onStartFocusedQuiz: () => void;
}) {
  const questions = QUESTIONS.filter((question) => question.topic === topic && !hidden.has(question.id));
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const dueCount = getDueCards(cards, hidden, topic).length;
  const hardestQuestions = questions
    .map((question) => {
      const card = cards.find((candidate) => candidate.questionId === question.id);
      const totalReviews = card?.totalReviews ?? 0;
      const accuracy = totalReviews === 0 ? null : (card!.correctReviews / totalReviews) * 100;
      const repetitions = card?.repetitions ?? 0;
      const struggleScore =
        totalReviews === 0
          ? -1
          : (100 - (accuracy ?? 0)) * 0.7 + Math.max(0, 3 - repetitions) * 10 + (isDue(card!) ? 8 : 0);

      return { question, card, accuracy, struggleScore };
    })
    .filter((item) => (item.card?.totalReviews ?? 0) > 0)
    .sort((a, b) => b.struggleScore - a.struggleScore)
    .slice(0, 3);

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="shrink-0 p-1 text-slate-400 transition-colors hover:text-white">
          <IconBack />
        </button>
        <div className="min-w-0 flex-1">
          <span className={`rounded-full px-2 py-0.5 text-sm font-medium ${topicColor(topic)}`}>{topic}</span>
          <div className="mt-1 text-xs text-slate-500">{questions.length} domande</div>
        </div>
      </div>

      <button
        onClick={onStartFocusedQuiz}
        className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-all hover:bg-blue-500 active:bg-blue-700"
      >
        {dueCount > 0
          ? `Quiz su questo argomento · ${dueCount} da ripassare`
          : "Quiz su questo argomento · tutte le domande"}
      </button>

      {hardestQuestions.length > 0 && (
        <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-200">Domande piu difficili per te</div>
            <div className="text-xs text-slate-500">Basato sul tuo storico</div>
          </div>
          <div className="space-y-2">
            {hardestQuestions.map(({ question, accuracy, card }) => (
              <button
                key={question.id}
                onClick={() => toggle(question.id)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/40 p-3 text-left transition-colors hover:bg-slate-700/60"
              >
                <div className="text-sm text-slate-100">
                  <GlossaryText text={getQuestionDisplayText(question.question)} />
                </div>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>Precisione: {Math.round(accuracy ?? 0)}%</span>
                  <span>Ripassi: {card?.repetitions ?? 0}</span>
                  <span>Risposte: {card?.totalReviews ?? 0}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {questions.map((question) => {
          const card = cards.find((candidate) => candidate.questionId === question.id);
          const isOpen = expanded.has(question.id);
          const mastered = card && card.repetitions >= 3;

          return (
            <button
              key={question.id}
              onClick={() => toggle(question.id)}
              className="w-full space-y-3 rounded-xl border border-slate-700/50 bg-slate-800 p-4 text-left transition-colors hover:bg-slate-750"
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 shrink-0 text-sm font-bold ${
                    mastered ? "text-green-400" : "text-slate-600"
                  }`}
                >
                  {mastered ? "✓" : "○"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-slate-200">
                    <GlossaryText text={getQuestionDisplayText(question.question)} />
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {card ? formatNextReview(card) : "nuova"}
                  </p>
                </div>
                <IconChevronDown open={isOpen} />
              </div>

              {isOpen && (
                <div className="space-y-3 border-t border-slate-700 pt-2">
                  {question.imageUrl && (
                    <div className="overflow-hidden rounded-lg border border-slate-600">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={question.imageUrl}
                        alt="Immagine domanda"
                        className="max-h-48 w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="rounded-lg border border-green-700/50 bg-green-900/30 p-3">
                    <p className="mb-1 text-xs font-semibold text-green-300">Risposta corretta</p>
                    <p className="text-sm text-green-200">
                      <GlossaryText text={question.options[question.correctIndex]} />
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-900/50 p-3">
                    <ExplanationText text={question.explanation} size="xs" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function QuizCard({
  card,
  onRate,
  onHide,
  onResetCard,
  onBackToMenu,
  index,
  total,
  reinforcementMode = false,
}: {
  card: CardState;
  onRate: (rating: number) => void;
  onHide: () => void;
  onResetCard: () => void;
  onBackToMenu: () => void;
  index: number;
  total: number;
  reinforcementMode?: boolean;
}) {
  const question = getQuestion(card.questionId);
  const [shuffled] = useState(() => shuffleOptions(question));
  const [selected, setSelected] = useState<number | null>(null);
  const [cardAction, setCardAction] = useState<null | "hide" | "reset">(null);
  const revealed = selected !== null;

  const correctShuffledIndex = shuffled.findIndex(
    (option) => option.originalIndex === question.correctIndex
  );

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBackToMenu}
          className="shrink-0 p-1 text-slate-400 transition-colors hover:text-white"
          title="Torna al menu"
        >
          <IconBack />
        </button>
        <div className="h-1.5 flex-1 rounded-full bg-slate-700">
          <div
            className="h-1.5 rounded-full bg-blue-500 transition-all"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-xs tabular-nums text-slate-500">
          {index}/{total}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${topicColor(question.topic)}`}>
          {question.topic}
        </span>
        {reinforcementMode && (
          <span className="rounded-full bg-orange-900/40 px-2 py-0.5 text-xs font-medium text-orange-300">
            Rinforzo
          </span>
        )}
        {isV2Question(question) && (
          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-200">
            v2
          </span>
        )}
      </div>

      {question.imageUrl && (
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.imageUrl}
            alt="Immagine della domanda"
            className="max-h-64 w-full object-contain"
          />
        </div>
      )}

      <div className="text-lg font-medium leading-snug text-white">
        <GlossaryText text={getQuestionDisplayText(question.question)} interactive={revealed} />
      </div>

      <div className="space-y-2">
        {shuffled.map((option, optionIndex) => {
          const isCorrect = optionIndex === correctShuffledIndex;
          const isSelected = optionIndex === selected;
          let className =
            "w-full rounded-xl border px-4 py-3 text-left text-sm leading-snug transition-all ";
          if (!revealed) {
            className += "cursor-pointer border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700";
          } else if (isCorrect) {
            className += "border-green-500 bg-green-900/40 text-green-200";
          } else if (isSelected) {
            className += "border-red-500 bg-red-900/40 text-red-200";
          } else {
            className += "border-slate-700 bg-slate-800/50 text-slate-500";
          }

          return (
            <button
              key={optionIndex}
              className={className}
              onClick={() => {
                if (!revealed) setSelected(optionIndex);
              }}
            >
              <span className="mr-2 text-slate-500">{["A", "B", "C"][optionIndex]}.</span>
              <GlossaryText text={option.text} interactive={revealed} />
              {revealed && isCorrect && <span className="ml-2 text-green-400">✓</span>}
              {revealed && isSelected && !isCorrect && <span className="ml-2 text-red-400">✗</span>}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-sm leading-relaxed text-slate-300">
          <div className="mb-2 text-sm font-semibold text-slate-100">Spiegazione</div>
          <ExplanationText text={question.explanation} interactive={revealed} size="sm" />
        </div>
      )}

      {revealed && (
        <div className="sticky bottom-0 z-20 -mx-4 border-t border-slate-700 bg-slate-950/95 px-4 pb-4 pt-3 backdrop-blur">
          <div className="space-y-2">
          <div className="text-center text-xs text-slate-500">Come ti è sembrata questa domanda?</div>
          <div className="grid grid-cols-4 gap-2">
            {[RATING_AGAIN, RATING_HARD, RATING_GOOD, RATING_EASY].map((rating) => (
              <button
                key={rating}
                onClick={() => onRate(rating)}
                className={`rounded-xl py-3 text-sm font-semibold text-white transition-all ${ratingColor(
                  rating
                )}`}
              >
                <div>{ratingLabel(rating)}</div>
                <div className="mt-0.5 text-xs opacity-70">{ratingIntervalHint(card, rating)}</div>
              </button>
            ))}
          </div>
        </div>
        </div>
      )}

      {revealed && (
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-700">
          <div className="border-b border-slate-700 bg-slate-800/80 px-4 py-2">
            <p className="text-center text-xs font-medium uppercase tracking-wide text-slate-500">
              Gestione domanda
            </p>
          </div>

          <div className="p-4">
            {cardAction === "reset" ? (
              <ConfirmRow
                message="Azzerare i progressi di questa domanda?"
                confirmLabel="Sì, azzera"
                confirmColor="text-orange-400 hover:text-orange-300"
                onConfirm={() => {
                  onResetCard();
                  setCardAction(null);
                }}
                onCancel={() => setCardAction(null)}
              />
            ) : (
              <button
                onClick={() => setCardAction("reset")}
                className="w-full py-1 text-center text-xs text-slate-400 transition-colors hover:text-slate-200"
              >
                Reimposta progressi domanda
              </button>
            )}
          </div>

          <div className="border-t border-slate-700 p-4">
            {cardAction === "hide" ? (
              <ConfirmRow
                message="Nascondere questa domanda per sempre?"
                confirmLabel="Sì, nascondi"
                confirmColor="text-red-400 hover:text-red-300"
                onConfirm={() => {
                  onHide();
                  setCardAction(null);
                }}
                onCancel={() => setCardAction(null)}
              />
            ) : (
              <button
                onClick={() => setCardAction("hide")}
                className="w-full py-1 text-center text-xs text-slate-500 transition-colors hover:text-red-400"
              >
                Nascondi questa domanda
              </button>
            )}
          </div>
        </div>
      )}

      {!revealed && <p className="text-center text-xs text-slate-600">Seleziona una risposta per continuare</p>}
    </div>
  );
}

function AcronymQuizCard({
  item,
  index,
  total,
  onAnswer,
  onHide,
  onBack,
}: {
  item: AcronymQuizItem;
  index: number;
  total: number;
  onAnswer: (rating: number) => void;
  onHide: () => void;
  onBack: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [confirmHide, setConfirmHide] = useState(false);

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="shrink-0 p-1 text-slate-400 transition-colors hover:text-white">
          <IconBack />
        </button>
        <div className="h-1.5 flex-1 rounded-full bg-slate-700">
          <div
            className="h-1.5 rounded-full bg-blue-500 transition-all"
            style={{ width: `${(index / total) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-xs tabular-nums text-slate-500">
          {index}/{total}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.entry.color}`}>
          {item.entry.term}
        </span>
        <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs font-medium text-slate-300">
          Acronimo
        </span>
      </div>

      <div className="text-lg font-medium leading-snug text-white">
        Cosa significa l&apos;acronimo <GlossaryText text={item.entry.term} interactive={revealed} />?
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-800">
        {!revealed ? (
          <div className="space-y-5 p-6 text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Fronte</div>
            <div className="space-y-3">
              <div className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${item.entry.color}`}>
                {item.entry.term}
              </div>
              <div className="text-3xl font-bold tracking-wide text-white">{item.entry.term}</div>
            </div>
            <button
              onClick={() => setRevealed(true)}
              className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Rivela retro
            </button>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            <div className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Retro</div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Forma estesa</div>
              <div className="text-lg font-semibold text-slate-100">
                <GlossaryText text={item.entry.fullForm} />
              </div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Definizione</div>
              <div className="text-sm leading-relaxed text-slate-300">
                <GlossaryText text={item.entry.definition} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-center text-xs text-slate-500">Quanto lo ricordavi?</div>
              <div className="grid grid-cols-4 gap-2">
                {[RATING_AGAIN, RATING_HARD, RATING_GOOD, RATING_EASY].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => onAnswer(rating)}
                    className={`rounded-xl py-3 text-sm font-semibold text-white transition-all ${ratingColor(
                      rating
                    )}`}
                  >
                    <div>{ratingLabel(rating)}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              {confirmHide ? (
                <ConfirmRow
                  message="Nascondere questa voce del glossario?"
                  confirmLabel="Sì, nascondi"
                  confirmColor="text-red-400 hover:text-red-300"
                  onConfirm={() => {
                    onHide();
                    setConfirmHide(false);
                  }}
                  onCancel={() => setConfirmHide(false)}
                />
              ) : (
                <button
                  onClick={() => setConfirmHide(true)}
                  className="w-full py-1 text-center text-xs text-slate-500 transition-colors hover:text-red-400"
                >
                  Nascondi questa voce
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {!revealed && <p className="text-center text-xs text-slate-600">Prova a ricordare il significato prima di girare la carta</p>}
    </div>
  );
}

function RisultatoSessione({
  sessionCards,
  ratings,
  remainingCount,
  onContinue,
  onDone,
}: {
  sessionCards: CardState[];
  ratings: number[];
  remainingCount: number;
  onContinue: () => void;
  onDone: () => void;
}) {
  const total = sessionCards.length;
  const correct = ratings.filter((rating) => rating >= RATING_HARD).length;
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12 text-center">
      <div className="relative inline-flex items-center justify-center">
        <ProgressRing pct={pct} />
        <span className="absolute text-2xl font-bold text-white">{pct}%</span>
      </div>
      <div className="space-y-1">
        <div className="text-xl font-bold text-white">Sessione completata!</div>
        <div className="text-sm text-slate-400">
          {correct} corrette su {total}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Di nuovo", count: ratings.filter((rating) => rating === RATING_AGAIN).length, color: "text-red-400" },
          { label: "Difficile", count: ratings.filter((rating) => rating === RATING_HARD).length, color: "text-orange-400" },
          { label: "Bene", count: ratings.filter((rating) => rating === RATING_GOOD).length, color: "text-blue-400" },
          { label: "Facile", count: ratings.filter((rating) => rating === RATING_EASY).length, color: "text-green-400" },
        ].map(({ label, count, color }) => (
          <div key={label} className="rounded-xl bg-slate-800 p-3">
            <div className={`text-2xl font-bold ${color}`}>{count}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>
      {remainingCount > 0 ? (
        <div className="space-y-3">
          <div className="text-sm text-slate-400">
            Pool rimanente: {remainingCount} {remainingCount === 1 ? "domanda" : "domande"}
          </div>
          <button
            onClick={onContinue}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-4 text-lg font-semibold text-slate-100 transition-all hover:bg-slate-700"
          >
            Altre 20 domande
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-sm text-slate-400">
          Nessun&apos;altra domanda disponibile nel pool rimanente.
        </div>
      )}
      <button
        onClick={onDone}
        className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-500"
      >
        Torna alla dashboard
      </button>
    </div>
  );
}

function formatExamTime(secondsRemaining: number): string {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function ExamQuizCard({
  item,
  index,
  total,
  selectedIndex,
  onSelect,
  onNext,
  onBack,
  secondsRemaining,
}: {
  item: ExamQuestionState;
  index: number;
  total: number;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  onNext: () => void;
  onBack: () => void;
  secondsRemaining: number;
}) {
  const progressPct = ((index - 1) / total) * 100;
  const { question, shuffled } = item;

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="shrink-0 p-1 text-slate-400 transition-colors hover:text-white"
          title="Interrompi simulazione"
        >
          <IconBack />
        </button>
        <div className="h-1.5 flex-1 rounded-full bg-slate-700">
          <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <span className="shrink-0 text-xs tabular-nums text-slate-500">
          {index}/{total}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span />
        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold tabular-nums text-white">
          {formatExamTime(secondsRemaining)}
        </span>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4 text-sm text-slate-300">
        20 domande · 25 minuti · superi con almeno 18 corrette. Questa modalità non modifica il progresso normale.
      </div>

      {question.imageUrl && (
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={question.imageUrl} alt="Immagine della domanda" className="max-h-64 w-full object-contain" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-emerald-900/40 px-3 py-1 text-xs font-semibold text-emerald-300">
          Simulazione Esame ADC
        </span>
        {isV2Question(question) && (
          <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-200">
            v2
          </span>
        )}
      </div>

      <div className="text-lg font-medium leading-snug text-white">{getQuestionDisplayText(question.question)}</div>

      <div className="space-y-2">
        {shuffled.map((option, optionIndex) => {
          const isSelected = selectedIndex === optionIndex;
          return (
            <button
              key={optionIndex}
              onClick={() => onSelect(optionIndex)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm leading-snug transition-all ${
                isSelected
                  ? "border-emerald-500 bg-emerald-900/30 text-emerald-100"
                  : "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              <span className="mr-2 text-slate-500">{["A", "B", "C"][optionIndex]}.</span>
              {option.text}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={selectedIndex === null}
        className="w-full rounded-xl bg-emerald-600 py-4 text-lg font-semibold text-white transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {index >= total ? "Concludi simulazione" : "Domanda successiva"}
      </button>

      {selectedIndex === null && (
        <p className="text-center text-xs text-slate-600">Seleziona una risposta per continuare</p>
      )}
    </div>
  );
}

function ExamResultSession({
  answers,
  examQueue,
  cards,
  totalQuestions,
  timedOut,
  onRetakeSame,
  onNewSimulation,
  onDone,
}: {
  answers: ExamAnswer[];
  examQueue: ExamQuestionState[];
  cards: CardState[];
  totalQuestions: number;
  timedOut: boolean;
  onRetakeSame: () => void;
  onNewSimulation: () => void;
  onDone: () => void;
}) {
  const correct = answers.filter((answer) => answer.correct).length;
  const pct = totalQuestions === 0 ? 0 : Math.round((correct / totalQuestions) * 100);
  const passed = correct >= 18;
  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer]));
  const [filter, setFilter] = useState<"all" | "hardest">("all");
  const hardestQuestionId =
    examQueue
      .map((item) => {
        const card = cards.find((candidate) => candidate.questionId === item.question.id);
        const totalReviews = card?.totalReviews ?? 0;
        const accuracy = totalReviews === 0 ? 0 : card!.correctReviews / totalReviews;
        const struggleScore =
          totalReviews === 0
            ? -1
            : (1 - accuracy) * 100 + Math.max(0, 3 - (card?.repetitions ?? 0)) * 10;
        return { questionId: item.question.id, struggleScore };
      })
      .sort((a, b) => b.struggleScore - a.struggleScore)[0]?.questionId ?? null;
  const reviewItems =
    filter === "hardest" && hardestQuestionId
      ? examQueue.filter((item) => item.question.id === hardestQuestionId)
      : examQueue;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12 text-center">
      <div className="relative inline-flex items-center justify-center">
        <ProgressRing pct={pct} />
        <span className="absolute text-2xl font-bold text-white">{correct}/20</span>
      </div>
      <div className="space-y-1">
        <div className="text-xl font-bold text-white">
          {passed ? "Simulazione superata" : "Simulazione non superata"}
        </div>
        <div className="text-sm text-slate-400">
          {passed ? "Hai raggiunto la soglia minima di 18 risposte corrette." : "Servono almeno 18 risposte corrette su 20."}
        </div>
        {timedOut && <div className="text-sm text-amber-400">Tempo scaduto.</div>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-800 p-3">
          <div className={`text-2xl font-bold ${passed ? "text-green-400" : "text-red-400"}`}>
            {passed ? "Idoneo" : "Non idoneo"}
          </div>
          <div className="text-xs text-slate-400">Esito</div>
        </div>
        <div className="rounded-xl bg-slate-800 p-3">
          <div className="text-2xl font-bold text-blue-400">{pct}%</div>
          <div className="text-xs text-slate-400">Precisione</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onRetakeSame}
          className="rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700"
        >
          Rifai stesso set
        </button>
        <button
          onClick={onNewSimulation}
          className="rounded-xl border border-emerald-700/60 bg-emerald-900/30 py-3 text-sm font-semibold text-emerald-200 transition-colors hover:bg-emerald-900/50"
        >
          Nuova simulazione
        </button>
      </div>
      <div className="space-y-3 text-left">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-300">Riepilogo domande</div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filter === "all"
                  ? "bg-blue-900/40 text-blue-200"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Tutte
            </button>
            <button
              onClick={() => setFilter("hardest")}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filter === "hardest"
                  ? "bg-blue-900/40 text-blue-200"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              Piu difficile per te
            </button>
          </div>
        </div>
        {reviewItems.map((item, index) => {
          const answer = answerMap.get(item.question.id);
          const selectedText =
            answer && item.question.options[answer.selectedIndex]
              ? item.question.options[answer.selectedIndex]
              : null;
          const correctText = item.question.options[item.question.correctIndex];

          return (
            <div key={item.question.id} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Domanda {examQueue.findIndex((candidate) => candidate.question.id === item.question.id) + 1}
                  </div>
                  <div className="text-sm leading-relaxed text-slate-100">
                    <GlossaryText text={getQuestionDisplayText(item.question.question)} />
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    !answer
                      ? "bg-slate-700 text-slate-300"
                      : answer.correct
                        ? "bg-green-900/40 text-green-300"
                        : "bg-red-900/40 text-red-300"
                  }`}
                >
                  {!answer ? "Non risposta" : answer.correct ? "Corretta" : "Errata"}
                </span>
              </div>

              <div className="space-y-2">
                <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Tua risposta
                  </div>
                  <div className={`${answer?.correct ? "text-green-200" : "text-red-200"} text-sm leading-relaxed`}>
                    {selectedText ? <GlossaryText text={selectedText} /> : <span className="text-slate-500">Nessuna risposta</span>}
                  </div>
                </div>

                {(!answer || !answer.correct) && (
                  <div className="rounded-lg border border-green-800/60 bg-green-900/20 p-3">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-green-400">
                      Risposta corretta
                    </div>
                    <div className="text-sm leading-relaxed text-green-200">
                      <GlossaryText text={correctText} />
                    </div>
                  </div>
                )}

                <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3">
                  <ExplanationText text={item.question.explanation} size="xs" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={onDone}
        className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-500"
      >
        Torna alla dashboard
      </button>
    </div>
  );
}

function AcronymResultSession({
  ratings,
  onDone,
}: {
  ratings: number[];
  onDone: () => void;
}) {
  const total = ratings.length;
  const correct = ratings.filter((rating) => rating >= RATING_HARD).length;
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12 text-center">
      <div className="relative inline-flex items-center justify-center">
        <ProgressRing pct={pct} />
        <span className="absolute text-2xl font-bold text-white">{pct}%</span>
      </div>
      <div className="space-y-1">
        <div className="text-xl font-bold text-white">Quiz acronimi completato</div>
        <div className="text-sm text-slate-400">
          {correct} corrette su {total}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Di nuovo", count: ratings.filter((rating) => rating === RATING_AGAIN).length, color: "text-red-400" },
          { label: "Difficile", count: ratings.filter((rating) => rating === RATING_HARD).length, color: "text-orange-400" },
          { label: "Bene", count: ratings.filter((rating) => rating === RATING_GOOD).length, color: "text-blue-400" },
          { label: "Facile", count: ratings.filter((rating) => rating === RATING_EASY).length, color: "text-green-400" },
        ].map(({ label, count, color }) => (
          <div key={label} className="rounded-xl bg-slate-800 p-3">
            <div className={`text-2xl font-bold ${color}`}>{count}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>
      <button
        onClick={onDone}
        className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-500"
      >
        Torna al glossario
      </button>
    </div>
  );
}

export default function Home() {
  const [cards, setCards] = useState<CardState[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>("dashboard");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [queue, setQueue] = useState<CardState[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [sessionRatings, setSessionRatings] = useState<number[]>([]);
  const [sessionCards, setSessionCards] = useState<CardState[]>([]);
  const [quizChainExcludedIds, setQuizChainExcludedIds] = useState<string[]>([]);
  const [acronymQueue, setAcronymQueue] = useState<AcronymQuizItem[]>([]);
  const [acronymIndex, setAcronymIndex] = useState(0);
  const [acronymRatings, setAcronymRatings] = useState<number[]>([]);
  const [hiddenGlossary, setHiddenGlossary] = useState<Set<string>>(new Set());
  const [gamification, setGamification] = useState<GamificationStats>(loadGamificationStats());
  const [examQueue, setExamQueue] = useState<ExamQuestionState[]>([]);
  const [examIndex, setExamIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState<ExamAnswer[]>([]);
  const [examSelectedIndex, setExamSelectedIndex] = useState<number | null>(null);
  const [examSecondsRemaining, setExamSecondsRemaining] = useState(25 * 60);
  const [examTimedOut, setExamTimedOut] = useState(false);
  const availableAcronymCount = ACRONYM_ENTRIES.filter((entry) => !hiddenGlossary.has(entry.id)).length;

  useEffect(() => {
    setCards(loadCards());
    setHidden(loadHidden());
    setHiddenGlossary(loadHiddenGlossary());
    setGamification(loadGamificationStats());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (view === "quiz" || view === "exam_quiz" || view === "acronym_quiz") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [view, queueIndex, examIndex, acronymIndex]);

  const startQuiz = useCallback(
    (topic?: string, excludedQuestionIds: Iterable<string> = []) => {
      const excluded = new Set(excludedQuestionIds);
      const { batch, updatedCards } = buildQuizBatch(cards, hidden, topic, excluded);
      if (batch.length === 0) return;
      setQueue(batch);
      setQueueIndex(0);
      setSessionRatings([]);
      setSessionCards([]);
      if (updatedCards !== cards) {
        setCards(updatedCards);
        saveCards(updatedCards);
      }
      setView("quiz");
    },
    [cards, hidden]
  );

  const startAcronymQuiz = useCallback(() => {
    const items = shuffleArray(ACRONYM_ENTRIES.filter((entry) => !hiddenGlossary.has(entry.id))).map((entry) => {
      const distractors = shuffleArray(
        ACRONYM_ENTRIES.filter((candidate) => candidate.id !== entry.id && !hiddenGlossary.has(candidate.id)).map(
          (candidate) => candidate.fullForm
        )
      ).slice(0, 2);

      return {
        entry,
        options: shuffleArray([entry.fullForm, ...distractors]),
      };
    });

    setAcronymQueue(items);
    setAcronymIndex(0);
    setAcronymRatings([]);
    setView("acronym_quiz");
  }, [hiddenGlossary]);

  const finishExamSimulation = useCallback((timedOut = false, finalAnswers?: ExamAnswer[]) => {
    const answersToUse = finalAnswers ?? examAnswers;
    const correct = answersToUse.filter((answer) => answer.correct).length;
    const passed = correct >= 18;
    setGamification((current) =>
      recordStudyActivity(current, {
        xp: passed ? 90 : 45,
        sessionIncrement: 1,
        examScore: correct,
        passedExam: passed,
      })
    );
    setExamTimedOut(timedOut);
    setView("exam_result");
  }, [examAnswers]);

  const startExamSimulation = useCallback(() => {
    const pool = shuffleArray(QUESTIONS)
      .slice(0, 20)
      .map((question) => ({ question, shuffled: shuffleOptions(question) }));
    setExamQueue(pool);
    setExamIndex(0);
    setExamAnswers([]);
    setExamSelectedIndex(null);
    setExamSecondsRemaining(25 * 60);
    setExamTimedOut(false);
    setSelectedTopic(null);
    setView("exam_quiz");
  }, []);

  const handleRate = useCallback(
    (rating: number) => {
      const currentCard = queue[queueIndex];
      const updatedCard = applyRating(currentCard, rating);
      const newCards = cards.map((card) =>
        card.questionId === updatedCard.questionId ? updatedCard : card
      );
      setCards(newCards);
      saveCards(newCards);
      setGamification((current) =>
        recordStudyActivity(current, {
          xp: rating >= RATING_HARD ? 12 : 6,
          sessionIncrement: queueIndex === 0 ? 1 : 0,
        })
      );
      const nextRatings = [...sessionRatings, rating];
      const nextSessionCards = [...sessionCards, currentCard];
      setSessionRatings(nextRatings);
      setSessionCards(nextSessionCards);

      const shouldRequeue = rating <= RATING_HARD;
      if (shouldRequeue) {
        const delay = rating === RATING_AGAIN ? 2 : 4;
        const insertAt = Math.min(queue.length, queueIndex + 1 + delay);
        const nextQueue = [...queue];
        nextQueue.splice(insertAt, 0, updatedCard);
        setQueue(nextQueue);
        setQueueIndex((current) => current + 1);
        return;
      }

      if (queueIndex + 1 >= queue.length) {
        setView("result");
      } else {
        setQueueIndex((current) => current + 1);
      }
    },
    [cards, queue, queueIndex, sessionCards, sessionRatings]
  );

  const handleHide = useCallback(() => {
    const id = queue[queueIndex]?.questionId;
    if (!id) return;
    hideQuestion(id);
    const nextHidden = new Set(hidden);
    nextHidden.add(id);
    setHidden(nextHidden);
    saveHidden(nextHidden);
    if (queueIndex + 1 >= queue.length) {
      if (sessionCards.length === 0) setView("dashboard");
      else setView("result");
    } else {
      setQueueIndex((current) => current + 1);
    }
  }, [hidden, queue, queueIndex, sessionCards.length]);

  const handleResetCard = useCallback(() => {
    const id = queue[queueIndex]?.questionId;
    if (!id) return;
    const fresh = createCardState(id);
    const newCards = cards.map((card) => (card.questionId === id ? fresh : card));
    setCards(newCards);
    saveCards(newCards);
    setQueue((current) => current.map((card, index) => (index === queueIndex ? fresh : card)));
  }, [cards, queue, queueIndex]);

  const remainingQuizPoolCount = getQuizPoolCandidates(
    cards,
    hidden,
    selectedTopic ?? undefined,
    new Set([...quizChainExcludedIds, ...queue.map((card) => card.questionId)])
  ).length;

  const continueQuizWithNextBatch = useCallback(() => {
    const nextExcluded = [...quizChainExcludedIds, ...queue.map((card) => card.questionId)];
    setQuizChainExcludedIds(nextExcluded);
    startQuiz(selectedTopic ?? undefined, nextExcluded);
  }, [queue, quizChainExcludedIds, selectedTopic, startQuiz]);

  const handleAcronymAnswer = useCallback(
    (rating: number) => {
      setGamification((current) =>
        recordStudyActivity(current, {
          xp: rating >= RATING_HARD ? 8 : 4,
          sessionIncrement: acronymIndex === 0 ? 1 : 0,
        })
      );
      setAcronymRatings((current) => [...current, rating]);
      if (acronymIndex + 1 >= acronymQueue.length) setView("acronym_result");
      else setAcronymIndex((current) => current + 1);
    },
    [acronymIndex, acronymQueue.length]
  );

  const handleHideGlossary = useCallback(() => {
    const entryId = acronymQueue[acronymIndex]?.entry.id;
    if (!entryId) return;
    hideGlossaryEntry(entryId);
    const nextHidden = new Set(hiddenGlossary);
    nextHidden.add(entryId);
    setHiddenGlossary(nextHidden);
    saveHiddenGlossary(nextHidden);

    if (acronymIndex + 1 >= acronymQueue.length) {
      if (acronymRatings.length === 0) setView("glossary");
      else setView("acronym_result");
    } else {
      setAcronymIndex((current) => current + 1);
    }
  }, [acronymIndex, acronymQueue, acronymRatings.length, hiddenGlossary]);

  const handleImportSave = useCallback(
    (payload: SaveTransferPayload, mode: ImportMode) => {
      if (!payload || payload.version !== 1 || !Array.isArray(payload.cards)) {
        return { ok: false, message: "Salvataggio non riconosciuto o versione non supportata." };
      }

      const importedCards = mergeCardsWithQuestionBank(payload.cards);
      const importedHidden = new Set(Array.isArray(payload.hidden) ? payload.hidden : []);
      const importedHiddenGlossary = new Set(Array.isArray(payload.hiddenGlossary) ? payload.hiddenGlossary : []);
      const nextCards =
        mode === "overwrite" ? importedCards : mergeImportedCards(cards, importedCards);
      const nextHidden =
        mode === "overwrite" ? importedHidden : new Set([...hidden, ...importedHidden]);
      const nextHiddenGlossary =
        mode === "overwrite"
          ? importedHiddenGlossary
          : new Set([...hiddenGlossary, ...importedHiddenGlossary]);
      const nextGamification =
        mode === "overwrite"
          ? { ...loadGamificationStats(), ...(payload.gamification ?? {}) }
          : mergeGamificationStats(gamification, payload.gamification);

      setCards(nextCards);
      setHidden(nextHidden);
      setHiddenGlossary(nextHiddenGlossary);
      setGamification(nextGamification);

      saveCards(nextCards);
      saveHidden(nextHidden);
      saveHiddenGlossary(nextHiddenGlossary);
      saveGamificationStats(nextGamification);

      return {
        ok: true,
        message: mode === "overwrite" ? "Salvataggio sovrascritto correttamente." : "Salvataggio unito correttamente.",
      };
    },
    [cards, gamification, hidden, hiddenGlossary]
  );

  const handleUnhideQuestion = useCallback((id: string) => {
    unhideQuestion(id);
    setHidden((current) => {
      const next = new Set(current);
      next.delete(id);
      saveHidden(next);
      return next;
    });
  }, []);

  const handleUnhideGlossary = useCallback((id: string) => {
    unhideGlossaryEntry(id);
    setHiddenGlossary((current) => {
      const next = new Set(current);
      next.delete(id);
      saveHiddenGlossary(next);
      return next;
    });
  }, []);

  const restartSameExamSimulation = useCallback(() => {
    if (examQueue.length === 0) return;
    setExamIndex(0);
    setExamAnswers([]);
    setExamSelectedIndex(null);
    setExamSecondsRemaining(25 * 60);
    setExamTimedOut(false);
    setView("exam_quiz");
  }, [examQueue.length]);

  const handleExamNext = useCallback(() => {
    const question = examQueue[examIndex];
    if (!question || examSelectedIndex === null) return;

    const selectedOption = question.shuffled[examSelectedIndex];
    const correct = selectedOption.originalIndex === question.question.correctIndex;

    const nextAnswer = {
      questionId: question.question.id,
      selectedIndex: selectedOption.originalIndex,
      correct,
    };
    const nextAnswers = [...examAnswers, nextAnswer];
    setExamAnswers(nextAnswers);

    if (examIndex + 1 >= examQueue.length) {
      finishExamSimulation(false, nextAnswers);
      return;
    }

    setExamIndex((current) => current + 1);
    setExamSelectedIndex(null);
  }, [examAnswers, examIndex, examQueue, examSelectedIndex, finishExamSimulation]);

  useEffect(() => {
    if (view !== "exam_quiz") return;
    if (examSecondsRemaining <= 0) {
      finishExamSimulation(true);
      return;
    }

    const timer = window.setInterval(() => {
      setExamSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [examSecondsRemaining, finishExamSimulation, view]);

  if (cards.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-sm text-slate-400">Caricamento...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {view === "dashboard" && (
        <Dashboard
          cards={cards}
          hidden={hidden}
          onStartQuiz={() => {
            setSelectedTopic(null);
            setQuizChainExcludedIds([]);
            startQuiz();
          }}
          onStartExamSimulation={startExamSimulation}
          onOpenTopic={(topic) => {
            setSelectedTopic(topic);
            setView("topic_detail");
          }}
          onOpenGlossary={() => setView("glossary")}
          onOpenSettings={() => setView("settings")}
          onOpenSearch={() => setView("search")}
          onReset={() => {
            const fresh = resetCards();
            setCards(fresh);
            setHidden(new Set());
            setHiddenGlossary(new Set());
            setGamification(loadGamificationStats());
            setQuizChainExcludedIds([]);
            setSelectedTopic(null);
            setView("dashboard");
          }}
        />
      )}

      {view === "debug" && (
        <DebugView
          hidden={hidden}
          onBack={() => setView("dashboard")}
        />
      )}

      {view === "settings" && (
        <SettingsView
          cards={cards}
          hidden={hidden}
          hiddenGlossary={hiddenGlossary}
          gamification={gamification}
          onImport={handleImportSave}
          onUnhideQuestion={handleUnhideQuestion}
          onUnhideGlossary={handleUnhideGlossary}
          onOpenDebug={() => setView("debug")}
          onBack={() => setView("dashboard")}
        />
      )}

      {view === "search" && <SearchQuestionsView hidden={hidden} onBack={() => setView("dashboard")} />}

      {view === "glossary" && (
        <GlossaryView
          onBack={() => setView("dashboard")}
          onStartAcronymQuiz={startAcronymQuiz}
          availableAcronymCount={availableAcronymCount}
        />
      )}

      {view === "topic_detail" && selectedTopic && (
        <TopicDetail
          topic={selectedTopic}
          cards={cards}
          hidden={hidden}
          onBack={() => {
            setSelectedTopic(null);
            setQuizChainExcludedIds([]);
            setView("dashboard");
          }}
          onStartFocusedQuiz={() => {
            setQuizChainExcludedIds([]);
            startQuiz(selectedTopic);
          }}
        />
      )}

      {view === "quiz" && queue[queueIndex] && (
        <QuizCard
          key={`${queue[queueIndex].questionId}-${queueIndex}`}
          card={queue[queueIndex]}
          onRate={handleRate}
          onHide={handleHide}
          onResetCard={handleResetCard}
          onBackToMenu={() => {
            setQuizChainExcludedIds([]);
            setView(selectedTopic ? "topic_detail" : "dashboard");
          }}
          index={queueIndex}
          total={queue.length}
          reinforcementMode={sessionCards.some(
            (answeredCard) => answeredCard.questionId === queue[queueIndex].questionId
          )}
        />
      )}

      {view === "result" && (
        <RisultatoSessione
          sessionCards={sessionCards}
          ratings={sessionRatings}
          remainingCount={remainingQuizPoolCount}
          onContinue={continueQuizWithNextBatch}
          onDone={() => {
            setQuizChainExcludedIds([]);
            setView(selectedTopic ? "topic_detail" : "dashboard");
          }}
        />
      )}

      {view === "exam_quiz" && examQueue[examIndex] && (
        <ExamQuizCard
          key={`${examQueue[examIndex].question.id}-${examIndex}`}
          item={examQueue[examIndex]}
          index={examIndex + 1}
          total={examQueue.length}
          selectedIndex={examSelectedIndex}
          onSelect={setExamSelectedIndex}
          onNext={handleExamNext}
          onBack={() => setView("dashboard")}
          secondsRemaining={examSecondsRemaining}
        />
      )}

      {view === "exam_result" && (
        <ExamResultSession
          answers={examAnswers}
          examQueue={examQueue}
          cards={cards}
          totalQuestions={examQueue.length}
          timedOut={examTimedOut}
          onRetakeSame={restartSameExamSimulation}
          onNewSimulation={startExamSimulation}
          onDone={() => setView("dashboard")}
        />
      )}

      {view === "acronym_quiz" && acronymQueue.length === 0 && (
        <div className="mx-auto max-w-2xl space-y-4 px-4 py-8 text-center">
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
            <div className="text-lg font-semibold text-white">Nessuna voce disponibile</div>
            <div className="mt-2 text-sm text-slate-400">
              Tutte le voci del glossario utili per il quiz acronimi risultano nascoste.
            </div>
            <button
              onClick={() => setView("glossary")}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Torna al glossario
            </button>
          </div>
        </div>
      )}

      {view === "acronym_quiz" && acronymQueue[acronymIndex] && (
        <AcronymQuizCard
          key={`${acronymQueue[acronymIndex].entry.id}-${acronymIndex}`}
          item={acronymQueue[acronymIndex]}
          index={acronymIndex}
          total={acronymQueue.length}
          onAnswer={handleAcronymAnswer}
          onHide={handleHideGlossary}
          onBack={() => setView("glossary")}
        />
      )}

      {view === "acronym_result" && (
        <AcronymResultSession ratings={acronymRatings} onDone={() => setView("glossary")} />
      )}
    </main>
  );
}
