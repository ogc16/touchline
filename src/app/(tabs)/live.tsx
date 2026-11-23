import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  DataStatus,
  EmptyState,
  EventGrid,
  FilterChip,
  LoadingRows,
  PageTitle,
  Screen,
  SectionHeading,
} from '@/components/ui';
import { useTheme } from '@/theme/theme';
import { radius, spacing, typography, type ThemeColors } from '@/theme/tokens';
import { useSports } from '@/store/sports';

export default function LiveScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { events, loading, refreshing, error, source, lastUpdated, refresh } = useSports();
  const [sport, setSport] = useState('All');

  const liveEvents = useMemo(
    () =>
      events.filter(
        (event) => event.status === 'live' && (sport === 'All' || event.sport === sport),
      ),
    [events, sport],
  );
  const soonEvents = useMemo(
    () =>
      events
        .filter((event) => event.status === 'upcoming' && (sport === 'All' || event.sport === sport))
        .slice(0, 8),
    [events, sport],
  );

  return (
    <Screen>
      <PageTitle title="Live betting" subtitle="In-play prices move with the action." />

      <DataStatus
        loading={loading}
        refreshing={refreshing}
        source={source}
        error={error}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />

      <View style={styles.filters}>
        {['All', 'Soccer', 'Basketball', 'American Football', 'Ice Hockey', 'Baseball', 'Tennis'].map(
          (item) => (
            <FilterChip
              key={item}
              label={item}
              active={sport === item}
              onPress={() => setSport(item)}
            />
          ),
        )}
      </View>

      <View style={styles.countRow}>
        <SectionHeading title={`${liveEvents.length} events in play`} />
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {loading ? (
        <LoadingRows count={2} />
      ) : liveEvents.length > 0 ? (
        <EventGrid events={liveEvents} />
      ) : (
        <EmptyState
          title="No live events here"
          detail="Try a different sport, or start with the next events on the board."
        />
      )}

      <SectionHeading title="Starting soon" subtitle="Pre-match prices" />
      {loading ? (
        <LoadingRows count={2} />
      ) : soonEvents.length > 0 ? (
        <EventGrid events={soonEvents} />
      ) : (
        <EmptyState title="No upcoming events" detail="Refresh the feed to check again." />
      )}
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
    countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.liveWash,
      paddingHorizontal: spacing.sm,
      paddingVertical: 5,
      borderRadius: radius.pill,
    },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.live },
    liveText: { fontFamily: typography.mono, fontSize: 10, color: colors.live, letterSpacing: 0.6 },
  });
}
