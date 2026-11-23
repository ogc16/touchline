import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, Trophy, X } from 'lucide-react-native';

import { formatOdds } from '@/data/events';
import type { BetPrize, PlacedBet } from '@/data/types';
import { useAuth } from '@/store/auth';
import { useBetSlip } from '@/store/bet-slip';
import { usePrize } from '@/store/prizes';
import { useTheme } from '@/theme/theme';
import { radius, spacing, typography, type ThemeColors } from '@/theme/tokens';
import { formatMoney } from '@/utils/money';
import LoadingBall from './loading-ball';

export default function BetSlipSheet() {
  const router = useRouter();
  const { colors, elevation } = useTheme();
  const styles = useMemo(() => createStyles(colors, elevation), [colors, elevation]);
  const { height } = useWindowDimensions();
  const sheetHeight = Math.min(Math.round(height * 0.88), 760);
  const { isAuthenticated, openAuthPrompt, user } = useAuth();
  const { recordBet } = usePrize();
  const {
    selections,
    stakeInput,
    stake,
    combinedOdds,
    payout,
    stakeError,
    sheetOpen,
    balance,
    setStakeInput,
    setSheetOpen,
    removeSelection,
    clearSlip,
    placeBet,
  } = useBetSlip();
  const [receipt, setReceipt] = useState<PlacedBet | null>(null);
  const [prizeWon, setPrizeWon] = useState<BetPrize | null>(null);
  const [placing, setPlacing] = useState(false);

  function closeSheet() {
    setReceipt(null);
    setPrizeWon(null);
    setPlacing(false);
    setSheetOpen(false);
  }

  function handleStakeChange(value: string) {
    const cleaned = value.replace(/,/g, '').replace(/[^\d.]/g, '');
    const parts = cleaned.split('.');
    setStakeInput(parts.length > 2 ? `${parts[0]}.${parts[1]}` : cleaned);
  }

  async function handlePlaceBet() {
    if (placing || selections.length === 0 || stakeError !== null) {
      return;
    }
    if (!isAuthenticated) {
      openAuthPrompt('Sign in to place your bet');
      return;
    }
    setPlacing(true);
    await new Promise((resolve) => setTimeout(resolve, 650));
    let prize: BetPrize | null = null;
    if (user) {
      const award = recordBet({ stake, odds: combinedOdds, user });
      if (award) {
        prize = { kind: award.kind, amount: award.amount, label: award.title };
      }
    }
    const bet = placeBet(prize ?? undefined);
    setPlacing(false);
    if (bet) {
      setReceipt(bet);
      setPrizeWon(prize);
    }
  }

  function handleViewBets() {
    closeSheet();
    router.push('/bets');
  }

  const placeDisabled = placing || selections.length === 0 || stakeError !== null;

  return (
    <Modal
      visible={sheetOpen}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => closeSheet()}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={() => closeSheet()}
          accessibilityRole="button"
          accessibilityLabel="Close bet slip"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetPosition}
        >
          <SafeAreaView edges={['bottom']} style={[styles.sheet, { maxHeight: sheetHeight }]}>
            <View style={styles.handle} />
            {receipt ? (
              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.confirmation}>
                  <View style={styles.successMark}>
                    <Check size={30} color={colors.onEmerald} strokeWidth={3} />
                  </View>
                  <Text style={styles.confirmTitle}>Bet placed</Text>
                  <Text style={styles.confirmCopy}>
                    Your bet is active. Follow it in My bets.
                  </Text>
                  <View style={styles.receiptCard}>
                    <ReceiptRow label="Bet reference" value={receipt.id} styles={styles} />
                    <ReceiptRow label="Stake" value={formatMoney(receipt.stake)} styles={styles} />
                    <ReceiptRow
                      label="Potential return"
                      value={formatMoney(receipt.payout)}
                      styles={styles}
                    />
                   </View>
                   {prizeWon ? (
                     <View style={styles.prizeBanner}>
                       <Trophy size={20} color={colors.emeraldDeep} strokeWidth={2.4} />
                       <View style={styles.prizeCopy}>
                         <Text style={styles.prizeTitle}>{prizeWon.label} won</Text>
                         <Text style={styles.prizeAmount}>{formatMoney(prizeWon.amount)}</Text>
                       </View>
                     </View>
                   ) : null}
                 </View>
               </ScrollView>
            ) : (
              <>
                <View style={styles.sheetHeader}>
                  <View>
                    <Text style={styles.sheetTitle}>Bet slip</Text>
                    <Text style={styles.sheetSubtitle}>
                      {selections.length} {selections.length === 1 ? 'selection' : 'selections'}
                    </Text>
                  </View>
                  <View style={styles.headerActions}>
                    {selections.length > 0 ? (
                      <Pressable onPress={clearSlip} hitSlop={8} accessibilityRole="button">
                        <Text style={styles.clearText}>Clear</Text>
                      </Pressable>
                    ) : null}
                    <Pressable
                      onPress={() => closeSheet()}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel="Close bet slip"
                      style={styles.closeButton}
                    >
                      <X size={18} color={colors.ink} strokeWidth={2} />
                    </Pressable>
                  </View>
                </View>

                <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                  {selections.length === 0 ? (
                    <View style={styles.empty}>
                      <Text style={styles.emptyTitle}>No selections yet</Text>
                      <Text style={styles.emptyCopy}>
                        Tap any price on an event to add it to your slip.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.selectionList}>
                      {selections.map((selection) => (
                        <View key={selection.id} style={styles.selectionRow}>
                          <View style={styles.selectionInfo}>
                            <Text style={styles.sportTag}>{selection.sport}</Text>
                            <Text style={styles.eventLabel} numberOfLines={1}>
                              {selection.eventLabel}
                            </Text>
                            <Text style={styles.marketLabel} numberOfLines={1}>
                              {selection.marketLabel}
                            </Text>
                          </View>
                          <View style={styles.selectionRight}>
                            <Text style={styles.selectionOdds}>{formatOdds(selection.odds)}</Text>
                            <Pressable
                              onPress={() => removeSelection(selection.id)}
                              hitSlop={8}
                              accessibilityRole="button"
                              accessibilityLabel={`Remove ${selection.marketLabel}`}
                              style={styles.removeButton}
                            >
                              <X size={15} color={colors.inkMuted} strokeWidth={2} />
                            </Pressable>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.stakeBlock}>
                    <View style={styles.stakeHeader}>
                      <Text style={styles.stakeLabel}>Stake</Text>
                      <Text style={styles.balanceHint}>Balance {formatMoney(balance)}</Text>
                    </View>
                    <View style={styles.stakeInputWrap}>
                      <Text style={styles.currency}>$</Text>
                      <TextInput
                        value={stakeInput}
                        onChangeText={handleStakeChange}
                        keyboardType="decimal-pad"
                        placeholder="0.00"
                        placeholderTextColor={colors.inkMuted}
                        style={styles.stakeInput}
                        accessibilityLabel="Stake amount"
                      />
                    </View>
                    <View style={styles.quickChips}>
                      {[10, 25, 50].map((amount) => (
                        <Pressable
                          key={amount}
                          onPress={() => setStakeInput(String(amount))}
                          accessibilityRole="button"
                          style={({ pressed }) => [
                            styles.quickChip,
                            pressed ? styles.quickChipPressed : null,
                          ]}
                        >
                          <Text style={styles.quickChipText}>${amount}</Text>
                        </Pressable>
                      ))}
                      <Pressable
                        onPress={() => setStakeInput(balance.toFixed(2))}
                        accessibilityRole="button"
                        style={({ pressed }) => [
                          styles.quickChip,
                          pressed ? styles.quickChipPressed : null,
                        ]}
                      >
                        <Text style={styles.quickChipText}>Max</Text>
                      </Pressable>
                    </View>
                    {stakeError ? <Text style={styles.errorText}>{stakeError}</Text> : null}
                  </View>

                  <View style={styles.summary}>
                    <SummaryRow label="Total odds" value={formatOdds(combinedOdds)} mono styles={styles} />
                    <SummaryRow label="Stake" value={formatMoney(stake)} styles={styles} />
                    <View style={styles.summaryDivider} />
                    <SummaryRow
                      label="Potential return"
                      value={formatMoney(payout)}
                      strong
                      styles={styles}
                    />
                  </View>
                </ScrollView>

                <View style={styles.footer}>
                  <Pressable
                    onPress={handlePlaceBet}
                    disabled={placeDisabled}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: placeDisabled }}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed ? styles.pressed : null,
                      placeDisabled ? styles.primaryDisabled : null,
                    ]}
                  >
                    {placing ? <LoadingBall size={18} /> : null}
                    <Text style={styles.primaryText}>
                      {placing ? 'Placing bet' : isAuthenticated ? 'Place bet' : 'Sign in to place bet'}
                    </Text>
                  </Pressable>
                  {!isAuthenticated ? (
                    <Text style={styles.guestHint}>
                      Browsing as guest. Sign in to place a demo bet.
                    </Text>
                  ) : null}
                  <Text style={styles.disclaimer}>Prices shown are fixed at the time of placing.</Text>
                </View>
              </>
            )}

            {receipt ? (
              <View style={styles.footer}>
                <Pressable
                  onPress={handleViewBets}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null]}
                >
                  <Text style={styles.primaryText}>View my bets</Text>
                </Pressable>
                <Pressable
                  onPress={() => closeSheet()}
                  accessibilityRole="button"
                  style={styles.secondaryLink}
                >
                  <Text style={styles.secondaryLinkText}>Done</Text>
                </Pressable>
              </View>
            ) : null}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

