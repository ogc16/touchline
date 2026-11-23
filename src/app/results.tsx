import { useMemo } from 'react';

import { DataStatus, EmptyState, EventGrid, LoadingRows, Screen, SectionHeading, SettingsHeader } from '@/components/ui';
import { useSports } from '@/store/sports';

export default function ResultsScreen() {
  const { events, loading, refreshing, error, source, lastUpdated, refresh } = useSports();
  const finished = useMemo(() => events.filter((event) => event.status === 'finished'), [events]);
  const grouped = useMemo(() => {
    const groups = new Map<string, typeof finished>();
    finished.forEach((event) => {
      const key = event.dateLabel || 'Earlier';
      groups.set(key, [...(groups.get(key) ?? []), event]);
    });
    return Array.from(groups.entries());
  }, [finished]);

  return (
    <Screen>
      <SettingsHeader title="Results" subtitle="Final scores from the live feed." />
      <DataStatus
        loading={loading}
        refreshing={refreshing}
        source={source}
        error={error}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />
      {loading ? (
        <LoadingRows count={3} />
      ) : grouped.length === 0 ? (
        <EmptyState title="No final results" detail="Finished events will appear here." />
      ) : (
        grouped.map(([label, items]) => (
          <SectionGroup key={label} label={label} events={items} />
        ))
      )}
    </Screen>
  );
}

function SectionGroup({ label, events }: { label: string; events: Parameters<typeof EventGrid>[0]['events'] }) {
  return (
    <>
      <SectionHeading title={label} subtitle={`${events.length} events`} />
      <EventGrid events={events} />
    </>
  );
}
