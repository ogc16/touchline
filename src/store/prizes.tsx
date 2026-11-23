import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEMO_USERS, type AuthUser } from '@/store/auth';

export type PrizeKind = 'jackpot' | 'daily' | 'lucky';

export interface PrizeAward {
  id: string;
  kind: PrizeKind;
  title: string;
  amount: number;
  winnerId: string;
  winnerName: string;
  winnerEmail: string;
  dateKey: string;
  dateLabel: string;
  createdAt: string;
  claimed: boolean;
  note: string;
  betId?: string;
}

export interface LuckyDraw {
  dateKey: string;
  winningNumber: number;
  dateLabel: string;
  createdAt: string;
}

export interface BetPrizeInput {
  stake: number;
  odds: number;
  user: AuthUser;
}

interface PrizeState {
  jackpot: number;
  awards: PrizeAward[];
  lastDrawDate: string | null;
  luckyNumbers: Record<string, number>;
  luckyDraws: LuckyDraw[];
  totalAwarded: number;
}

interface PrizeContextValue {
  ready: boolean;
  jackpot: number;
  awards: PrizeAward[];
  dailyWinner: PrizeAward | null;
  luckyNumber: number | null;
  luckyDraw: LuckyDraw | null;
  luckyAward: PrizeAward | null;
  myAwards: PrizeAward[];
  unclaimedMyCount: number;
  totalAwarded: number;
  lastDrawDate: string | null;
  todayKey: string;
  recordBet: (input: BetPrizeInput) => PrizeAward | null;
  runDailyDraw: (users: AuthUser[]) => PrizeAward | null;
  runLuckyDraw: (users: AuthUser[]) => PrizeAward[];
  setLuckyNumber: (value: number) => void;
  claimPrize: (id: string) => number | null;
}

const STORAGE_KEY = 'touchline.prizes.v1';
const JACKPOT_SEED = 8640;
const DAILY_PRIZE = 250;
const LUCKY_MIN = 1;
const LUCKY_MAX = 50;
const LUCKY_EXACT_PRIZE = 500;
const LUCKY_NEAR_PRIZE = 75;
const JACKPOT_TRIGGER_ODDS = 8;
const JACKPOT_TRIGGER_STAKE = 10;

const JACKPOT_THRESHOLDS = [
  { min: 2000, amount: 25 },
  { min: 5000, amount: 50 },
  { min: 10000, amount: 100 },
  { min: 20000, amount: 250 },
];

const DEFAULT_LUCKY_NUMBERS: Record<string, number> = {
  [DEMO_USERS[0].email]: 17,
  [DEMO_USERS[1].email]: 42,
  [DEMO_USERS[2].email]: 7,
  [DEMO_USERS[3].email]: 28,
};

const PrizeContext = createContext<PrizeContextValue | null>(null);

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

export function getDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getShortDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function offsetDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function seedFromString(value: string): number {
  return Array.from(value).reduce(
    (total, character, index) => total + character.charCodeAt(0) * (index + 1),
    0,
  );
}

function jackpotAmount(pot: number): number {
  const tier = [...JACKPOT_THRESHOLDS].reverse().find((item) => pot >= item.min);
  return tier?.amount ?? 25;
}

function pickLuckyNumber(dateKey: string): number {
  return (seedFromString(`${dateKey}:touchline-lucky`) % LUCKY_MAX) + LUCKY_MIN;
}

function defaultState(): PrizeState {
  const yesterday = offsetDate(-1);
  const twoDaysAgo = offsetDate(-2);
  const yesterdayKey = getDateKey(yesterday);
  const awards: PrizeAward[] = [
    {
      id: 'seed-lucky-yesterday',
      kind: 'lucky',
      title: 'Lucky number · Exact',
      amount: LUCKY_EXACT_PRIZE,
      winnerId: 'demo-user-maya',
      winnerName: 'Maya Silva',
      winnerEmail: 'maya@touchline.app',
      dateKey: yesterdayKey,
      dateLabel: getShortDate(yesterday),
      createdAt: yesterday.toISOString(),
      claimed: true,
      note: 'Exact match on 7',
    },
    {
      id: 'seed-daily-yesterday',
      kind: 'daily',
      title: 'Daily draw',
      amount: DAILY_PRIZE,
      winnerId: 'demo-user-maya',
      winnerName: 'Maya Silva',
      winnerEmail: 'maya@touchline.app',
      dateKey: yesterdayKey,
      dateLabel: getShortDate(yesterday),
      createdAt: yesterday.toISOString(),
      claimed: true,
      note: 'Random daily winner',
    },
    {
      id: 'seed-jackpot-two-days',
      kind: 'jackpot',
      title: 'Accumulator jackpot',
      amount: 250,
      winnerId: 'demo-user-alex',
      winnerName: 'Alex Kim',
      winnerEmail: 'alex@touchline.app',
      dateKey: getDateKey(twoDaysAgo),
      dateLabel: getShortDate(twoDaysAgo),
      createdAt: twoDaysAgo.toISOString(),
      claimed: true,
      note: '8+ odds accumulator',
      betId: 'TL-84110',
    },
  ];
  return {
    jackpot: JACKPOT_SEED,
    awards,
    lastDrawDate: null,
    luckyNumbers: { ...DEFAULT_LUCKY_NUMBERS },
    luckyDraws: [
      {
        dateKey: yesterdayKey,
        winningNumber: 7,
        dateLabel: getShortDate(yesterday),
        createdAt: yesterday.toISOString(),
      },
    ],
    totalAwarded: awards.reduce((total, award) => total + award.amount, 0),
  };
}

