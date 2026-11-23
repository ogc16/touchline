import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import OddsButton from '@/components/odds-button';
import { EmptyState, LoadingRows, Screen, SectionHeading } from '@/components/ui';
import { formatOdds } from '@/data/events';
import type { OddsMarket, SportEvent } from '@/data/types';
import { useResponsive } from '@/hooks/use-responsive';
import { useSports } from '@/store/sports';
import { useTheme } from '@/theme/theme';
import { radius, spacing, typography, type ThemeColors } from '@/theme/tokens';

export default function EventScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { colors, elevation } = useTheme();
  const { isCompact } = useResponsive();
  const styles = useMemo(() => createStyles(colors, elevation), [colors, elevation]);
  const { getEvent, loading } = useSports();
  const event = id ? getEvent(id) : undefined;
  const markets = useMemo(() => buildMarkets(event), [event]);
  const isFinished = event?.status === 'finished';
  const eventLabel = event ? `${event.home} vs ${event.away}` : '';

  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.backIcon, pressed ? styles.pressed : null]}
        >
          <ArrowLeft size={20} color={colors.ink} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.topTitle}>Event details</Text>
        <View style={styles.topSpacer} />
      </View>

      {loading && !event ? (
        <View style={styles.loadingWrap}>
          <LoadingRows count={2} />
        </View>
      ) : !event ? (
        <EmptyState
          title="Event unavailable"
          detail="This market is no longer on the board."
        />
      ) : (
        <>
          <View style={styles.eventCard}>
            <View style={styles.eventTop}>
              <Text style={styles.league} numberOfLines={1}>
                {event.league}
              </Text>
              {event.status === 'live' ? (
                <View style={styles.livePill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE {event.minute}</Text>
                </View>
              ) : isFinished ? (
                <View style={styles.finishedPill}>
                  <Text style={styles.finishedText}>FT</Text>
                </View>
              ) : (
                <Text style={styles.kickoff}>
                  {event.dateLabel} · {event.kickoff}
                </Text>
              )}
            </View>

            <TeamRow event={event} side="home" styles={styles} showScore={!isCompact} />
            <TeamRow event={event} side="away" styles={styles} showScore={!isCompact} />

            <View style={styles.eventFooter}>
              <Text style={styles.region} numberOfLines={1}>
                {event.venue ? `${event.venue} · ` : ''}
                {event.region}
              </Text>
              <Text style={styles.sourceLabel}>
                {event.isRealData ? event.oddsProvider ?? 'ESPN' : 'Demo odds'}
              </Text>
            </View>
          </View>

          {markets.map((market) => (
            <View key={market.id} style={styles.marketCard}>
              <View style={styles.marketHeader}>
                <Text style={styles.marketTitle}>{market.title}</Text>
                <Text style={styles.marketHint}>{market.hint}</Text>
              </View>
              <View style={styles.marketOptions}>
                {market.options.map((option) => (
                  <View key={option.id} style={styles.optionRow}>
                    <Text style={styles.optionLabel} numberOfLines={2}>
                      {option.label}
                    </Text>
                    <View style={[styles.optionButton, { width: isCompact ? 104 : 132 }]}>
                      <OddsButton
                        option={option}
                        eventId={event.id}
                        eventLabel={eventLabel}
                        marketLabel={`${market.title} · ${option.label}`}
                        sport={event.sport}
                        disabled={isFinished}
                      />
                    </View>
                    <Text style={styles.optionFraction}>
                      {formatOdds(option.odds / (1 + option.odds))}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}

          <SectionHeading title="More from this league" subtitle={event.league} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/league/${event.leagueKey}`)}
            style={styles.leagueButton}
          >
            <Text style={styles.leagueButtonText}>View {event.league} fixtures</Text>
          </Pressable>

          <Text style={styles.disclaimer}>
            Odds are subject to change. Selections are locked at the price shown when added to
            your slip.
          </Text>
        </>
      )}
    </Screen>
  );
}

type EventStyles = ReturnType<typeof createStyles>;

function TeamRow({
  event,
  side,
  styles,
  showScore,
}: {
  event: SportEvent;
  side: 'home' | 'away';
  styles: EventStyles;
  showScore: boolean;
}) {
  const name = side === 'home' ? event.home : event.away;
  const abbr = side === 'home' ? event.homeAbbr : event.awayAbbr;
  const logo = side === 'home' ? event.homeLogo : event.awayLogo;
  const score = side === 'home' ? event.homeScore : event.awayScore;
  return (
    <View style={styles.teamRow}>
      {logo ? (
        <Image source={logo} style={styles.teamLogo} contentFit="contain" />
      ) : (
        <View style={styles.teamAbbrBox}>
          <Text style={styles.teamAbbr}>{abbr}</Text>
        </View>
      )}
      <Text style={styles.teamName} numberOfLines={1}>
        {name}
      </Text>
      {typeof score === 'number' && showScore ? <Text style={styles.teamScore}>{score}</Text> : null}
      {typeof score === 'number' && !showScore ? (
        <Text style={styles.teamScoreSmall}>{score}</Text>
      ) : null}
    </View>
  );
}

function buildMarkets(event: SportEvent | undefined): OddsMarket[] {
  if (!event) {
    return [];
  }
  if (event.markets.length > 0) {
    return event.markets;
  }
  return [
    {
      id: `${event.id}-primary`,
      title: event.options.length === 3 ? 'Match result' : 'Moneyline',
      hint: event.sport === 'Soccer' ? 'Full time' : 'Game',
      options: event.options,
    },
  ];
}

function createStyles(colors: ThemeColors, elevation: ReturnType<typeof useTheme>['elevation']) {
  return StyleSheet.create({
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backIcon: {
      width: 38,
      height: 38,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: { transform: [{ scale: 0.94 }] },
    topTitle: { fontFamily: typography.sans, fontSize: 14, fontWeight: '800', color: colors.ink },
    topSpacer: { width: 38 },
    loadingWrap: { marginTop: spacing.xl },
    eventCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.line,
      padding: spacing.lg,
      marginTop: spacing.md,
      ...elevation.card,
    },
    eventTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    league: { fontFamily: typography.sans, fontSize: 12, fontWeight: '800', color: colors.ink, flexShrink: 1 },
    livePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.liveWash,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.live },
    liveText: { fontFamily: typography.mono, fontSize: 10, color: colors.live },
    finishedPill: { backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
    finishedText: { fontFamily: typography.mono, fontSize: 10, color: colors.inkMuted },
    kickoff: { fontFamily: typography.mono, fontSize: 11, color: colors.inkSoft },
    teamRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 6 },
    teamAbbrBox: {
      width: 34,
      height: 34,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    teamAbbr: { fontFamily: typography.mono, fontSize: 10, color: colors.inkSoft },
    teamLogo: { width: 34, height: 34 },
    teamName: { flex: 1, fontFamily: typography.sans, fontSize: 15, fontWeight: '700', color: colors.ink },
    teamScore: { fontFamily: typography.mono, fontSize: 18, fontWeight: '500', color: colors.ink },
    teamScoreSmall: { fontFamily: typography.mono, fontSize: 15, fontWeight: '500', color: colors.ink },
    eventFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.line,
    },
    region: { fontFamily: typography.sans, fontSize: 11, color: colors.inkMuted, flexShrink: 1 },
    sourceLabel: { fontFamily: typography.mono, fontSize: 9, color: colors.emerald },
    marketCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.line,
      padding: spacing.lg,
      marginTop: spacing.md,
      ...elevation.card,
    },
    marketHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: spacing.md },
    marketTitle: { fontFamily: typography.sans, fontSize: 15, fontWeight: '800', color: colors.ink },
    marketHint: { fontFamily: typography.sans, fontSize: 11, color: colors.inkMuted },
    marketOptions: { gap: spacing.sm },
    optionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    optionLabel: { flex: 1, fontFamily: typography.sans, fontSize: 13, fontWeight: '600', color: colors.inkSoft },
    optionButton: { maxWidth: '100%' },
    optionFraction: {
      width: 46,
      textAlign: 'right',
      fontFamily: typography.mono,
      fontSize: 11,
      color: colors.inkMuted,
      fontVariant: ['tabular-nums'],
    },
    leagueButton: {
      minHeight: 44,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.md,
    },
    leagueButtonText: { fontFamily: typography.sans, fontSize: 13, fontWeight: '800', color: colors.emerald },
    disclaimer: {
      fontFamily: typography.sans,
      fontSize: 11,
      lineHeight: 17,
      color: colors.inkMuted,
      textAlign: 'center',
      marginTop: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
  });
}
