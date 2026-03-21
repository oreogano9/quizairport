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
import { hideQuestion, loadCards, loadHidden, resetCards, saveCards, saveHidden } from "@/lib/storage";

type View =
  | "dashboard"
  | "topic_detail"
  | "quiz"
  | "result"
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

function getQuestion(id: string): Question {
  return QUESTIONS.find((q) => q.id === id)!;
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
  "gl-beacon": ["luce anticollisione"],
  "gl-centerline": ["center-line"],
  "gl-chocks": ["wheel chocks", "tacchi", "chocks"],
  "gl-conspicuous": ["conspicuous color"],
  "gl-passo-duomo": ["passo d'uomo"],
  "gl-qr-adr": ["QR code ADR", "Quick References"],
  "gl-rwy-strip": ["RWY STRIP NO ENTRY"],
  "gl-stand": ["Aircraft Stand", "Piazzola", "piazzola aeromobile", "piazzole"],
  "gl-stop-aeronautico": ["stop aeronautico"],
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
  onOpenTopic,
  onOpenGlossary,
  onReset,
}: {
  cards: CardState[];
  hidden: Set<string>;
  onStartQuiz: () => void;
  onOpenTopic: (topic: string) => void;
  onOpenGlossary: () => void;
  onReset: () => void;
}) {
  const activeCards = cards.filter((card) => !hidden.has(card.questionId));
  const dueCount = getDueCards(cards, hidden).length;
  const newCount = activeCards.filter((card) => card.totalReviews === 0).length;
  const masteredCount = activeCards.filter((card) => card.repetitions >= 3).length;
  const totalReviews = activeCards.reduce((sum, card) => sum + card.totalReviews, 0);
  const correctReviews = activeCards.reduce((sum, card) => sum + card.correctReviews, 0);
  const accuracy = totalReviews === 0 ? 0 : Math.round((correctReviews / totalReviews) * 100);

  const topicMap: Record<string, { total: number; mastered: number; due: number }> = {};
  for (const question of QUESTIONS) {
    if (hidden.has(question.id)) continue;
    if (!topicMap[question.topic]) topicMap[question.topic] = { total: 0, mastered: 0, due: 0 };
    topicMap[question.topic].total += 1;
    const card = cards.find((candidate) => candidate.questionId === question.id);
    if (!card) continue;
    if (card.repetitions >= 3) topicMap[question.topic].mastered += 1;
    if (isDue(card)) topicMap[question.topic].due += 1;
  }

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
          { label: "Padroneggiate", value: masteredCount, color: "text-green-400" },
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
        disabled={dueCount === 0}
        className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-500 active:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {dueCount > 0
          ? `Inizia ripasso · ${dueCount} ${dueCount === 1 ? "domanda" : "domande"}`
          : "Nessuna domanda da ripassare ora"}
      </button>

      <button
        onClick={onOpenGlossary}
        className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-700 active:bg-slate-600"
      >
        Glossario
      </button>

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
          onClick={() => {
            if (confirm("Sei sicuro? Tutti i progressi verranno eliminati.")) onReset();
          }}
          className="text-xs text-slate-600 transition-colors hover:text-slate-400"
        >
          Azzera tutti i progressi
        </button>
      </div>
    </div>
  );
}

