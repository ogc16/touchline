import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Trophy } from 'lucide-react-native';

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

const sportLinks = [
  { label: 'Soccer', slug: 'soccer', detail: 'Premier League, LaLiga, Serie A' },
  { label: 'Basketball', slug: 'basketball', detail: 'NBA and more' },
  { label: 'American Football', slug: 'american-football', detail: 'NFL' },
  { label: 'Ice Hockey', slug: 'ice-hockey', detail: 'NHL' },
  { label: 'Baseball', slug: 'baseball', detail: 'MLB' },
  { label: 'Tennis', slug: 'tennis', detail: 'Tour events' },
];

export default function SportsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { events, loading, refreshing, error, source, lastUpdated, refresh } = useSports();
  const [activeSport, setActiveSport] = useState('All');

  const groups = useMemo(
    () =>
      ['Soccer', 'Basketball', 'American Football', 'Ice Hockey', 'Baseball', 'Tennis']
        .filter((sport) => activeSport === 'All' || activeSport === sport)
        .map((sport) => ({
          sport,
          items: events
            .filter((event) => event.sport === sport && event.status !== 'finished')
            .slice(0, 8),
        }))
        .filter((group) => group.items.length > 0),
    [events, activeSport],
  );

  const leagues = useMemo(() => {
    const seen = new Set<string>();
    return events
      .filter((event) => {
        if (seen.has(event.leagueKey) || event.leagueKey === 'demo') {
          return false;
        }
        seen.add(event.leagueKey);
        return true;
      })
      .slice(0, 8);
  }, [events]);

  return (
    <Screen>
      <PageTitle title="Sports" subtitle="Browse the full board by sport and league." />

      <DataStatus
        loading={loading}
        refreshing={refreshing}
        source={source}
        error={error}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Search events"
        onPress={() => router.push('/search')}
        style={({ pressed }) => [styles.searchBar, pressed ? styles.pressed : null]}
      >
        <Search size={17} color={colors.inkMuted} strokeWidth={2.2} />
        <Text style={styles.searchText}>Search teams, leagues, events</Text>
      </Pressable>

      <SectionHeading title="Popular sports" subtitle="Tap to filter the board" />
      <View style={styles.sportGrid}>
        {sportLinks.map((sport) => (
          <Pressable
            key={sport.slug}
            accessibilityRole="button"
            onPress={() => router.push(`/sport/${sport.slug}`)}
            style={({ pressed }) => [styles.sportTile, pressed ? styles.pressed : null]}
          >
            <View style={styles.sportIcon}>
              <Trophy size={16} color={colors.emerald} strokeWidth={2.2} />
            </View>
            <Text style={styles.sportLabel} numberOfLines={1}>
              {sport.label}
            </Text>
            <Text style={styles.sportDetail} numberOfLines={2}>
              {sport.detail}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionHeading title="Top leagues" subtitle="Live and upcoming fixtures" />
      <View style={styles.leagueList}>
        {leagues.map((event) => (
          <Pressable
            key={event.leagueKey}
            accessibilityRole="button"
            onPress={() => router.push(`/league/${event.leagueKey}`)}
            style={({ pressed }) => [styles.leagueRow, pressed ? styles.pressed : null]}
          >
            <View style={styles.leagueText}>
              <Text style={styles.leagueName} numberOfLines={1}>
                {event.league}
              </Text>
              <Text style={styles.leagueRegion} numberOfLines={1}>
                {event.region}
              </Text>
            </View>
            <Text style={styles.leagueCount}>{event.status === 'live' ? 'LIVE' : 'OPEN'}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeading title="All events" subtitle="Choose a sport to narrow the list" />
      <View style={styles.filters}>
        {['All', 'Soccer', 'Basketball', 'American Football', 'Ice Hockey', 'Baseball', 'Tennis'].map(
          (sport) => (
            <FilterChip
              key={sport}
              label={sport}
              active={activeSport === sport}
              onPress={() => setActiveSport(sport)}
            />
          ),
        )}
      </View>

      {loading ? (
        <LoadingRows count={3} />
      ) : groups.length === 0 ? (
        <EmptyState title="No events found" detail="Try another sport or refresh the feed." />
      ) : (
        groups.map((group) => (
          <View key={group.sport} style={styles.group}>
            <SectionHeading title={group.sport} subtitle={`${group.items.length} fixtures`} />
            <EventGrid events={group.items} />
          </View>
        ))
      )}
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    searchBar: {
      marginTop: spacing.md,
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
    sportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
    sportTile: {
      width: '31%',
      minWidth: 108,
      flexGrow: 1,
      minHeight: 120,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      padding: spacing.md,
    },
    sportIcon: {
      width: 30,
      height: 30,
      borderRadius: radius.sm,
      backgroundColor: colors.emeraldWash,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    sportLabel: { fontFamily: typography.sans, fontSize: 12, fontWeight: '800', color: colors.ink },
    sportDetail: { fontFamily: typography.sans, fontSize: 10, color: colors.inkMuted, marginTop: 4 },
    leagueList: { gap: spacing.sm },
    leagueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    leagueText: { flex: 1 },
    leagueName: { fontFamily: typography.sans, fontSize: 13, fontWeight: '800', color: colors.ink },
    leagueRegion: { fontFamily: typography.sans, fontSize: 11, color: colors.inkMuted, marginTop: 3 },
    leagueCount: { fontFamily: typography.mono, fontSize: 10, color: colors.emerald },
    filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    group: { marginTop: spacing.lg },
    pressed: { opacity: 0.72 },
  });
}
