import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { PlacedBet, Selection } from '@/data/types';

interface BetSlipContextValue {
  selections: Selection[];
  stakeInput: string;
  stake: number;
  combinedOdds: number;
  payout: number;
  stakeError: string | null;
  sheetOpen: boolean;
  balance: number;
  placedBets: PlacedBet[];
  setStakeInput: (value: string) => void;
  setSheetOpen: (open: boolean) => void;
  toggleSelection: (selection: Selection) => void;
  removeSelection: (id: string) => void;
  clearSlip: () => void;
  placeBet: () => PlacedBet | null;
}

const BetSlipContext = createContext<BetSlipContextValue | null>(null);

const startingBets: PlacedBet[] = [
  {
    id: 'TL-84721',
    placedAt: 'Today, 14:08',
    stake: 25,
    payout: 91.8,
    status: 'pending',
    selections: [
      {
        id: 'seed-1',
        eventId: 'inter-bay',
        eventLabel: 'Inter vs Bayern Munich',
        marketLabel: 'Match winner · 1',
        odds: 2.42,
        sport: 'Soccer',
      },
      {
        id: 'seed-2',
        eventId: 'alc-sin',
        eventLabel: 'Alcaraz vs Sinner',
        marketLabel: 'Match winner · ALC',
        odds: 1.95,
        sport: 'Tennis',
      },
    ],
  },
  {
    id: 'TL-84690',
    placedAt: 'Yesterday, 20:41',
    stake: 40,
    payout: 0,
    status: 'lost',
    selections: [
      {
        id: 'seed-3',
        eventId: 'lal-den',
        eventLabel: 'Lakers vs Nuggets',
        marketLabel: 'Moneyline · DEN',
        odds: 1.74,
        sport: 'Basketball',
      },
    ],
  },
];

export function BetSlipProvider({ children }: { children: ReactNode }) {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [stakeInput, setStakeInput] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [balance, setBalance] = useState(1284.6);
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>(startingBets);

  const toggleSelection = useCallback((selection: Selection) => {
    setSelections((current) => {
      const exists = current.some((item) => item.id === selection.id);
      if (exists) {
        return current.filter((item) => item.id !== selection.id);
      }
      return [...current, selection];
    });
  }, []);

  const removeSelection = useCallback((id: string) => {
    setSelections((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearSlip = useCallback(() => {
    setSelections([]);
    setStakeInput('');
  }, []);

  const combinedOdds = useMemo(
    () => selections.reduce((total, selection) => total * selection.odds, 1),
    [selections],
  );

  const stake = useMemo(() => {
    const parsed = Number(stakeInput);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [stakeInput]);

  const payout = stake * combinedOdds;

  const stakeError = useMemo(() => {
    if (selections.length === 0) {
      return null;
    }
    if (stake === 0) {
      return 'Enter a stake to continue';
    }
    if (stake < 2) {
      return 'Minimum stake is $2.00';
    }
    if (stake > balance) {
      return 'More than your available balance';
    }
    return null;
  }, [balance, selections.length, stake]);

  const placeBet = useCallback((): PlacedBet | null => {
    if (selections.length === 0 || stakeError !== null) {
      return null;
    }

    const placedAt = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());

    const bet: PlacedBet = {
      id: `TL-${Math.floor(10000 + Math.random() * 89999)}`,
      placedAt: `Today, ${placedAt}`,
      stake,
      payout,
      status: 'pending',
      selections,
    };

    setPlacedBets((current) => [bet, ...current]);
    setBalance((current) => current - stake);
    clearSlip();
    return bet;
  }, [clearSlip, payout, selections, stake, stakeError]);

  const value = useMemo<BetSlipContextValue>(
    () => ({
      selections,
      stakeInput,
      stake,
      combinedOdds,
      payout,
      stakeError,
      sheetOpen,
      balance,
      placedBets,
      setStakeInput,
      setSheetOpen,
      toggleSelection,
      removeSelection,
      clearSlip,
      placeBet,
    }),
    [
      balance,
      clearSlip,
      combinedOdds,
      placeBet,
      payout,
      placedBets,
      removeSelection,
      sheetOpen,
      stake,
      stakeError,
      stakeInput,
      selections,
      toggleSelection,
    ],
  );

  return <BetSlipContext.Provider value={value}>{children}</BetSlipContext.Provider>;
}

export function useBetSlip(): BetSlipContextValue {
  const context = useContext(BetSlipContext);
  if (context === null) {
    throw new Error('useBetSlip must be used inside BetSlipProvider');
  }
  return context;
}
