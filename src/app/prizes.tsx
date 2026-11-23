import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Clock3, Gift, LockKeyhole, Sparkles, Trophy } from 'lucide-react-native';

import { PageTitle, PrimaryAction, Screen, SectionHeading } from '@/components/ui';
import { useAuth } from '@/store/auth';
import { useBetSlip } from '@/store/bet-slip';
import { usePrize, type LuckyDraw, type PrizeAward } from '@/store/prizes';
import { useTheme } from '@/theme/theme';
import { radius, spacing, typography, type ThemeColors } from '@/theme/tokens';
import { formatMoney } from '@/utils/money';

export default function PrizesScreen() {
  const router = useRouter();
  const { colors, elevation } = useTheme();
  const styles = useMemo(() => createStyles(colors, elevation), [colors, elevation]);
  const { user, isAuthenticated, openAuthPrompt } = useAuth();
  const { creditBalance } = useBetSlip();
  const {
    jackpot,
    awards,
    dailyWinner,
    luckyNumber,
    luckyDraw,
    luckyAward,
    myAwards,
    unclaimedMyCount,
    totalAwarded,
    lastDrawDate,
    todayKey,
    claimPrize,
    setLuckyNumber,
  } = usePrize();
  const [notice, setNotice] = useState<string | null>(null);

  function handleClaim(award: PrizeAward) {
    if (!user) {
      openAuthPrompt('Sign in to claim your prize');
      return;
    }
    if (award.winnerEmail !== user.email) {
      return;
    }
    const amount = claimPrize(award.id);
    if (amount !== null) {
      creditBalance(amount);
      setNotice(`${formatMoney(amount)} added to your balance.`);
    }
  }

  function handleLuckySelect(value: number) {
    setLuckyNumber(value);
    setNotice(
      luckyDraw
        ? `Lucky number ${value} saved for tomorrow's draw.`
        : `Lucky number ${value} saved. Good luck in today's draw.`,
    );
  }

  return (
    <Screen>
      <PageTitle title="Prizes" subtitle="Daily draws and accumulator jackpots." />

      {notice ? (
        <View style={styles.notice}>
          <Check size={16} color={colors.emeraldDeep} strokeWidth={2.6} />
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      ) : null}

      <View style={styles.jackpotCard}>
        <View style={styles.jackpotTop}>
          <View style={styles.jackpotIcon}>
            <Trophy size={22} color={colors.onNavy} strokeWidth={2.4} />
          </View>
          <View style={styles.jackpotCopy}>
            <Text style={styles.jackpotLabel}>CURRENT JACKPOT</Text>
            <Text style={styles.jackpotAmount}>{formatMoney(jackpot)}</Text>
            <Text style={styles.jackpotSub}>
              3% of every demo stake adds to the pot. 8x+ accumulators can trigger a payout.
            </Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(100, (jackpot / 20000) * 100)}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>$0</Text>
          <Text style={styles.progressLabel}>$20k next tier</Text>
        </View>
      </View>

      <View style={styles.dailyCard}>
        <View style={styles.dailyHeader}>
          <Gift size={19} color={colors.emeraldDeep} strokeWidth={2.3} />
          <Text style={styles.dailyTitle}>Daily random winner</Text>
          <View style={styles.dailyAmount}>
            <Text style={styles.dailyAmountText}>{formatMoney(250)}</Text>
          </View>
        </View>
        {dailyWinner ? (
          <>
            <Text style={styles.winnerName}>{dailyWinner.winnerName}</Text>
            <Text style={styles.winnerMeta}>
              Chosen for {dailyWinner.dateLabel} · {dailyWinner.note}
            </Text>
          </>
        ) : (
          <Text style={styles.winnerMeta}>Today&apos;s draw is being prepared.</Text>
        )}
        <View style={styles.drawRow}>
          <Clock3 size={14} color={colors.inkMuted} strokeWidth={2.2} />
          <Text style={styles.drawCopy}>
            {lastDrawDate === todayKey
              ? "Today's draw is complete. A new winner is picked tomorrow."
              : 'The draw runs automatically once per day for local accounts.'}
          </Text>
        </View>
      </View>

      <LuckyNumberCard
        styles={styles}
        isAuthenticated={isAuthenticated}
        luckyNumber={luckyNumber}
        luckyDraw={luckyDraw}
        luckyAward={luckyAward}
        onSignIn={() => openAuthPrompt('Sign in to pick your lucky number')}
        onSelect={handleLuckySelect}
      />

      <SectionHeading
        title="My prizes"
        subtitle={isAuthenticated ? `${unclaimedMyCount} unclaimed` : 'Sign in to claim'}
        action="How it works"
        onAction={() => router.push('/account/help')}
      />

      {!isAuthenticated ? (
        <View style={styles.guestCard}>
          <LockKeyhole size={20} color={colors.emeraldDeep} strokeWidth={2.2} />
          <View style={styles.guestCopy}>
            <Text style={styles.guestTitle}>Browsing as guest</Text>
            <Text style={styles.guestText}>You can view all prizes. Sign in to claim yours.</Text>
          </View>
          <PrimaryAction label="Sign in" onPress={() => openAuthPrompt('Sign in to claim prizes')} />
        </View>
      ) : myAwards.length === 0 ? (
        <View style={styles.emptyCard}>
          <Sparkles size={20} color={colors.inkMuted} strokeWidth={2.2} />
          <Text style={styles.emptyText}>No prizes yet. Place an 8x+ accumulator, pick a lucky number, or wait for the daily draw.</Text>
        </View>
      ) : (
        <View style={styles.awardList}>
          {myAwards.map((award) => (
            <AwardRow key={award.id} award={award} styles={styles} onClaim={() => handleClaim(award)} />
          ))}
        </View>
      )}

      <SectionHeading title="Recent winners" subtitle={`${totalAwarded.toFixed(2)} awarded in this demo`} />
      <View style={styles.awardList}>
        {awards.slice(0, 6).map((award) => (
          <AwardRow key={award.id} award={award} styles={styles} compact />
        ))}
      </View>
    </Screen>
  );
}

