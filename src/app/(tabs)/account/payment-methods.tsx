import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Check, CreditCard, Plus } from 'lucide-react-native';

import { PrimaryAction, Screen, SettingsActions, SettingsGroup, SettingsHeader } from '@/components/ui';
import { useTheme } from '@/theme/theme';
import { radius, spacing, typography, type ThemeColors } from '@/theme/tokens';

export default function PaymentMethodsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Screen>
      <SettingsHeader title="Payment methods" subtitle="Manage demo deposit and withdrawal options." />

      <SettingsGroup title="Primary method">
        <View style={styles.cardRow}>
          <View style={styles.cardBrand}>
            <Text style={styles.cardBrandText}>VISA</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Visa ending 4821</Text>
            <Text style={styles.cardDetail}>Expires 08/28 · Default</Text>
          </View>
          <Check size={18} color={colors.emerald} strokeWidth={2.6} />
        </View>
        <PressableRow label="Add payment method" />
      </SettingsGroup>

      <SettingsGroup title="Payouts">
        <View style={styles.infoRow}>
          <CreditCard size={17} color={colors.emerald} strokeWidth={2.2} />
          <Text style={styles.infoText}>Withdrawals return to the default method.</Text>
        </View>
      </SettingsGroup>

      <SettingsActions>
        <PrimaryAction label="Save changes" onPress={() => {}} />
      </SettingsActions>
    </Screen>
  );
}

function PressableRow({ label }: { label: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.addRow, pressed ? styles.pressed : null]}
    >
      <Plus size={16} color={colors.emerald} strokeWidth={2.4} />
      <Text style={styles.addText}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
    cardBrand: { width: 46, height: 32, borderRadius: radius.sm, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
    cardBrandText: { fontFamily: typography.sans, fontSize: 10, fontWeight: '900', color: colors.white, letterSpacing: 0.6 },
    cardText: { flex: 1 },
    cardTitle: { fontFamily: typography.sans, fontSize: 13, fontWeight: '800', color: colors.ink },
    cardDetail: { fontFamily: typography.sans, fontSize: 11, color: colors.inkMuted, marginTop: 3 },
    addRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.line },
    addText: { fontFamily: typography.sans, fontSize: 13, fontWeight: '800', color: colors.emerald },
    pressed: { opacity: 0.7 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
    infoText: { flex: 1, fontFamily: typography.sans, fontSize: 12, color: colors.inkSoft, lineHeight: 17 },
  });
}
