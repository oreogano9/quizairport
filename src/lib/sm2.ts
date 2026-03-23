// SM-2 Spaced Repetition Algorithm
// Rating scale: 0=Again, 1=Hard, 2=Good, 3=Easy

export const RATING_AGAIN = 0;
export const RATING_HARD = 1;
export const RATING_GOOD = 2;
export const RATING_EASY = 3;

export interface CardState {
  questionId: string;
  interval: number;       // days until next review
  easeFactor: number;     // multiplier (min 1.3)
  repetitions: number;    // successful repetitions in a row
  nextReviewDate: string; // ISO date string
  lastRating: number | null;
  totalReviews: number;
  correctReviews: number;
  struggleScore: number;
  recentHardStreak: number;
  stabilityBoostSessionsLeft: number;
}

const MIN_EASE = 1.3;
const INITIAL_EASE = 2.5;
const MAX_STUDY_WINDOW_INTERVAL = 6;

export function createCardState(questionId: string): CardState {
  return {
    questionId,
    interval: 1,
    easeFactor: INITIAL_EASE,
    repetitions: 0,
    nextReviewDate: new Date().toISOString(),
    lastRating: null,
    totalReviews: 0,
    correctReviews: 0,
    struggleScore: 0,
    recentHardStreak: 0,
    stabilityBoostSessionsLeft: 0,
  };
}

export function applyRating(card: CardState, rating: number): CardState {
  const isCorrect = rating >= RATING_HARD;
  const totalReviews = card.totalReviews + 1;
  const correctReviews = card.correctReviews + (isCorrect ? 1 : 0);

  let { interval, easeFactor, repetitions, struggleScore, recentHardStreak, stabilityBoostSessionsLeft } = card;

  if (rating === RATING_AGAIN) {
    // Failed — reset
    repetitions = 0;
    interval = 1;
  } else {
    // Passed
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval =
        rating === RATING_HARD ? 2 :
        rating === RATING_GOOD ? 3 :
        4;
    } else {
      if (rating === RATING_HARD) {
        interval = Math.min(MAX_STUDY_WINDOW_INTERVAL - 2, Math.max(interval + 1, Math.round(interval * 1.2)));
      } else if (rating === RATING_GOOD) {
        interval = Math.min(
          MAX_STUDY_WINDOW_INTERVAL - 1,
          Math.max(interval + 1, Math.round(interval * Math.max(1.35, easeFactor - 0.65)))
        );
      } else {
        interval = Math.min(
          MAX_STUDY_WINDOW_INTERVAL,
          Math.max(interval + 1, Math.round(interval * Math.max(1.5, easeFactor - 0.45)))
        );
      }
    }
    repetitions += 1;
  }

  // Adjust ease factor based on rating
  const easeAdjustment =
    rating === RATING_EASY ? 0.15 :
    rating === RATING_GOOD ? 0 :
    rating === RATING_HARD ? -0.15 :
    -0.3; // AGAIN

  easeFactor = Math.max(MIN_EASE, easeFactor + easeAdjustment);

  if (rating === RATING_AGAIN) {
    struggleScore = Math.min(100, struggleScore + 32);
    recentHardStreak += 1;
    stabilityBoostSessionsLeft = Math.max(stabilityBoostSessionsLeft, 3);
  } else if (rating === RATING_HARD) {
    struggleScore = Math.min(100, struggleScore + 18);
    recentHardStreak += 1;
    stabilityBoostSessionsLeft = Math.max(stabilityBoostSessionsLeft, 3);
  } else if (rating === RATING_GOOD) {
    struggleScore = Math.max(0, struggleScore - (recentHardStreak > 0 ? 6 : 10));
    recentHardStreak = Math.max(0, recentHardStreak - 1);
  } else {
    struggleScore = Math.max(
      0,
      struggleScore - (recentHardStreak > 0 || stabilityBoostSessionsLeft > 0 ? 4 : 14)
    );
    recentHardStreak = Math.max(0, recentHardStreak - 1);
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    ...card,
    interval,
    easeFactor,
    repetitions,
    nextReviewDate: nextReviewDate.toISOString(),
    lastRating: rating,
    totalReviews,
    correctReviews,
    struggleScore,
    recentHardStreak,
    stabilityBoostSessionsLeft,
  };
}

export function isDue(card: CardState): boolean {
  return new Date(card.nextReviewDate) <= new Date();
}

export function getDueCount(cards: CardState[]): number {
  return cards.filter(isDue).length;
}

export function getNewCount(cards: CardState[]): number {
  return cards.filter((c) => c.totalReviews === 0).length;
}

export function sortForReview(cards: CardState[]): CardState[] {
  const now = new Date();
  return [...cards]
    .filter((c) => new Date(c.nextReviewDate) <= now)
    .sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());
}