async function persist(state: PrizeState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    return;
  }
}

async function loadState(): Promise<PrizeState> {
  const fallback = defaultState();
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw) as Partial<PrizeState>;
    return {
      jackpot: typeof parsed.jackpot === 'number' ? parsed.jackpot : fallback.jackpot,
      awards: Array.isArray(parsed.awards) ? parsed.awards : fallback.awards,
      lastDrawDate: parsed.lastDrawDate ?? null,
      luckyNumbers: { ...fallback.luckyNumbers, ...(parsed.luckyNumbers ?? {}) },
      luckyDraws: Array.isArray(parsed.luckyDraws) ? parsed.luckyDraws : fallback.luckyDraws,
      totalAwarded: typeof parsed.totalAwarded === 'number' ? parsed.totalAwarded : fallback.totalAwarded,
    };
  } catch {
    return fallback;
  }
}

function pickDailyWinner(users: AuthUser[], dateKey: string): AuthUser {
  const sorted = [...users].sort((left, right) => left.email.localeCompare(right.email));
  return sorted[seedFromString(dateKey) % sorted.length];
}

export function PrizeProvider({
  children,
  authStatus,
  authUsers,
  currentUser,
}: {
  children: ReactNode;
  authStatus: 'loading' | 'authenticated' | 'guest';
  authUsers: AuthUser[];
  currentUser: AuthUser | null;
}) {
  const [state, setState] = useState<PrizeState>(defaultState);
  const [ready, setReady] = useState(false);
  const [todayKey] = useState(() => getDateKey(new Date()));

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      void (async () => {
        const stored = await loadState();
        if (!active) {
          return;
        }
        setState(stored);
        setReady(true);
      })();
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const commit = useCallback((next: PrizeState) => {
    setState(next);
    void persist(next);
  }, []);

  const dailyWinner = useMemo(
    () => state.awards.find((award) => award.kind === 'daily' && award.dateKey === todayKey) ?? null,
    [state.awards, todayKey],
  );

  const luckyNumber = useMemo(
    () => (currentUser ? state.luckyNumbers[currentUser.email] ?? null : null),
    [currentUser, state.luckyNumbers],
  );

  const luckyDraw = useMemo(
    () => state.luckyDraws.find((draw) => draw.dateKey === todayKey) ?? null,
    [state.luckyDraws, todayKey],
  );

  const myAwards = useMemo(() => {
    if (!currentUser) {
      return [];
    }
    return state.awards.filter((award) => award.winnerEmail === currentUser.email);
  }, [currentUser, state.awards]);

  const luckyAward = useMemo(
    () => myAwards.find((award) => award.kind === 'lucky' && award.dateKey === todayKey) ?? null,
    [myAwards, todayKey],
  );

  const unclaimedMyCount = useMemo(
    () => myAwards.filter((award) => !award.claimed).length,
    [myAwards],
  );

  const recordBet = useCallback(
    ({ stake, odds, user }: BetPrizeInput): PrizeAward | null => {
      const contribution = roundMoney(stake * 0.03);
      let nextJackpot = roundMoney(state.jackpot + contribution);
      let award: PrizeAward | null = null;

      if (odds >= JACKPOT_TRIGGER_ODDS && stake >= JACKPOT_TRIGGER_STAKE) {
        const amount = jackpotAmount(nextJackpot);
        award = {
          id: `jackpot-${Date.now()}`,
          kind: 'jackpot',
          title: 'Accumulator jackpot',
          amount,
          winnerId: user.id,
          winnerName: user.name,
          winnerEmail: user.email,
          dateKey: todayKey,
          dateLabel: getShortDate(new Date()),
          createdAt: new Date().toISOString(),
          claimed: false,
          note: `${odds.toFixed(2)}x accumulator`,
        };
        nextJackpot = JACKPOT_SEED;
      }

      commit({
        ...state,
        jackpot: nextJackpot,
        awards: award ? [award, ...state.awards] : state.awards,
        totalAwarded: state.totalAwarded + (award?.amount ?? 0),
      });
      return award;
    },
    [commit, state, todayKey],
  );

  const runDailyDraw = useCallback(
    (users: AuthUser[]): PrizeAward | null => {
      if (!ready || users.length === 0 || state.lastDrawDate === todayKey) {
        return null;
      }
      const winner = pickDailyWinner(users, todayKey);
      const award: PrizeAward = {
        id: `daily-${todayKey}`,
        kind: 'daily',
        title: 'Daily draw',
        amount: DAILY_PRIZE,
        winnerId: winner.id,
        winnerName: winner.name,
        winnerEmail: winner.email,
        dateKey: todayKey,
        dateLabel: getShortDate(new Date()),
        createdAt: new Date().toISOString(),
        claimed: false,
        note: 'Random daily winner',
      };
      commit({
        ...state,
        lastDrawDate: todayKey,
        awards: [award, ...state.awards],
        totalAwarded: state.totalAwarded + award.amount,
      });
      return award;
    },
    [commit, ready, state, todayKey],
  );

  const runLuckyDraw = useCallback(
    (users: AuthUser[]): PrizeAward[] => {
      if (!ready || users.length === 0 || state.luckyDraws.some((draw) => draw.dateKey === todayKey)) {
        return [];
      }
      const winningNumber = pickLuckyNumber(todayKey);
      const draw: LuckyDraw = {
        dateKey: todayKey,
        winningNumber,
        dateLabel: getShortDate(new Date()),
        createdAt: new Date().toISOString(),
      };
      const awards: PrizeAward[] = [];
      users.forEach((user) => {
        const pick = state.luckyNumbers[user.email];
        if (typeof pick !== 'number') {
          return;
        }
        const difference = Math.abs(pick - winningNumber);
        if (difference > 1) {
          return;
        }
        const exact = difference === 0;
        awards.push({
          id: `lucky-${todayKey}-${user.email}`,
          kind: 'lucky',
          title: exact ? 'Lucky number · Exact' : 'Lucky number · Near miss',
          amount: exact ? LUCKY_EXACT_PRIZE : LUCKY_NEAR_PRIZE,
          winnerId: user.id,
          winnerName: user.name,
          winnerEmail: user.email,
          dateKey: todayKey,
          dateLabel: getShortDate(new Date()),
          createdAt: new Date().toISOString(),
          claimed: false,
          note: exact ? `Exact match on ${winningNumber}` : `One away from ${winningNumber}`,
        });
      });
      const awardedTotal = awards.reduce((total, award) => total + award.amount, 0);
      commit({
        ...state,
        luckyDraws: [draw, ...state.luckyDraws],
        awards: [...awards, ...state.awards],
        totalAwarded: state.totalAwarded + awardedTotal,
      });
      return awards;
    },
    [commit, ready, state, todayKey],
  );

  const setLuckyNumber = useCallback(
    (value: number): void => {
      if (!currentUser || !Number.isInteger(value) || value < LUCKY_MIN || value > LUCKY_MAX) {
        return;
      }
      commit({
        ...state,
        luckyNumbers: { ...state.luckyNumbers, [currentUser.email]: value },
      });
    },
    [commit, currentUser, state],
  );

  const claimPrize = useCallback(
    (id: string): number | null => {
      const award = state.awards.find((item) => item.id === id);
      if (!award || award.claimed) {
        return null;
      }
      commit({
        ...state,
        awards: state.awards.map((item) => (item.id === id ? { ...item, claimed: true } : item)),
      });
      return award.amount;
    },
    [commit, state],
  );

  useEffect(() => {
    if (authStatus === 'loading' || !ready || authUsers.length === 0 || state.lastDrawDate === todayKey) {
      return;
    }
    const timer = setTimeout(() => {
      runDailyDraw(authUsers);
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [authStatus, authUsers, ready, runDailyDraw, state.lastDrawDate, todayKey]);

  useEffect(() => {
    if (
      authStatus === 'loading' ||
      !ready ||
      authUsers.length === 0 ||
      state.luckyDraws.some((draw) => draw.dateKey === todayKey)
    ) {
      return;
    }
    const timer = setTimeout(() => {
      runLuckyDraw(authUsers);
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, [authStatus, authUsers, ready, runLuckyDraw, state.luckyDraws, todayKey]);

  const value = useMemo<PrizeContextValue>(
    () => ({
      ready,
      jackpot: state.jackpot,
      awards: state.awards,
      dailyWinner,
      luckyNumber,
      luckyDraw,
      luckyAward,
      myAwards,
      unclaimedMyCount,
      totalAwarded: state.totalAwarded,
      lastDrawDate: state.lastDrawDate,
      todayKey,
      recordBet,
      runDailyDraw,
      runLuckyDraw,
      setLuckyNumber,
      claimPrize,
    }),
    [
      ready,
      state,
      dailyWinner,
      luckyNumber,
      luckyDraw,
      luckyAward,
      myAwards,
      unclaimedMyCount,
      todayKey,
      recordBet,
      runDailyDraw,
      runLuckyDraw,
      setLuckyNumber,
      claimPrize,
    ],
  );

  return <PrizeContext.Provider value={value}>{children}</PrizeContext.Provider>;
}

export function usePrize(): PrizeContextValue {
  const context = useContext(PrizeContext);
  if (!context) {
    throw new Error('usePrize must be used inside PrizeProvider');
  }
  return context;
}