type PrizeStyles = ReturnType<typeof createStyles>;

function LuckyNumberCard({
  styles,
  isAuthenticated,
  luckyNumber,
  luckyDraw,
  luckyAward,
  onSignIn,
  onSelect,
}: {
  styles: PrizeStyles;
  isAuthenticated: boolean;
  luckyNumber: number | null;
  luckyDraw: LuckyDraw | null;
  luckyAward: PrizeAward | null;
  onSignIn: () => void;
  onSelect: (value: number) => void;
}) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState<number | null>(null);
  const selected = draft ?? luckyNumber ?? 1;
  const numbers = useMemo(() => Array.from({ length: 50 }, (_, index) => index + 1), []);

  const resultCopy = luckyAward
    ? luckyAward.note
    : luckyNumber
      ? 'No match for your number today.'
      : 'The number is drawn once per day.';

  return (
    <View style={styles.luckyCard}>
      <View style={styles.luckyHeader}>
        <Sparkles size={19} color={colors.lime} strokeWidth={2.3} />
        <Text style={styles.luckyTitle}>Lucky number draw</Text>
        <View style={styles.luckyPrizePill}>
          <Text style={styles.luckyPrizeText}>$500</Text>
        </View>
      </View>
      <Text style={styles.luckySub}>
        Pick 1–50. Exact match wins $500; one number away wins $75.
      </Text>

      <View style={styles.luckyResultRow}>
        <View style={styles.luckyBall}>
          <Text style={styles.luckyBallText}>{luckyDraw ? luckyDraw.winningNumber : '--'}</Text>
        </View>
        <View style={styles.luckyResultCopy}>
          <Text style={styles.luckyResultTitle}>
            {luckyDraw ? `Today's number: ${luckyDraw.winningNumber}` : "Today's number pending"}
          </Text>
          <Text style={styles.winnerMeta}>{resultCopy}</Text>
        </View>
      </View>

      {!isAuthenticated ? (
        <View style={styles.luckyAuthRow}>
          <Text style={styles.luckyHint}>Sign in to pick and save your number.</Text>
          <PrimaryAction label="Sign in" onPress={onSignIn} />
        </View>
      ) : (
        <>
          <Text style={styles.luckyPickLabel}>
            {luckyNumber ? `Your number: ${luckyNumber}` : 'Choose your number'}
          </Text>
          <View style={styles.numberGrid}>
            {numbers.map((number) => (
              <Pressable
                key={number}
                accessibilityRole="button"
                onPress={() => setDraft(number)}
                style={[styles.numberCell, selected === number ? styles.numberCellActive : null]}
              >
                <Text style={[styles.numberText, selected === number ? styles.numberTextActive : null]}>
                  {number}
                </Text>
              </Pressable>
            ))}
          </View>
          <PrimaryAction
            label={luckyNumber === selected ? 'Number saved' : `Save number ${selected}`}
            onPress={() => {
              onSelect(selected);
              setDraft(null);
            }}
            disabled={luckyNumber === selected}
          />
          {luckyDraw && luckyNumber !== null && luckyNumber !== selected ? (
            <Text style={styles.luckyFootnote}>Changes apply to tomorrow&apos;s draw.</Text>
          ) : null}
          {luckyAward && !luckyAward.claimed ? (
            <Text style={styles.luckyWinCopy}>
              You won {formatMoney(luckyAward.amount)} — claim it in My prizes.
            </Text>
          ) : null}
        </>
      )}
    </View>
  );
}

