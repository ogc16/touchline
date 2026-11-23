import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';

import {
  PrimaryAction,
  Screen,
  SettingsActions,
  SettingsGroup,
  SettingsHeader,
  SettingInput,
} from '@/components/ui';
import { useTheme } from '@/theme/theme';
import { radius, spacing } from '@/theme/tokens';

export default function BettingLimitsScreen() {
  const { colors } = useTheme();
  const [dailyDeposit, setDailyDeposit] = useState('500');
  const [weeklyDeposit, setWeeklyDeposit] = useState('2000');
  const [maxStake, setMaxStake] = useState('200');
  const styles = StyleSheet.create({
    note: { fontSize: 12, color: colors.inkSoft, lineHeight: 18, marginBottom: spacing.sm },
    noteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.sm,
      backgroundColor: colors.emeraldWash,
    },
    noteText: { flex: 1, fontSize: 11, color: colors.emeraldDeep, fontWeight: '700' },
    block: { borderBottomWidth: 1, borderBottomColor: colors.line },
  });

  return (
    <Screen>
      <SettingsHeader title="Betting limits" subtitle="Caps apply immediately in this demo." />

      <SettingsGroup title="Deposit limits">
        <Text style={styles.note}>Changes take effect on your next deposit or bet.</Text>
        <View style={styles.block}>
          <SettingInput label="Daily deposit limit" value={dailyDeposit} onChangeText={setDailyDeposit} prefix="$" />
        </View>
        <SettingInput label="Weekly deposit limit" value={weeklyDeposit} onChangeText={setWeeklyDeposit} prefix="$" />
      </SettingsGroup>

      <SettingsGroup title="Stake limits">
        <SettingInput label="Maximum single stake" value={maxStake} onChangeText={setMaxStake} prefix="$" />
        <View style={styles.noteRow}>
          <ShieldCheck size={16} color={colors.emeraldDeep} strokeWidth={2.2} />
          <Text style={styles.noteText}>You can lower a limit at any time.</Text>
        </View>
      </SettingsGroup>

      <SettingsActions>
        <PrimaryAction label="Save limits" onPress={() => {}} />
      </SettingsActions>
    </Screen>
  );
}
