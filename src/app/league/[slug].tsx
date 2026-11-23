import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { DataStatus, EmptyState, EventGrid, LoadingRows, Screen, SectionHeading, SettingsHeader } from '@/components/ui';
import { useSports } from '@/store/sports';

export default function LeagueScreen() {
  const params = useLocalSearchParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const { events, loading, refreshing, error, source, lastUpdated, refresh } = useSports();

  const filtered = useMemo(
    () => events.filter((event) => event.leagueKey === slug).slice(0, 24),
    [events, slug],
  );
  const leagueName = filtered[0]?.league ?? (slug ? slug.replace(/\./g, ' ') : 'League');

  return (
    <Screen>
      <SettingsHeader title={leagueName} subtitle="Fixtures and prices for this competition." />
      <DataStatus
        loading={loading}
        refreshing={refreshing}
        source={source}
        error={error}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />
      <SectionHeading title="Fixtures" subtitle={`${filtered.length} events`} />
      {loading ? (
        <LoadingRows count={3} />
      ) : filtered.length > 0 ? (
        <EventGrid events={filtered} />
      ) : (
        <EmptyState title="No fixtures found" detail="This league may not have events today." />
      )}
    </Screen>
  );
}
