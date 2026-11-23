import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { events as fallbackEvents } from '@/data/events';
import type { SportEvent } from '@/data/types';
import { fetchSportsEvents } from '@/services/sports-api';

type DataSource = 'espn' | 'demo';
type LoadMode = 'initial' | 'refresh';

interface SportsState {
  events: SportEvent[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  source: DataSource;
  lastUpdated: Date | null;
}

interface SportsContextValue extends SportsState {
  date: string;
  setDate: (value: string) => void;
  refresh: () => void;
  getEvent: (id: string) => SportEvent | undefined;
}

const initialState: SportsState = {
  events: fallbackEvents,
  loading: true,
  refreshing: false,
  error: null,
  source: 'demo',
  lastUpdated: null,
};

const SportsContext = createContext<SportsContextValue | null>(null);

function localDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Unable to reach the live scores feed';
}

export function SportsProvider({ children }: { children: ReactNode }) {
  const [date, setDate] = useState(localDateString);
  const [state, setState] = useState<SportsState>(initialState);
  const requestRef = useRef(0);

  const load = useCallback(async (targetDate: string, mode: LoadMode, signal?: AbortSignal) => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setState((current) => ({
      ...current,
      loading: mode === 'initial',
      refreshing: mode === 'refresh',
      error: null,
    }));

    try {
      const nextEvents = await fetchSportsEvents(targetDate, signal);
      if (requestId !== requestRef.current) {
        return;
      }
      setState({
        events: nextEvents,
        loading: false,
        refreshing: false,
        error: null,
        source: 'espn',
        lastUpdated: new Date(),
      });
    } catch (error) {
      if (signal?.aborted || requestId !== requestRef.current) {
        return;
      }
      setState({
        events: fallbackEvents,
        loading: false,
        refreshing: false,
        error: errorMessage(error),
        source: 'demo',
        lastUpdated: new Date(),
      });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const kickoff = setTimeout(() => {
      load(date, 'initial', controller.signal);
    }, 0);
    const timer = setInterval(() => {
      load(date, 'refresh');
    }, 60000);
    return () => {
      controller.abort();
      clearTimeout(kickoff);
      clearInterval(timer);
    };
  }, [date, load]);

  const refresh = useCallback(() => {
    load(date, 'refresh');
  }, [date, load]);

  const getEvent = useCallback(
    (id: string) => state.events.find((item) => item.id === id),
    [state.events],
  );

  const value = useMemo<SportsContextValue>(
    () => ({ ...state, date, setDate, refresh, getEvent }),
    [state, date, refresh, getEvent],
  );

  return <SportsContext.Provider value={value}>{children}</SportsContext.Provider>;
}

export function useSports(): SportsContextValue {
  const context = useContext(SportsContext);
  if (!context) {
    throw new Error('useSports must be used inside SportsProvider');
  }
  return context;
}
