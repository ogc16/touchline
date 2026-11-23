import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Minus, Plus } from 'lucide-react-native';

import { sports } from '@/data/events';
import { useTheme } from '@/theme/theme';
import { radius, spacing, typography, type ThemeColors } from '@/theme/tokens';
import { formatMoney } from '@/utils/money';

export function Wordmark() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.wordmarkRow}>
      <View style={styles.mark}>
        <View style={styles.markLine} />
      </View>
      <Text style={styles.wordmark}>TOUCHLINE</Text>
    </View>
  );
}

export function NotificationButton() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Notifications"
      onPress={() => router.push('/notifications')}
      style={({ pressed }) => [styles.iconButton, pressed ? styles.pressed : null]}
    >
      <Bell size={19} color={colors.ink} strokeWidth={2} />
      <View style={styles.notificationDot} />
    </Pressable>
  );
}

export function Avatar({ initials = 'PM' }: { initials?: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open account"
      onPress={() => router.push('/account')}
      style={({ pressed }) => [styles.avatar, pressed ? styles.pressed : null]}
    >
      <Text style={styles.avatarText}>{initials}</Text>
    </Pressable>
  );
}

export function BalanceCard({ balance }: { balance: number }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  return (
    <View style={styles.balanceCard}>
      <View style={styles.balanceTop}>
        <View>
          <Text style={styles.balanceLabel}>Available balance</Text>
          <Text style={styles.balanceAmount}>{formatMoney(balance)}</Text>
        </View>
        <View style={styles.accountTag}>
          <Text style={styles.accountTagText}>VERIFIED</Text>
        </View>
      </View>
      <View style={styles.balanceActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Deposit funds"
          onPress={() => router.push('/account/payment-methods')}
          style={({ pressed }) => [styles.depositButton, pressed ? styles.pressed : null]}
        >
          <Plus size={16} color={colors.onEmerald} strokeWidth={2.4} />
          <Text style={styles.depositText}>Deposit</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Withdraw funds"
          onPress={() => router.push('/account/payment-methods')}
          style={({ pressed }) => [styles.withdrawButton, pressed ? styles.pressed : null]}
        >
          <Minus size={16} color={colors.white} strokeWidth={2.4} />
          <Text style={styles.withdrawText}>Withdraw</Text>
        </Pressable>
      </View>
    </View>
  );
}

interface SportChipsProps {
  active: string;
  onChange: (sport: string) => void;
}

export function SportChips({ active, onChange }: SportChipsProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContent}
    >
      {sports.map((sport) => {
        const isActive = sport === active;
        return (
          <Pressable
            key={sport}
            onPress={() => onChange(sport)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [
              styles.chip,
              isActive ? styles.chipActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>{sport}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function SectionHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wordmarkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    mark: {
      width: 24,
      height: 24,
      borderRadius: 7,
      backgroundColor: colors.emerald,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markLine: {
      width: 10,
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.onEmerald,
      transform: [{ rotate: '-40deg' }],
    },
    wordmark: {
      fontFamily: typography.sans,
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 1.1,
      color: colors.ink,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notificationDot: {
      position: 'absolute',
      top: 9,
      right: 10,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.emerald,
      borderWidth: 1,
      borderColor: colors.surface,
    },
    pressed: { transform: [{ scale: 0.95 }], opacity: 0.86 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.emeraldWash,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontFamily: typography.sans,
      fontSize: 13,
      fontWeight: '800',
      color: colors.emeraldDeep,
    },
    balanceCard: {
      backgroundColor: colors.navy,
      borderRadius: radius.xl,
      padding: spacing.xl,
      marginTop: spacing.xl,
    },
    balanceTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    balanceLabel: { fontFamily: typography.sans, fontSize: 12, fontWeight: '600', color: colors.onNavySoft },
    balanceAmount: {
      fontFamily: typography.mono,
      fontSize: 30,
      fontWeight: '500',
      color: colors.white,
      marginTop: spacing.sm,
      fontVariant: ['tabular-nums'],
      letterSpacing: -0.8,
    },
    accountTag: {
      borderWidth: 1,
      borderColor: colors.onNavyBorder,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    accountTagText: {
      fontFamily: typography.mono,
      fontSize: 9,
      color: colors.lime,
      letterSpacing: 0.8,
    },
    balanceActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
    depositButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      flex: 1,
      height: 42,
      borderRadius: radius.md,
      backgroundColor: colors.emerald,
    },
    depositText: { fontFamily: typography.sans, fontSize: 13, fontWeight: '700', color: colors.onEmerald },
    withdrawButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      flex: 1,
      height: 42,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.onNavyBorder,
    },
    withdrawText: { fontFamily: typography.sans, fontSize: 13, fontWeight: '700', color: colors.white },
    chipsContent: { paddingVertical: spacing.xl, gap: spacing.sm },
    chip: {
      height: 36,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
    chipText: { fontFamily: typography.sans, fontSize: 13, fontWeight: '600', color: colors.inkSoft },
    chipTextActive: { color: colors.white },
    sectionHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontFamily: typography.sans,
      fontSize: 17,
      fontWeight: '800',
      color: colors.ink,
      letterSpacing: -0.2,
    },
    sectionAction: { fontFamily: typography.sans, fontSize: 13, fontWeight: '700', color: colors.emerald },
  });
}
