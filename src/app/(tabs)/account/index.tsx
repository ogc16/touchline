import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  CircleHelp,
  CreditCard,
  FileText,
  Palette,
  Settings2,
  ShieldCheck,
} from 'lucide-react-native';

import { PageTitle, Screen, SettingsGroup, SettingsRow } from '@/components/ui';
import { useBetSlip } from '@/store/bet-slip';
import { useTheme } from '@/theme/theme';
import { radius, spacing, typography, type ThemeColors } from '@/theme/tokens';
import { formatMoney } from '@/utils/money';

export default function AccountScreen() {
  const router = useRouter();
  const { colors, preference } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { balance, placedBets } = useBetSlip();
  const themeLabel = preference === 'system' ? 'System' : preference === 'dark' ? 'Dark' : 'Light';

  return (
    <Screen>
      <PageTitle title="Account" subtitle="Your profile, wallet, and preferences." />

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>PM</Text>
        </View>
        <View style={styles.profileText}>
          <Text style={styles.profileName}>Priya Mehta</Text>
          <Text style={styles.profileEmail}>priya@example.com</Text>
        </View>
        <View style={styles.verifiedPill}>
          <Text style={styles.verifiedText}>VERIFIED</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>BALANCE</Text>
          <Text style={styles.statValue}>{formatMoney(balance)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>BETS PLACED</Text>
          <Text style={styles.statValue}>{placedBets.length}</Text>
        </View>
      </View>

      <SettingsGroup title="Wallet">
        <SettingsRow
          icon={<CreditCard size={18} color={colors.emerald} strokeWidth={2.2} />}
          label="Payment methods"
          detail="Visa ending 4821"
          badge="DEFAULT"
          onPress={() => router.push('/account/payment-methods')}
        />
        <SettingsRow
          icon={<Settings2 size={18} color={colors.emerald} strokeWidth={2.2} />}
          label="Betting limits"
          detail="Deposit and stake caps"
          onPress={() => router.push('/account/betting-limits')}
        />
      </SettingsGroup>

      <SettingsGroup title="Preferences">
        <SettingsRow
          icon={<Palette size={18} color={colors.emerald} strokeWidth={2.2} />}
          label="Appearance"
          detail="Theme and text size"
          value={themeLabel}
          onPress={() => router.push('/account/appearance')}
        />
        <SettingsRow
          icon={<Bell size={18} color={colors.emerald} strokeWidth={2.2} />}
          label="Notifications"
          detail="Bet updates and price alerts"
          badge="ON"
          onPress={() => router.push('/account/notifications')}
        />
      </SettingsGroup>

      <SettingsGroup title="Support">
        <SettingsRow
          icon={<ShieldCheck size={18} color={colors.emerald} strokeWidth={2.2} />}
          label="Verification"
          detail="Identity and payment checks"
          value="Complete"
          onPress={() => router.push('/account/verification')}
        />
        <SettingsRow
          icon={<CircleHelp size={18} color={colors.emerald} strokeWidth={2.2} />}
          label="Help centre"
          detail="Betting FAQs and support"
          onPress={() => router.push('/account/help')}
        />
        <SettingsRow
          icon={<FileText size={18} color={colors.emerald} strokeWidth={2.2} />}
          label="Terms and privacy"
          detail="Demo terms and responsible betting"
          onPress={() => router.push('/account/terms')}
        />
      </SettingsGroup>

      <Text style={styles.footer}>Touchline is a demo. No real money is used.</Text>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: radius.md,
      backgroundColor: colors.emeraldWash,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontFamily: typography.sans, fontSize: 15, fontWeight: '800', color: colors.emeraldDeep },
    profileText: { flex: 1 },
    profileName: { fontFamily: typography.sans, fontSize: 15, fontWeight: '800', color: colors.ink },
    profileEmail: { fontFamily: typography.sans, fontSize: 11, color: colors.inkMuted, marginTop: 3 },
    verifiedPill: { backgroundColor: colors.emeraldWash, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 4 },
    verifiedText: { fontFamily: typography.mono, fontSize: 8, color: colors.emeraldDeep },
    statsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    statLabel: { fontFamily: typography.mono, fontSize: 9, color: colors.inkMuted, letterSpacing: 0.6 },
    statValue: { fontFamily: typography.mono, fontSize: 16, color: colors.ink, marginTop: 6, fontVariant: ['tabular-nums'] },
    footer: { fontFamily: typography.sans, fontSize: 11, color: colors.inkMuted, textAlign: 'center', marginTop: spacing.xl },
  });
}
