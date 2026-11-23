import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ReceiptText } from 'lucide-react-native';

import { formatOdds } from '@/data/events';
import type { PlacedBet } from '@/data/types';
import { EmptyState, PageTitle, Screen, SectionHeading } from '@/components/ui';
import { useBetSlip } from '@/store/bet-slip';
import { useTheme } from '@/theme/theme';
import { radius, spacing, typography, type ThemeColors } from '@/theme/tokens';
import { formatMoney } from '@/utils/money';

export default function BetsScreen() {
  const { colors, elevation } = useTheme();
  const styles = useMemo(() => createStyles(colors, elevation), [colors, elevation]);
  const { placedBets, selections, setSheetOpen, balance } = useBetSlip();
  const totalStaked = placedBets.reduce((total, bet) => total + bet.stake, 0);
  const potentialReturn = placedBets.reduce((total, bet) => total + bet.payout, 0);

  return (
    <Screen>
      <PageTitle title="My bets" subtitle="Track your active bets and returns." />

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>AVAILABLE</Text>
          <Text style={styles.summaryValue}>{formatMoney(balance)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>STAKED</Text>
          <Text style={styles.summaryValue}>{formatMoney(totalStaked)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>TO RETURN</Text>
          <Text style={[styles.summaryValue, styles.returnValue]}>{formatMoney(potentialReturn)}</Text>
        </View>
      </View>

      {selections.length > 0 ? (
        <Pressable
          onPress={() => setSheetOpen(true)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.slipCta, pressed ? styles.pressed : null]}
        >
          <View style={styles.slipCtaLeft}>
            <ReceiptText size={18} color={colors.onEmerald} strokeWidth={2.2} />
            <Text style={styles.slipCtaText}>Continue to bet slip</Text>
          </View>
          <View style={styles.slipCtaCount}>
            <Text style={styles.slipCtaCountText}>{selections.length}</Text>
          </View>
        </Pressable>
      ) : null}

      <SectionHeading title="Open bets" subtitle={`${placedBets.length} in your history`} />
      {placedBets.length === 0 ? (
        <EmptyState title="No bets yet" detail="Your placed bets will appear here." />
      ) : (
        <View style={styles.betList}>
          {placedBets.map((bet) => (
            <BetCard key={bet.id} bet={bet} styles={styles} />
          ))}
        </View>
      )}
    </Screen>
  );
}

type BetStyles = ReturnType<typeof createStyles>;

function BetCard({ bet, styles }: { bet: PlacedBet; styles: BetStyles }) {
  const { colors } = useTheme();
  const combined = bet.selections.reduce((total, item) => total * item.odds, 1);
  const statusColor = bet.status === 'won' ? colors.emerald : bet.status === 'lost' ? colors.red : colors.inkSoft;

  return (
    <View style={styles.betCard}>
      <View style={styles.betTop}>
        <View>
          <Text style={styles.betRef}>{bet.id}</Text>
          <Text style={styles.betTime}>{bet.placedAt}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{bet.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.betSelections}>
        {bet.selections.map((selection) => (
          <View key={selection.id} style={styles.betSelection}>
            <View style={styles.betSelectionText}>
              <Text style={styles.betEvent} numberOfLines={1}>
                {selection.eventLabel}
              </Text>
              <Text style={styles.betMarket} numberOfLines={1}>
                {selection.marketLabel}
              </Text>
            </View>
            <Text style={styles.betOdds}>{formatOdds(selection.odds)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.betBottom}>
        <View style={styles.betBottomItem}>
          <Text style={styles.betBottomLabel}>STAKE</Text>
          <Text style={styles.betBottomValue}>{formatMoney(bet.stake)}</Text>
        </View>
        <View style={styles.betBottomDivider} />
        <View style={styles.betBottomItem}>
          <Text style={styles.betBottomLabel}>COMBINED ODDS</Text>
          <Text style={styles.betBottomValue}>{formatOdds(combined)}</Text>
        </View>
        <View style={styles.betBottomDivider} />
        <View style={styles.betBottomItem}>
          <Text style={styles.betBottomLabel}>TO RETURN</Text>
          <Text style={[styles.betBottomValue, styles.returnValue]}>{formatMoney(bet.payout)}</Text>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors, elevation: ReturnType<typeof useTheme>['elevation']) {
  return StyleSheet.create({
    summaryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.line,
      padding: spacing.lg,
      marginTop: spacing.md,
      ...elevation.card,
    },
    summaryItem: { flex: 1, gap: 6 },
    summaryLabel: { fontFamily: typography.mono, fontSize: 9, color: colors.inkMuted, letterSpacing: 0.6 },
    summaryValue: {
      fontFamily: typography.mono,
      fontSize: 14,
      fontWeight: '500',
      color: colors.ink,
      fontVariant: ['tabular-nums'],
    },
    returnValue: { color: colors.emerald },
    summaryDivider: { width: 1, height: 32, backgroundColor: colors.line, marginHorizontal: spacing.sm },
    slipCta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.emerald,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      height: 50,
      marginTop: spacing.md,
    },
    slipCtaLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    slipCtaText: { fontFamily: typography.sans, fontSize: 13, fontWeight: '700', color: colors.onEmerald },
    slipCtaCount: {
      minWidth: 24,
      height: 24,
      borderRadius: radius.sm,
      backgroundColor: colors.onNavyBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    slipCtaCountText: { fontFamily: typography.mono, fontSize: 12, color: colors.white },
    pressed: { transform: [{ scale: 0.985 }] },
    betList: { gap: spacing.md },
    betCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.line,
      padding: spacing.lg,
      ...elevation.card,
    },
    betTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    betRef: { fontFamily: typography.mono, fontSize: 12, fontWeight: '500', color: colors.ink },
    betTime: { fontFamily: typography.sans, fontSize: 11, color: colors.inkMuted, marginTop: 2 },
    statusPill: { borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 4 },
    statusText: { fontFamily: typography.mono, fontSize: 9, letterSpacing: 0.5 },
    betSelections: { marginTop: spacing.md, gap: spacing.sm },
    betSelection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
    },
    betSelectionText: { flex: 1 },
    betEvent: { fontFamily: typography.sans, fontSize: 12, fontWeight: '700', color: colors.ink },
    betMarket: { fontFamily: typography.sans, fontSize: 11, color: colors.inkMuted, marginTop: 2 },
    betOdds: { fontFamily: typography.mono, fontSize: 12, color: colors.ink },
    betBottom: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
    betBottomItem: { flex: 1 },
    betBottomLabel: { fontFamily: typography.mono, fontSize: 8, color: colors.inkMuted, letterSpacing: 0.5 },
    betBottomValue: {
      fontFamily: typography.mono,
      fontSize: 13,
      color: colors.ink,
      marginTop: 4,
      fontVariant: ['tabular-nums'],
    },
    betBottomDivider: { width: 1, height: 30, backgroundColor: colors.line, marginHorizontal: spacing.sm },
  });
}
