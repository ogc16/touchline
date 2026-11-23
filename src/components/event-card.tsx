import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';

import type { SportEvent } from '@/data/types';
import { useTheme } from '@/theme/theme';
import { radius, spacing, typography, type ThemeColors } from '@/theme/tokens';
import OddsButton from './odds-button';

interface EventCardProps {
  event: SportEvent;
  onPress?: () => void;
  showFooter?: boolean;
  compact?: boolean;
}

export default function EventCard({
  event,
  onPress,
  showFooter = true,
  compact = false,
}: EventCardProps) {
  const router = useRouter();
  const { colors, elevation } = useTheme();
  const styles = useMemo(() => createStyles(colors, elevation), [colors, elevation]);
  const isLive = event.status === 'live';
  const isFinished = event.status === 'finished';
  const isThreeWay = event.options.length === 3;
  const eventLabel = `${event.home} vs ${event.away}`;
  const marketCount = event.markets.reduce((total, market) => total + market.options.length, 0) + 8;

  function handleOpen() {
    if (onPress) {
      onPress();
      return;
    }
    router.push(`/event/${event.id}`);
  }

  return (
    <View style={styles.card}>
      <Pressable
        onPress={handleOpen}
        accessibilityRole="button"
        accessibilityLabel={`View markets for ${eventLabel}`}
        style={({ pressed }) => (pressed ? styles.pressed : null)}
      >
        <View style={styles.topRow}>
          <View style={styles.leagueBlock}>
            <Text style={styles.league} numberOfLines={1}>
              {event.league}
            </Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.meta} numberOfLines={1}>
              {event.region}
            </Text>
          </View>
          {isLive ? (
            <View style={styles.livePill}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE {event.minute}</Text>
            </View>
          ) : isFinished ? (
            <View style={styles.finishedPill}>
              <Text style={styles.finishedText}>FT</Text>
            </View>
          ) : (
            <Text style={styles.kickoff}>{event.kickoff}</Text>
          )}
        </View>
      </Pressable>

      <View style={[styles.bodyRow, compact ? styles.bodyRowCompact : null]}>
        <Pressable
          onPress={handleOpen}
          accessibilityRole="button"
          accessibilityLabel={`View markets for ${eventLabel}`}
          style={({ pressed }) => [styles.teamsPressable, pressed ? styles.pressed : null]}
        >
          <View style={styles.teams}>
            <TeamRow
              abbr={event.homeAbbr}
              name={event.home}
              logo={event.homeLogo}
              score={isLive || isFinished ? event.homeScore : undefined}
              styles={styles}
            />
            <TeamRow
              abbr={event.awayAbbr}
              name={event.away}
              logo={event.awayLogo}
              score={isLive || isFinished ? event.awayScore : undefined}
              styles={styles}
            />
          </View>
        </Pressable>
        <View style={[styles.oddsRow, compact ? styles.oddsRowCompact : null]}>
          {event.options.map((option) => (
            <OddsButton
              key={option.id}
              option={option}
              eventId={event.id}
              eventLabel={eventLabel}
              marketLabel={`${isThreeWay ? 'Match result' : 'Moneyline'} · ${option.label}`}
              sport={event.sport}
              disabled={isFinished}
              flexible={compact}
            />
          ))}
        </View>
      </View>

      {showFooter ? (
        <Pressable
          onPress={handleOpen}
          accessibilityRole="button"
          accessibilityLabel={`View markets for ${eventLabel}`}
          style={({ pressed }) => [styles.footer, pressed ? styles.pressed : null]}
        >
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>{event.dateLabel}</Text>
            {event.oddsProvider ? (
              <Text style={styles.providerText} numberOfLines={1}>
                {event.isRealData ? event.oddsProvider : 'Demo odds'}
              </Text>
            ) : null}
          </View>
          <View style={styles.marketLink}>
            <Text style={styles.marketText}>{marketCount} markets</Text>
            <ChevronRight size={14} color={colors.emerald} strokeWidth={2.4} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

type EventStyles = ReturnType<typeof createStyles>;

function TeamRow({
  abbr,
  name,
  logo,
  score,
  styles,
}: {
  abbr: string;
  name: string;
  logo?: string;
  score?: number;
  styles: EventStyles;
}) {
  return (
    <View style={styles.teamRow}>
      {logo ? (
        <Image source={logo} style={styles.logo} contentFit="contain" />
      ) : (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{abbr}</Text>
        </View>
      )}
      <Text style={styles.teamName} numberOfLines={1}>
        {name}
      </Text>
      {typeof score === 'number' ? <Text style={styles.score}>{score}</Text> : null}
    </View>
  );
}

function createStyles(colors: ThemeColors, elevation: ReturnType<typeof useTheme>['elevation']) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.line,
      padding: spacing.lg,
      ...elevation.card,
    },
    pressed: { opacity: 0.7 },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    leagueBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
    league: {
      fontFamily: typography.sans,
      fontSize: 12,
      fontWeight: '700',
      color: colors.ink,
      letterSpacing: 0.1,
      flexShrink: 1,
    },
    metaDot: { fontSize: 12, color: colors.inkMuted },
    meta: { fontFamily: typography.sans, fontSize: 12, color: colors.inkMuted, flexShrink: 1 },
    livePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.liveWash,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.pill,
    },
    liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.live },
    liveText: {
      fontFamily: typography.mono,
      fontSize: 10,
      fontWeight: '500',
      color: colors.live,
      letterSpacing: 0.4,
    },
    finishedPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceMuted,
    },
    finishedText: {
      fontFamily: typography.mono,
      fontSize: 10,
      fontWeight: '500',
      color: colors.inkMuted,
    },
    kickoff: {
      fontFamily: typography.mono,
      fontSize: 12,
      color: colors.inkSoft,
      fontVariant: ['tabular-nums'],
    },
    bodyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    bodyRowCompact: { flexDirection: 'column', alignItems: 'stretch', gap: spacing.md },
    teamsPressable: { flex: 1 },
    teams: { flex: 1, gap: spacing.sm },
    teamRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    badge: {
      width: 26,
      height: 26,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      fontFamily: typography.mono,
      fontSize: 9,
      fontWeight: '500',
      color: colors.inkSoft,
    },
    logo: { width: 26, height: 26 },
    teamName: {
      flex: 1,
      fontFamily: typography.sans,
      fontSize: 14,
      fontWeight: '600',
      color: colors.ink,
    },
    score: {
      fontFamily: typography.mono,
      fontSize: 15,
      fontWeight: '500',
      color: colors.ink,
      fontVariant: ['tabular-nums'],
    },
    oddsRow: { flexDirection: 'row', gap: spacing.sm },
    oddsRowCompact: { width: '100%' },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.line,
      gap: spacing.sm,
    },
    footerLeft: { flexShrink: 1 },
    footerText: { fontFamily: typography.sans, fontSize: 12, color: colors.inkMuted },
    providerText: {
      fontFamily: typography.sans,
      fontSize: 10,
      color: colors.inkMuted,
      opacity: 0.72,
      marginTop: 2,
    },
    marketLink: { flexDirection: 'row', alignItems: 'center', gap: 2, flexShrink: 0 },
    marketText: {
      fontFamily: typography.sans,
      fontSize: 12,
      fontWeight: '600',
      color: colors.emerald,
    },
  });
}
