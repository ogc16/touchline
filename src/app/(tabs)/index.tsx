import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';

import {
  Avatar,
  BalanceCard,
  NotificationButton,
  PrizeBanner,
  Wordmark,
} from '@/components/home-parts';
import {
  DataStatus,
  EmptyState,
  EventGrid,
  FilterChip,
  LoadingRows,
  Screen,
  SectionHeading,
} from '@/components/ui';
import { useResponsive } from '@/hooks/use-responsive';
import { getInitials, useAuth } from '@/store/auth';
import { useBetSlip } from '@/store/bet-slip';
import { useSports } from '@/store/sports';
import { useTheme } from '@/theme/theme';
import { radius, spacing, typography, type ThemeColors } from '@/theme/tokens';

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { contentWidth } = useResponsive();
  const routerRef = useRouter();
  const { balance } = useBetSlip();
  const { user, isAuthenticated } = useAuth();
  const { events, loading, refreshing, error, source, lastUpdated, refresh } = useSports();
  const [sport, setSport] = useState('All');

  const liveEvents = useMemo(
    () =>
      events
        .filter((event) => event.status === 'live' && (sport === 'All' || event.sport === sport))
        .slice(0, 4),
    [events, sport],
  );
  const upcomingEvents = useMemo(
    () =>
      events
        .filter((event) => event.status === 'upcoming' && (sport === 'All' || event.sport === sport))
        .slice(0, 12),
    [events, sport],
  );
  const finishedEvents = useMemo(
    () =>
      events
        .filter((event) => event.status === 'finished' && (sport === 'All' || event.sport === sport))
        .slice(0, 6),
    [events, sport],
  );
  const quickLeagues = useMemo(() => {
    const seen = new Set<string>();
    return events
      .filter((event) => event.status === 'upcoming' || event.status === 'live')
      .filter((event) => {
        if (seen.has(event.leagueKey) || event.leagueKey === 'demo') {
          return false;
        }
        seen.add(event.leagueKey);
        return true;
      })
      .slice(0, 6);
  }, [events]);

  return (
    <Screen>
      <View style={styles.headerRow}>
        <Wordmark />
        <View style={styles.headerActions}>
          <NotificationButton />
          <Avatar
            initials={isAuthenticated && user ? getInitials(user.name) : 'GV'}
          />
        </View>
      </View>

      <View style={styles.greeting}>
        <Text style={styles.greetingTitle}>
          Good evening, {isAuthenticated && user ? user.name.split(' ')[0] : 'there'}
        </Text>
        <Text style={styles.greetingSubtitle}>Here is what is on the board today.</Text>
      </View>

      <DataStatus
        loading={loading}
        refreshing={refreshing}
        source={source}
        error={error}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />

      <BalanceCard balance={balance} />

      <PrizeBanner />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search events"
        onPress={() => routerRef.push('/search')}
        style={({ pressed }) => [styles.searchBar, pressed ? styles.pressed : null]}
      >
        <Search size={17} color={colors.inkMuted} strokeWidth={2.2} />
        <Text style={styles.searchText}>Search teams, leagues, events</Text>
      </Pressable>

      <View style={styles.quickGrid}>
        {quickLeagues.map((event) => (
          <Pressable
            key={event.leagueKey}
            accessibilityRole="button"
            onPress={() => routerRef.push(`/league/${event.leagueKey}`)}
            style={({ pressed }) => [styles.quickTile, pressed ? styles.pressed : null]}
          >
            <Text style={styles.quickLeague} numberOfLines={1}>
              {event.league}
            </Text>
            <Text style={styles.quickRegion} numberOfLines={1}>
              {event.region}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.filterWrap}>
        <FilterChip
          label="All sports"
          active={sport === 'All'}
          onPress={() => setSport('All')}
        />
        {['Soccer', 'Basketball', 'American Football', 'Ice Hockey', 'Baseball', 'Tennis'].map(
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

      <SectionHeading
        title="Live now"
        subtitle={liveEvents.length ? `${liveEvents.length} events in play` : 'No events in play'}
        action="See all"
        onAction={() => routerRef.push('/live')}
      />

      {loading ? (
        <LoadingRows count={1} />
      ) : liveEvents.length > 0 ? (
        <EventGrid events={liveEvents} />
      ) : (
        <EmptyState
          title="No live events right now"
          detail="Check the upcoming board or choose another sport."
        />
      )}

      <SectionHeading
        title="Upcoming"
        subtitle="Prices are refreshed from the live feed"
        action="All sports"
        onAction={() => routerRef.push('/sports')}
      />

      {loading ? (
        <LoadingRows count={3} />
      ) : upcomingEvents.length > 0 ? (
        <EventGrid events={upcomingEvents} />
      ) : (
        <EmptyState
          title="Nothing on this market"
          detail="Choose another sport to see more events."
        />
      )}

      {finishedEvents.length > 0 ? (
        <View>
          <SectionHeading
            title="Recently finished"
            subtitle="Final scores"
            action="Results"
            onAction={() => routerRef.push('/results')}
          />
          <EventGrid events={finishedEvents} />
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => routerRef.push('/results')}
        style={[styles.resultsButton, { maxWidth: contentWidth }]}
      >
        <Text style={styles.resultsButtonText}>View all results</Text>
      </Pressable>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    greeting: { marginTop: spacing.xl },
    greetingTitle: {
      fontFamily: typography.sans,
      fontSize: 25,
      fontWeight: '800',
      color: colors.ink,
      letterSpacing: -0.6,
    },
    greetingSubtitle: { fontFamily: typography.sans, fontSize: 13, color: colors.inkMuted, marginTop: 3 },
    searchBar: {
      marginTop: spacing.xl,
      height: 44,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    searchText: { fontFamily: typography.sans, fontSize: 13, color: colors.inkMuted },
    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
    quickTile: {
      width: '31%',
      minWidth: 96,
      flexGrow: 1,
      minHeight: 56,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      padding: spacing.md,
      justifyContent: 'center',
    },
    quickLeague: { fontFamily: typography.sans, fontSize: 12, fontWeight: '800', color: colors.ink },
    quickRegion: { fontFamily: typography.sans, fontSize: 10, color: colors.inkMuted, marginTop: 3 },
    filterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
    pressed: { opacity: 0.72 },
    resultsButton: {
      marginTop: spacing.xl,
      minHeight: 44,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resultsButtonText: { fontFamily: typography.sans, fontSize: 13, fontWeight: '800', color: colors.emerald },
  });
}