type SheetStyles = ReturnType<typeof createStyles>;

function SummaryRow({
  label,
  value,
  mono = false,
  strong = false,
  styles,
}: {
  label: string;
  value: string;
  mono?: boolean;
  strong?: boolean;
  styles: SheetStyles;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, strong ? styles.summaryLabelStrong : null]}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          mono ? styles.monoValue : null,
          strong ? styles.summaryValueStrong : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function ReceiptRow({
  label,
  value,
  styles,
}: {
  label: string;
  value: string;
  styles: SheetStyles;
}) {
  return (
    <View style={styles.receiptRow}>
      <Text style={styles.receiptLabel}>{label}</Text>
      <Text style={styles.receiptValue}>{value}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors, elevation: ReturnType<typeof useTheme>['elevation']) {
  return StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.overlay,
    },
    sheetPosition: { width: '100%', maxWidth: 640, alignItems: 'center' },
    sheet: {
      width: '100%',
      backgroundColor: colors.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      ...elevation.raised,
    },
    handle: {
      width: 38,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.line,
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    sheetTitle: {
      fontFamily: typography.sans,
      fontSize: 20,
      fontWeight: '800',
      color: colors.ink,
      letterSpacing: -0.3,
    },
    sheetSubtitle: { fontFamily: typography.sans, fontSize: 12, color: colors.inkMuted, marginTop: 2 },
    headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    clearText: { fontFamily: typography.sans, fontSize: 13, fontWeight: '700', color: colors.emerald },
    closeButton: {
      width: 30,
      height: 30,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scroll: { flexGrow: 0, flexShrink: 1 },
    selectionList: { gap: spacing.sm },
    selectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
    },
    selectionInfo: { flex: 1, gap: 3 },
    sportTag: {
      fontFamily: typography.sans,
      fontSize: 10,
      fontWeight: '700',
      color: colors.emerald,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    eventLabel: { fontFamily: typography.sans, fontSize: 13, fontWeight: '700', color: colors.ink },
    marketLabel: { fontFamily: typography.sans, fontSize: 12, color: colors.inkMuted },
    selectionRight: { alignItems: 'flex-end', gap: spacing.sm },
    selectionOdds: {
      fontFamily: typography.mono,
      fontSize: 15,
      fontWeight: '500',
      color: colors.ink,
    },
    removeButton: { padding: 2 },
    stakeBlock: { marginTop: spacing.xl },
    stakeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    stakeLabel: { fontFamily: typography.sans, fontSize: 13, fontWeight: '700', color: colors.ink },
    balanceHint: { fontFamily: typography.sans, fontSize: 12, color: colors.inkMuted },
    stakeInputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 52,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.input,
      paddingHorizontal: spacing.md,
    },
    currency: { fontFamily: typography.mono, fontSize: 18, color: colors.inkMuted, marginRight: spacing.sm },
    stakeInput: {
      flex: 1,
      fontFamily: typography.mono,
      fontSize: 18,
      color: colors.ink,
      fontVariant: ['tabular-nums'],
    },
    quickChips: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
    quickChip: {
      flex: 1,
      height: 34,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceMuted,
    },
    quickChipPressed: { opacity: 0.65 },
    quickChipText: { fontFamily: typography.sans, fontSize: 12, fontWeight: '700', color: colors.inkSoft },
    errorText: { fontFamily: typography.sans, fontSize: 12, color: colors.red, marginTop: spacing.sm },
    summary: {
      marginTop: spacing.xl,
      padding: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.emeraldWash,
    },
    summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
    summaryLabel: { fontFamily: typography.sans, fontSize: 13, color: colors.inkSoft },
    summaryLabelStrong: { color: colors.emeraldDeep, fontWeight: '700' },
    summaryValue: { fontFamily: typography.sans, fontSize: 14, fontWeight: '700', color: colors.ink },
    monoValue: { fontFamily: typography.mono, fontVariant: ['tabular-nums'] },
    summaryValueStrong: { color: colors.emeraldDeep, fontSize: 17 },
    summaryDivider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.sm },
    footer: { paddingTop: spacing.lg },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      height: 50,
      borderRadius: radius.md,
      backgroundColor: colors.emerald,
    },
    primaryDisabled: { backgroundColor: colors.disabled },
    primaryText: {
      fontFamily: typography.sans,
      fontSize: 14,
      fontWeight: '800',
      color: colors.onEmerald,
    },
    pressed: { transform: [{ scale: 0.985 }] },
    guestHint: {
      fontFamily: typography.sans,
      fontSize: 11,
      fontWeight: '700',
      color: colors.emeraldDeep,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    disclaimer: {
      fontFamily: typography.sans,
      fontSize: 11,
      color: colors.inkMuted,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    empty: { paddingVertical: spacing.xxxl, alignItems: 'center' },
    emptyTitle: { fontFamily: typography.sans, fontSize: 15, fontWeight: '700', color: colors.ink },
    emptyCopy: {
      fontFamily: typography.sans,
      fontSize: 13,
      color: colors.inkMuted,
      textAlign: 'center',
      marginTop: spacing.sm,
      paddingHorizontal: spacing.xl,
    },
    confirmation: { alignItems: 'center', paddingTop: spacing.lg },
    successMark: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor: colors.emerald,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmTitle: {
      fontFamily: typography.sans,
      fontSize: 22,
      fontWeight: '800',
      color: colors.ink,
      marginTop: spacing.lg,
    },
    confirmCopy: {
      fontFamily: typography.sans,
      fontSize: 13,
      color: colors.inkMuted,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    prizeBanner: {
      width: '100%',
      marginTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.emeraldWash,
      borderWidth: 1,
      borderColor: colors.emerald,
    },
    prizeCopy: { flex: 1 },
    prizeTitle: { fontFamily: typography.sans, fontSize: 12, fontWeight: '800', color: colors.ink },
    prizeAmount: {
      fontFamily: typography.mono,
      fontSize: 16,
      fontWeight: '500',
      color: colors.emeraldDeep,
      marginTop: 2,
    },
    receiptCard: {
      width: '100%',
      marginTop: spacing.xl,
      padding: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
    },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    receiptLabel: { fontFamily: typography.sans, fontSize: 13, color: colors.inkMuted },
    receiptValue: {
      fontFamily: typography.mono,
      fontSize: 13,
      color: colors.ink,
      fontVariant: ['tabular-nums'],
    },
    secondaryLink: { paddingVertical: spacing.md, marginTop: spacing.sm },
    secondaryLinkText: {
      fontFamily: typography.sans,
      fontSize: 13,
      fontWeight: '700',
      color: colors.inkSoft,
    },
  });
}