function GlossaryView({
  onBack,
  onStartAcronymQuiz,
}: {
  onBack: () => void;
  onStartAcronymQuiz: () => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(true);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();
  const sections = GLOSSARY_BY_CATEGORY.map(({ category, label, entries }) => ({
    category,
    label,
    entries: entries.filter((entry) => {
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
          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          Quiz solo acronimi
        </button>
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
                    <GlossaryText text={question.question} />
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
                    <p className="text-xs leading-relaxed text-slate-400">
                      <GlossaryText text={question.explanation} />
                    </p>
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
}: {
  card: CardState;
  onRate: (rating: number) => void;
  onHide: () => void;
  onResetCard: () => void;
  onBackToMenu: () => void;
  index: number;
  total: number;
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

      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${topicColor(question.topic)}`}>
        {question.topic}
      </span>

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
        <GlossaryText text={question.question} interactive={revealed} />
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
          <span className="font-semibold text-slate-100">Spiegazione: </span>
          <GlossaryText text={question.explanation} />
        </div>
      )}

      {revealed && (
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
  onBack,
}: {
  item: AcronymQuizItem;
  index: number;
  total: number;
  onAnswer: (rating: number) => void;
  onBack: () => void;
}) {
  const [revealed, setRevealed] = useState(false);

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
  onDone,
}: {
  sessionCards: CardState[];
  ratings: number[];
  onDone: () => void;
}) {
  const total = sessionCards.length;
  const correct = ratings.filter((rating) => rating >= RATING_HARD).length;
  const pct = Math.round((correct / total) * 100);

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
  const [acronymQueue, setAcronymQueue] = useState<AcronymQuizItem[]>([]);
  const [acronymIndex, setAcronymIndex] = useState(0);
  const [acronymRatings, setAcronymRatings] = useState<number[]>([]);

  useEffect(() => {
    setCards(loadCards());
    setHidden(loadHidden());
  }, []);

  const startQuiz = useCallback(
    (topic?: string) => {
      let due = getDueCards(cards, hidden, topic);
      if (topic && due.length === 0) {
        due = cards.filter(
          (card) => !hidden.has(card.questionId) && getQuestion(card.questionId).topic === topic
        );
      }
      if (due.length === 0) return;
      setQueue(shuffleArray(due));
      setQueueIndex(0);
      setSessionRatings([]);
      setSessionCards([]);
      setView("quiz");
    },
    [cards, hidden]
  );

  const startAcronymQuiz = useCallback(() => {
    const items = shuffleArray(ACRONYM_ENTRIES).map((entry) => {
      const distractors = shuffleArray(
        ACRONYM_ENTRIES.filter((candidate) => candidate.id !== entry.id).map(
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
      setSessionRatings((current) => [...current, rating]);
      setSessionCards((current) => [...current, currentCard]);
      if (queueIndex + 1 >= queue.length) setView("result");
      else setQueueIndex((current) => current + 1);
    },
    [cards, queue, queueIndex]
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

  const handleAcronymAnswer = useCallback(
    (rating: number) => {
      setAcronymRatings((current) => [...current, rating]);
      if (acronymIndex + 1 >= acronymQueue.length) setView("acronym_result");
      else setAcronymIndex((current) => current + 1);
    },
    [acronymIndex, acronymQueue.length]
  );

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
            startQuiz();
          }}
          onOpenTopic={(topic) => {
            setSelectedTopic(topic);
            setView("topic_detail");
          }}
          onOpenGlossary={() => setView("glossary")}
          onReset={() => {
            const fresh = resetCards();
            setCards(fresh);
            setHidden(new Set());
            setSelectedTopic(null);
            setView("dashboard");
          }}
        />
      )}

      {view === "glossary" && (
        <GlossaryView onBack={() => setView("dashboard")} onStartAcronymQuiz={startAcronymQuiz} />
      )}

      {view === "topic_detail" && selectedTopic && (
        <TopicDetail
          topic={selectedTopic}
          cards={cards}
          hidden={hidden}
          onBack={() => {
            setSelectedTopic(null);
            setView("dashboard");
          }}
          onStartFocusedQuiz={() => startQuiz(selectedTopic)}
        />
      )}

      {view === "quiz" && queue[queueIndex] && (
        <QuizCard
          key={`${queue[queueIndex].questionId}-${queueIndex}`}
          card={queue[queueIndex]}
          onRate={handleRate}
          onHide={handleHide}
          onResetCard={handleResetCard}
          onBackToMenu={() => setView(selectedTopic ? "topic_detail" : "dashboard")}
          index={queueIndex}
          total={queue.length}
        />
      )}

      {view === "result" && (
        <RisultatoSessione
          sessionCards={sessionCards}
          ratings={sessionRatings}
          onDone={() => setView(selectedTopic ? "topic_detail" : "dashboard")}
        />
      )}

      {view === "acronym_quiz" && acronymQueue[acronymIndex] && (
        <AcronymQuizCard
          key={`${acronymQueue[acronymIndex].entry.id}-${acronymIndex}`}
          item={acronymQueue[acronymIndex]}
          index={acronymIndex}
          total={acronymQueue.length}
          onAnswer={handleAcronymAnswer}
          onBack={() => setView("glossary")}
        />
      )}

      {view === "acronym_result" && (
        <AcronymResultSession ratings={acronymRatings} onDone={() => setView("glossary")} />
      )}
    </main>
  );
}
