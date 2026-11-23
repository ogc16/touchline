import { useSports } from '@/store/sports';

export function useOddsFeed() {
  const { events, loading, refreshing, error, source, lastUpdated, refresh } = useSports();
  return { events, loading, refreshing, error, source, lastUpdated, refresh };
}
