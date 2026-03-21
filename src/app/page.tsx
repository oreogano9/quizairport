"use client";

import { useCallback, useEffect, useState } from "react";
import { QUESTIONS, Question } from "@/lib/questions";
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
  loadCards,
  resetCards,
  saveCards,
  loadHidden,
  hideQuestion,
} from "@/lib/storage";

// ─── Types ───────────────────────────────────────────────────────────────────

type View = "dashboard" | "topic_detail" | "quiz" | "result";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getQuestion(id: string): Question {
  return QUESTIONS.find((q) => q.id === id)!;
}

function getDueCards(cards: CardState[], hidden: Set<string>, topic?: string): CardState[] {
  return cards.filter(
    (c) => isDue(c) && !hidden.has(c.questionId) && (!topic || getQuestion(c.questionId).topic === topic)
  );
}

function shuffleOptions(question: Question): { text: string; originalIndex: number }[] {
  const opts = question.options.map((text, i) => ({ text, originalIndex: i }));
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
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
  const d = next.interval;
  if (d <= 1) {
    if (rating === RATING_HARD) return "< 6 min";
    if (rating === RATING_GOOD) return "< 10 min";
    return "1 giorno"; // Easy on fresh card
  }
  if (d < 7) return `tra ${d} giorni`;
  if (d < 30) return `tra ${Math.round(d / 7)} sett.`;
  return `tra ${Math.round(d / 30)} mesi`;
}

function formatNextReview(card: CardState): string {
  if (card.totalReviews === 0) return "nuova";
  const d = new Date(card.nextReviewDate);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "da ripassare";
  if (diff === 1) return "domani";
  if (diff < 7) return `tra ${diff} giorni`;
  if (diff < 30) return `tra ${Math.round(diff / 7)} sett.`;
  return `tra ${Math.round(diff / 30)} mesi`;
}

// ─── Acronym expansion ───────────────────────────────────────────────────────

const ACRONYMS: Record<string, string> = {
  "ADC-A": "Airside Driving Certificate tipo A (piazzali)",
  "ADC-M": "Airside Driving Certificate tipo M (Area di Manovra)",
  ADC:  "Airside Driving Certificate",
  TIA:  "Tesserino Ingresso Aeroportuale",
  FOD:  "Foreign Object Damage / Debris",
  ERA:  "Equipment Restriction Area",
  ESA:  "Equipment Service Area",
  ERL:  "Equipment Restriction Line",
  ABL:  "Apron Border Line",
  ADE:  "Airside Driving Expert",
  CEA:  "Coordinamento Emergenze Airside",
  GSR:  "Ground Safety Report",
  LVP:  "Low Visibility Procedures",
  NPA:  "No Parking Area",
  NPL:  "No Parking Line",
  TWR:  "Torre di Controllo",
  FCO:  "Aeroporto di Fiumicino",
  CIA:  "Aeroporto di Ciampino",
  ENAC: "Ente Nazionale Aviazione Civile",
  ENAV: "Ente Nazionale Assistenza al Volo",
  ADR:  "Aeroporti di Roma",
  UHF:  "Ultra High Frequency",
  RWY:  "Runway (pista di volo)",
  EU:   "Unione Europea",
};

const ACRONYM_RE = /(ADC-[AM]|[A-Z]{2,5})/;

function AcronymSpan({ acronym, full }: { acronym: string; full: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline">
      <span
        className="border-b border-dotted border-slate-400 cursor-help"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={(e) => { e.stopPropagation(); setShow((v) => !v); }}
      >
        {acronym}
      </span>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-900 border border-slate-600 text-slate-200 text-xs px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none shadow-lg">
          {full}
        </span>
      )}
    </span>
  );
}