function AwardRow({
  award,
  styles,
  onClaim,
  compact = false,
}: {
  award: PrizeAward;
  styles: PrizeStyles;
  onClaim?: () => void;
  compact?: boolean;
}) {
  const { colors } = useTheme();
  const claimed = award.claimed;
  return (
    <View style={[styles.awardRow, compact ? styles.awardRowCompact : null]}>
      <View style={styles.awardIcon}>
        {award.kind === 'jackpot' ? (
          <Trophy size={16} color={colors.emeraldDeep} strokeWidth={2.3} />
        ) : award.kind === 'lucky' ? (
          <Sparkles size={16} color={colors.emeraldDeep} strokeWidth={2.3} />
        ) : (
          <Gift size={16} color={colors.emeraldDeep} strokeWidth={2.3} />
        )}
      </View>
      <View style={styles.awardCopy}>
        <Text style={styles.awardTitle}>{award.title}</Text>
        <Text style={styles.awardMeta}>
          {award.winnerName} · {award.dateLabel}
        </Text>
        {!compact ? <Text style={styles.awardNote}>{award.note}</Text> : null}
      </View>
      <View style={styles.awardRight}>
        <Text style={styles.awardAmount}>{formatMoney(award.amount)}</Text>
        {!compact ? (
          onClaim && !claimed ? (
            <Text style={styles.claimLink} onPress={onClaim}>
              CLAIM
            </Text>
          ) : (
            <Text style={styles.claimedText}>{claimed ? 'CLAIMED' : 'AUTO'}</Text>
          )
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors, elevation: ReturnType<typeof useTheme>['elevation']) {
  return StyleSheet.create({
    notice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.sm,
      backgroundColor: colors.emeraldWash,
      marginBottom: spacing.md,
    },
    noticeText: { flex: 1, fontFamily: typography.sans, fontSize: 12, fontWeight: '700', color: colors.emeraldDeep },
    jackpotCard: {
      padding: spacing.xl,
      borderRadius: radius.lg,
      backgroundColor: colors.navy,
      ...elevation.card,
    },
    jackpotTop: { flexDirection: 'row', gap: spacing.md },
    jackpotIcon: {
      width: 42,
      height: 42,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.onNavyBorder,
    },
    jackpotCopy: { flex: 1 },
    jackpotLabel: {
      fontFamily: typography.mono,
      fontSize: 9,
      color: colors.lime,
      letterSpacing: 1,
    },
    jackpotAmount: {
      fontFamily: typography.mono,
      fontSize: 30,
      color: colors.white,
      marginTop: 4,
      fontVariant: ['tabular-nums'],
    },
    jackpotSub: {
      fontFamily: typography.sans,
      fontSize: 11,
      lineHeight: 17,
      color: colors.onNavySoft,
      marginTop: spacing.sm,
    },
    progressTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.onNavyBorder,
      marginTop: spacing.lg,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: 3, backgroundColor: colors.lime },
    progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
    progressLabel: { fontFamily: typography.mono, fontSize: 9, color: colors.onNavySoft },
    dailyCard: {
      marginTop: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    dailyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    dailyTitle: { flex: 1, fontFamily: typography.sans, fontSize: 14, fontWeight: '800', color: colors.ink },
    dailyAmount: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.emeraldWash },
    dailyAmountText: { fontFamily: typography.mono, fontSize: 11, color: colors.emeraldDeep },
    winnerName: { fontFamily: typography.sans, fontSize: 19, fontWeight: '800', color: colors.ink, marginTop: spacing.md },
    winnerMeta: { fontFamily: typography.sans, fontSize: 11, color: colors.inkMuted, marginTop: 3 },
    drawRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginTop: spacing.md },
    drawCopy: { flex: 1, fontFamily: typography.sans, fontSize: 11, lineHeight: 16, color: colors.inkSoft },
    luckyCard: {
      marginTop: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    luckyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    luckyTitle: { flex: 1, fontFamily: typography.sans, fontSize: 14, fontWeight: '800', color: colors.ink },
    luckyPrizePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: colors.navy },
    luckyPrizeText: { fontFamily: typography.mono, fontSize: 11, color: colors.lime },
    luckySub: { fontFamily: typography.sans, fontSize: 11, lineHeight: 16, color: colors.inkSoft, marginTop: spacing.sm },
    luckyResultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.emeraldWash,
    },
    luckyBall: {
      width: 46,
      height: 46,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.navy,
    },
    luckyBallText: { fontFamily: typography.mono, fontSize: 19, color: colors.lime },
    luckyResultCopy: { flex: 1 },
    luckyResultTitle: { fontFamily: typography.sans, fontSize: 13, fontWeight: '800', color: colors.ink },
    luckyAuthRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
    luckyHint: { flex: 1, fontFamily: typography.sans, fontSize: 11, color: colors.inkSoft },
    luckyPickLabel: {
      fontFamily: typography.mono,
      fontSize: 10,
      color: colors.inkMuted,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    numberGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: spacing.md },
    numberCell: {
      width: 30,
      height: 30,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    numberCellActive: { backgroundColor: colors.emerald, borderColor: colors.emerald },
    numberText: { fontFamily: typography.mono, fontSize: 11, color: colors.ink },
    numberTextActive: { color: colors.white },
    luckyFootnote: { fontFamily: typography.sans, fontSize: 10, color: colors.inkMuted, marginTop: spacing.sm },
    luckyWinCopy: {
      fontFamily: typography.sans,
      fontSize: 11,
      fontWeight: '800',
      color: colors.emeraldDeep,
      marginTop: spacing.sm,
    },
    guestCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      backgroundColor: colors.emeraldWash,
    },
    guestCopy: { flex: 1 },
    guestTitle: { fontFamily: typography.sans, fontSize: 13, fontWeight: '800', color: colors.ink },
    guestText: { fontFamily: typography.sans, fontSize: 11, color: colors.inkSoft, marginTop: 2 },
    emptyCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    emptyText: { flex: 1, fontFamily: typography.sans, fontSize: 12, color: colors.inkSoft, lineHeight: 18 },
    awardList: { gap: spacing.sm },
    awardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
    },
    awardRowCompact: { paddingVertical: spacing.sm },
    awardIcon: {
      width: 34,
      height: 34,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.emeraldWash,
    },
    awardCopy: { flex: 1 },
    awardTitle: { fontFamily: typography.sans, fontSize: 13, fontWeight: '800', color: colors.ink },
    awardMeta: { fontFamily: typography.sans, fontSize: 11, color: colors.inkMuted, marginTop: 2 },
    awardNote: { fontFamily: typography.sans, fontSize: 10, color: colors.inkSoft, marginTop: 2 },
    awardRight: { alignItems: 'flex-end' },
    awardAmount: {
      fontFamily: typography.mono,
      fontSize: 13,
      color: colors.ink,
      fontVariant: ['tabular-nums'],
    },
    claimLink: {
      fontFamily: typography.mono,
      fontSize: 9,
      color: colors.emerald,
      marginTop: 5,
    },
    claimedText: {
      fontFamily: typography.mono,
      fontSize: 9,
      color: colors.inkMuted,
      marginTop: 5,
    },
  });
}
