import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';

import { EmptyState, EventGrid, FilterChip, LoadingRows, Screen, SectionHeading, SettingsHeader, DataStatus } from '@/components/ui';
import { useSports } from '@/store/sports';
import { useTheme } from '@/theme/theme';
import { radius, spacing, typography } from '@/theme/tokens';

export default function SearchScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      height: 48,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
    },
    input: { flex: 1, fontFamily: typography.sans, fontSize: 14, color: colors.ink },
    filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  }), [colors]);
  const { events, loading, refreshing, error, source, lastUpdated, refresh } = useSports();
  const [query, setQuery] = useState('');
  const [sport, setSport] = useState('All');

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return events.filter((event) => {
      const matchesSport = sport === 'All' || event.sport === sport;
      const haystack = `${event.home} ${event.away} ${event.league} ${event.region}`.toLowerCase();
      return matchesSport && (!needle || haystack.includes(needle));
    });
  }, [events, query, sport]);

  return (
    <Screen>
      <SettingsHeader title="Search" subtitle="Find teams, leagues, and events." />
      <DataStatus
        loading={loading}
        refreshing={refreshing}
        source={source}
        error={error}
        lastUpdated={lastUpdated}
        onRefresh={refresh}
      />
      <View style={styles.inputWrap}>
        <Search size={18} color={colors.inkMuted} strokeWidth={2.2} />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Try Arsenal, NBA, LaLiga"
          placeholderTextColor={colors.inkMuted}
          style={styles.input}
        />
      </View>
      <View style={styles.filters}>
        {['All', 'Soccer', 'Basketball', 'American Football', 'Ice Hockey', 'Baseball', 'Tennis'].map((item) => (
          <FilterChip key={item} label={item} active={sport === item} onPress={() => setSport(item)} />
        ))}
      </View>
      <SectionHeading title={`${results.length} results`} subtitle={query ? `For “${query}”` : 'All available events'} />
      {loading ? (
        <LoadingRows count={2} />
      ) : results.length > 0 ? (
        <EventGrid events={results} />
      ) : (
        <EmptyState title="No matches" detail="Try a team, league, or another sport." />
      )}
    </Screen>
  );
}