function AcronymText({ text }: { text: string }) {
  const parts = text.split(ACRONYM_RE);
  return (
    <>
      {parts.map((part, i) =>
        ACRONYMS[part] ? (
          <AcronymSpan key={i} acronym={part} full={ACRONYMS[part]} />
        ) : (
          part
        )
      )}
    </>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconBack() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function IconChevronDown({ open }: { open: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className={`transition-transform shrink-0 ${open ? "rotate-180" : ""}`}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ─── ProgressRing ─────────────────────────────────────────────────────────────

function ProgressRing({ pct }: { pct: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  return (
    <svg width="88" height="88" className="rotate-[-90deg]">
      <circle cx="44" cy="44" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
      <circle cx="44" cy="44" r={r} fill="none" stroke="#3b82f6" strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.5s ease" }} />
    </svg>
  );
}

// ─── ConfirmRow ───────────────────────────────────────────────────────────────

function ConfirmRow({
  message, confirmLabel, confirmColor, onConfirm, onCancel,
}: {
  message: string; confirmLabel: string; confirmColor: string;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
      <span className="text-slate-400">{message}</span>
      <button onClick={onConfirm} className={`font-semibold ${confirmColor}`}>{confirmLabel}</button>
      <button onClick={onCancel} className="text-slate-500 hover:text-slate-300">Annulla</button>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard({
  cards, hidden,
  onStartQuiz, onOpenTopic, onReset,
}: {
  cards: CardState[]; hidden: Set<string>;
  onStartQuiz: () => void;
  onOpenTopic: (topic: string) => void;
  onReset: () => void;
}) {
  const activeCards = cards.filter((c) => !hidden.has(c.questionId));
  const dueCount = getDueCards(cards, hidden).length;
  const newCount = activeCards.filter((c) => c.totalReviews === 0).length;
  const masteredCount = activeCards.filter((c) => c.repetitions >= 3).length;
  const totalReviews = activeCards.reduce((s, c) => s + c.totalReviews, 0);
  const correctReviews = activeCards.reduce((s, c) => s + c.correctReviews, 0);
  const accuracy = totalReviews === 0 ? 0 : Math.round((correctReviews / totalReviews) * 100);
  const hiddenCount = hidden.size;

  const topicMap: Record<string, { total: number; mastered: number; due: number }> = {};
  for (const q of QUESTIONS) {
    if (hidden.has(q.id)) continue;
    if (!topicMap[q.topic]) topicMap[q.topic] = { total: 0, mastered: 0, due: 0 };
    topicMap[q.topic].total += 1;
    const card = cards.find((c) => c.questionId === q.id);
    if (card) {
      if (card.repetitions >= 3) topicMap[q.topic].mastered += 1;
      if (isDue(card)) topicMap[q.topic].due += 1;
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-1">
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
          <div key={label} className="bg-slate-800 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-slate-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-300">Progresso totale</span>
          <span className="text-slate-400">{masteredCount} / {activeCards.length}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${activeCards.length === 0 ? 0 : (masteredCount / activeCards.length) * 100}%` }} />
        </div>
        {hiddenCount > 0 && (
          <div className="text-xs text-slate-500">{hiddenCount} {hiddenCount === 1 ? "domanda nascosta" : "domande nascoste"}</div>
        )}
      </div>

      <button onClick={onStartQuiz} disabled={dueCount === 0}
        className="w-full py-4 rounded-xl font-semibold text-lg transition-all bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed">
        {dueCount > 0
          ? `Inizia ripasso · ${dueCount} ${dueCount === 1 ? "domanda" : "domande"}`
          : "Nessuna domanda da ripassare ora"}
      </button>

      <div className="space-y-2">
        <div className="grid gap-2">
          {Object.entries(topicMap)
            .sort((a, b) => (a[1].mastered / a[1].total) - (b[1].mastered / b[1].total))
            .map(([topic, { total: t, mastered: m, due: d }]) => (
              <button key={topic} onClick={() => onOpenTopic(topic)}
                className="w-full text-left bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-xl p-3 flex items-center gap-3 transition-colors">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${topicColor(topic)}`}>
                  {topic}
                </span>
                <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(m / t) * 100}%` }} />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-500 tabular-nums">{m}/{t}</span>
                  <IconChevronDown open={false} />
                </div>
              </button>
            ))}
        </div>
      </div>

      <div className="text-center">
        <button onClick={() => { if (confirm("Sei sicuro? Tutti i progressi verranno eliminati.")) onReset(); }}
          className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
          Azzera tutti i progressi
        </button>
      </div>
    </div>
  );
}

// ─── TopicDetail ──────────────────────────────────────────────────────────────

function TopicDetail({
  topic, cards, hidden, onBack, onStartFocusedQuiz,
}: {
  topic: string; cards: CardState[]; hidden: Set<string>;
  onBack: () => void; onStartFocusedQuiz: () => void;
}) {
  const questions = QUESTIONS.filter((q) => q.topic === topic && !hidden.has(q.id));
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const dueCount = getDueCards(cards, hidden, topic).length;

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Intestazione */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors p-1 shrink-0">
          <IconBack />
        </button>
        <div className="flex-1 min-w-0">
          <span className={`text-sm px-2 py-0.5 rounded-full font-medium ${topicColor(topic)}`}>{topic}</span>
          <div className="text-xs text-slate-500 mt-1">{questions.length} domande</div>
        </div>
      </div>

      {/* Pulsante quiz focalizzato */}
      <button onClick={onStartFocusedQuiz}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold transition-all">
        {dueCount > 0
          ? `Quiz su questo argomento · ${dueCount} da ripassare`
          : "Quiz su questo argomento · tutte le domande"}
      </button>

      {/* Lista domande */}
      <div className="space-y-2">
        {questions.map((q) => {
          const card = cards.find((c) => c.questionId === q.id);
          const isExpanded = expanded.has(q.id);
          const mastered = card && card.repetitions >= 3;
          const nextReview = card ? formatNextReview(card) : "nuova";

          return (
            <button key={q.id} onClick={() => toggle(q.id)}
              className="w-full text-left bg-slate-800 hover:bg-slate-750 rounded-xl p-4 space-y-3 transition-colors border border-slate-700/50">
              {/* Riga domanda */}
              <div className="flex items-start gap-2">
                <span className={`text-sm mt-0.5 shrink-0 font-bold ${mastered ? "text-green-400" : "text-slate-600"}`}>
                  {mastered ? "✓" : "○"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 leading-snug">{q.question}</p>
                  <p className="text-xs text-slate-500 mt-1">{nextReview}</p>
                </div>
                <IconChevronDown open={isExpanded} />
              </div>

              {/* Contenuto espanso */}
              {isExpanded && (
                <div className="space-y-3 pt-2 border-t border-slate-700">
                  {q.imageUrl && (
                    <div className="rounded-lg overflow-hidden border border-slate-600">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={q.imageUrl} alt="Immagine domanda" className="w-full object-contain max-h-48" />
                    </div>
                  )}
                  <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-3">
                    <p className="text-xs text-green-300 font-semibold mb-1">Risposta corretta</p>
                    <p className="text-sm text-green-200">{q.options[q.correctIndex]}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 leading-relaxed"><AcronymText text={q.explanation} /></p>
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

// ─── QuizCard ─────────────────────────────────────────────────────────────────

function QuizCard({
  card, onRate, onHide, onResetCard, onBackToMenu, index, total,
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

  const correctShuffledIndex = shuffled.findIndex((o) => o.originalIndex === question.correctIndex);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
      {/* Barra superiore */}
      <div className="flex items-center gap-3">
        <button onClick={onBackToMenu} className="text-slate-400 hover:text-white transition-colors p-1 shrink-0" title="Torna al menu">
          <IconBack />
        </button>
        <div className="flex-1 bg-slate-700 rounded-full h-1.5">
          <div className="bg-blue-500 h-1.5 rounded-full transition-all"
            style={{ width: `${(index / total) * 100}%` }} />
        </div>
        <span className="text-xs text-slate-500 tabular-nums shrink-0">{index}/{total}</span>
      </div>

      {/* Etichetta argomento */}
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${topicColor(question.topic)}`}>
        {question.topic}
      </span>

      {/* Immagine */}
      {question.imageUrl && (
        <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={question.imageUrl} alt="Immagine della domanda" className="w-full object-contain max-h-64" />
        </div>
      )}

      {/* Domanda */}
      <div className="text-white font-medium text-lg leading-snug">{question.question}</div>

      {/* Risposte */}
      <div className="space-y-2">
        {shuffled.map((opt, si) => {
          const isCorrect = si === correctShuffledIndex;
          const isSelected = si === selected;
          let cls = "w-full text-left px-4 py-3 rounded-xl border transition-all text-sm leading-snug ";
          if (!revealed) cls += "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer";
          else if (isCorrect) cls += "border-green-500 bg-green-900/40 text-green-200 cursor-default";
          else if (isSelected && !isCorrect) cls += "border-red-500 bg-red-900/40 text-red-200 cursor-default";
          else cls += "border-slate-700 bg-slate-800/50 text-slate-500 cursor-default";
          return (
            <button key={si} className={cls} onClick={() => !revealed && setSelected(si)} disabled={revealed}>
              <span className="mr-2 text-slate-500">{["A", "B", "C"][si]}.</span>
              {opt.text}
              {revealed && isCorrect && <span className="ml-2 text-green-400">✓</span>}
              {revealed && isSelected && !isCorrect && <span className="ml-2 text-red-400">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Spiegazione */}
      {revealed && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">
          <span className="font-semibold text-slate-100">Spiegazione: </span>
          <AcronymText text={question.explanation} />
        </div>
      )}

      {/* Pulsanti di valutazione */}
      {revealed && (
        <div className="space-y-2">
          <div className="text-xs text-slate-500 text-center">Come ti è sembrata questa domanda?</div>
          <div className="grid grid-cols-4 gap-2">
            {[RATING_AGAIN, RATING_HARD, RATING_GOOD, RATING_EASY].map((r) => (
              <button key={r} onClick={() => onRate(r)}
                className={`py-3 rounded-xl text-sm font-semibold text-white transition-all ${ratingColor(r)}`}>
                <div>{ratingLabel(r)}</div>
                <div className="text-xs opacity-70 mt-0.5">{ratingIntervalHint(card, r)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Gestione domanda (ben separata dai pulsanti di valutazione) ── */}
      {revealed && (
        <div className="mt-8 border border-slate-700 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide text-center">Gestione domanda</p>
          </div>

          {/* Reimposta progressi */}
          <div className="p-4">
            {cardAction === "reset" ? (
              <ConfirmRow
                message="Azzerare i progressi di questa domanda?"
                confirmLabel="Sì, azzera"
                confirmColor="text-orange-400 hover:text-orange-300"
                onConfirm={() => { onResetCard(); setCardAction(null); }}
                onCancel={() => setCardAction(null)}
              />
            ) : (
              <button onClick={() => setCardAction("reset")}
                className="w-full text-xs text-slate-400 hover:text-slate-200 transition-colors text-center py-1">
                Reimposta progressi domanda
              </button>
            )}
          </div>

          {/* Nascondi domanda */}
          <div className="border-t border-slate-700 p-4">
            {cardAction === "hide" ? (
              <ConfirmRow
                message="Nascondere questa domanda per sempre?"
                confirmLabel="Sì, nascondi"
                confirmColor="text-red-400 hover:text-red-300"
                onConfirm={() => { onHide(); setCardAction(null); }}
                onCancel={() => setCardAction(null)}
              />
            ) : (
              <button onClick={() => setCardAction("hide")}
                className="w-full text-xs text-slate-500 hover:text-red-400 transition-colors text-center py-1">
                Nascondi questa domanda
              </button>
            )}
          </div>
        </div>
      )}

      {!revealed && (
        <p className="text-center text-xs text-slate-600">Seleziona una risposta per continuare</p>
      )}
    </div>
  );
}

// ─── Risultato sessione ───────────────────────────────────────────────────────

function RisultatoSessione({
  sessionCards, ratings, onDone,
}: {
  sessionCards: CardState[]; ratings: number[]; onDone: () => void;
}) {
  const total = sessionCards.length;
  const correct = ratings.filter((r) => r >= RATING_HARD).length;
  const pct = Math.round((correct / total) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
      <div className="inline-flex items-center justify-center relative">
        <ProgressRing pct={pct} />
        <span className="absolute text-2xl font-bold text-white">{pct}%</span>
      </div>
      <div className="space-y-1">
        <div className="text-xl font-bold text-white">Sessione completata!</div>
        <div className="text-slate-400 text-sm">{correct} corrette su {total}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Di nuovo", count: ratings.filter((r) => r === RATING_AGAIN).length, color: "text-red-400" },
          { label: "Difficile", count: ratings.filter((r) => r === RATING_HARD).length, color: "text-orange-400" },
          { label: "Bene", count: ratings.filter((r) => r === RATING_GOOD).length, color: "text-blue-400" },
          { label: "Facile", count: ratings.filter((r) => r === RATING_EASY).length, color: "text-green-400" },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-slate-800 rounded-xl p-3">
            <div className={`text-2xl font-bold ${color}`}>{count}</div>
            <div className="text-xs text-slate-400">{label}</div>
          </div>
        ))}
      </div>
      <button onClick={onDone}
        className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-all">
        Torna alla dashboard
      </button>
    </div>
  );
}

// ─── App principale ───────────────────────────────────────────────────────────

export default function Home() {
  const [cards, setCards] = useState<CardState[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [view, setView] = useState<View>("dashboard");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [queue, setQueue] = useState<CardState[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [sessionRatings, setSessionRatings] = useState<number[]>([]);
  const [sessionCards, setSessionCards] = useState<CardState[]>([]);

  useEffect(() => {
    setCards(loadCards());
    setHidden(loadHidden());
  }, []);

  const startQuiz = useCallback((topic?: string) => {
    let due = getDueCards(cards, hidden, topic);
    // Se quiz focalizzato su topic e non ci sono carte in scadenza, usa tutte le carte del topic
    if (topic && due.length === 0) {
      due = cards.filter(
        (c) => !hidden.has(c.questionId) && getQuestion(c.questionId).topic === topic
      );
    }
    if (due.length === 0) return;
    const shuffled = [...due].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setQueueIndex(0);
    setSessionRatings([]);
    setSessionCards([]);
    setView("quiz");
  }, [cards, hidden]);

  const handleRate = useCallback((rating: number) => {
    const currentCard = queue[queueIndex];
    const updated = applyRating(currentCard, rating);
    const newCards = cards.map((c) => c.questionId === updated.questionId ? updated : c);
    setCards(newCards);
    saveCards(newCards);
    setSessionRatings((prev) => [...prev, rating]);
    setSessionCards((prev) => [...prev, currentCard]);
    if (queueIndex + 1 >= queue.length) {
      setView("result");
    } else {
      setQueueIndex((i) => i + 1);
    }
  }, [cards, queue, queueIndex]);

  const handleHide = useCallback(() => {
    const id = queue[queueIndex]?.questionId;
    if (!id) return;
    hideQuestion(id);
    const newHidden = new Set(hidden);
    newHidden.add(id);
    setHidden(newHidden);
    if (queueIndex + 1 >= queue.length) {
      sessionCards.length === 0 ? setView("dashboard") : setView("result");
    } else {
      setQueueIndex((i) => i + 1);
    }
  }, [queue, queueIndex, hidden, sessionCards]);

  const handleResetCard = useCallback(() => {
    const id = queue[queueIndex]?.questionId;
    if (!id) return;
    const fresh = createCardState(id);
    const newCards = cards.map((c) => c.questionId === id ? fresh : c);
    setCards(newCards);
    saveCards(newCards);
    // Aggiorna anche la carta corrente nella coda (in modo che i hint di intervallo siano corretti)
    setQueue((prev) => prev.map((c, i) => i === queueIndex ? fresh : c));
  }, [cards, queue, queueIndex]);

  const handleBackToMenu = useCallback(() => {
    setView(selectedTopic ? "topic_detail" : "dashboard");
  }, [selectedTopic]);

  const handleReset = useCallback(() => {
    const fresh = resetCards();
    setCards(fresh);
    setHidden(new Set());
    setView("dashboard");
  }, []);

  const handleOpenTopic = useCallback((topic: string) => {
    setSelectedTopic(topic);
    setView("topic_detail");
  }, []);

  if (cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm">Caricamento...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {view === "dashboard" && (
        <Dashboard
          cards={cards} hidden={hidden}
          onStartQuiz={() => startQuiz()}
          onOpenTopic={handleOpenTopic}
          onReset={handleReset}
        />
      )}
      {view === "topic_detail" && selectedTopic && (
        <TopicDetail
          topic={selectedTopic}
          cards={cards}
          hidden={hidden}
          onBack={() => setView("dashboard")}
          onStartFocusedQuiz={() => startQuiz(selectedTopic)}
        />
      )}
      {view === "quiz" && queue[queueIndex] && (
        <QuizCard
          key={queue[queueIndex].questionId + queueIndex}
          card={queue[queueIndex]}
          onRate={handleRate}
          onHide={handleHide}
          onResetCard={handleResetCard}
          onBackToMenu={handleBackToMenu}
          index={queueIndex}
          total={queue.length}
        />
      )}
      {view === "result" && (
        <RisultatoSessione
          sessionCards={sessionCards}
          ratings={sessionRatings}
          onDone={() => {
            setView(selectedTopic ? "topic_detail" : "dashboard");
          }}
        />
      )}
    </main>
  );
}
