import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { DataStatus, EmptyState, EventGrid, LoadingRows, Screen, SectionHeading, SettingsHeader } from '@/components/ui';
import type { Sport } from '@/data/types';
import { useSports } from '@/store/sports';

const sportBySlug: Record<string, Sport> = {
  soccer: 'Soccer',
  basketball: 'Basketball',
  'american-football': 'American Football',
  'ice-hockey': 'Ice Hockey',
  baseball: 'Baseball',
  tennis: 'Tennis',
};

export default function SportScreen() {
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const sport = sportBySlug[slug ?? ''] ?? 'Soccer';
  const { events, loading, refreshing, error, source, lastUpdated, refresh } = useSports();

  const filtered = useMemo(
    () => events.filter((event) => event.sport === sport).slice(0, 24),
    [events, sport],
  );

  return (
    <Screen>
      <SettingsHeader title={sport} subtitle="Fixtures and prices across competitions." />
      <DataStatus
        loading={loading}
        refreshing={refreshing}
        source={source}
        error={error}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />
      <SectionHeading title="All events" subtitle={`${filtered.length} fixtures`} />
      {loading ? (
        <LoadingRows count={3} />
      ) : filtered.length > 0 ? (
        <EventGrid events={filtered} />
      ) : (
        <EmptyState title={`No ${sport} events`} detail="Try another sport or refresh the feed." />
      )}
    </Screen>
  );
}
