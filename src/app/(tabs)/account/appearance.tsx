import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Monitor, Moon, Sun } from 'lucide-react-native';

import {
  Screen,
  SettingsActions,
  SettingsGroup,
  SettingsHeader,
  SettingsRow,
  SettingSwitch,
  PrimaryAction,
} from '@/components/ui';
import { useTheme } from '@/theme/theme';
import { radius, spacing, typography, type ThemeColors } from '@/theme/tokens';

export default function AppearanceScreen() {
  const { colors, preference, setPreference, mode } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Screen>
      <SettingsHeader title="Appearance" subtitle="Choose how Touchline looks on this device." />

      <SettingsGroup title="Theme">
        <SettingsRow
          icon={<Monitor size={18} color={colors.emerald} strokeWidth={2.2} />}
          label="System"
          detail="Follow your device setting"
          badge={preference === 'system' ? 'ACTIVE' : undefined}
          onPress={() => setPreference('system')}
        />
        <SettingsRow
          icon={<Sun size={18} color={colors.emerald} strokeWidth={2.2} />}
          label="Light"
          detail="Bright sharp odds board"
          badge={preference === 'light' ? 'ACTIVE' : undefined}
          onPress={() => setPreference('light')}
        />
        <SettingsRow
          icon={<Moon size={18} color={colors.emerald} strokeWidth={2.2} />}
          label="Dark"
          detail="Low-light viewing"
          badge={preference === 'dark' ? 'ACTIVE' : undefined}
          onPress={() => setPreference('dark')}
        />
      </SettingsGroup>

      <SettingsGroup title="Motion">
        <SettingSwitch
          label="Reduce motion"
          detail="Minimise odds flashes and transitions"
          value={reduceMotion}
          onValueChange={setReduceMotion}
        />
      </SettingsGroup>

      <View style={styles.previewCard}>
        <View style={styles.previewTop}>
          <Text style={styles.previewLeague}>PREMIER LEAGUE</Text>
          <Text style={styles.previewKickoff}>20:00</Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.previewTeam}>Brentford</Text>
          <Text style={styles.previewOdds}>2.25</Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.previewTeam}>Everton</Text>
          <Text style={styles.previewOdds}>3.15</Text>
        </View>
      </View>

      <SettingsActions>
        <PrimaryAction label={`Using ${mode} theme`} onPress={() => {}} />
      </SettingsActions>
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    previewCard: {
      marginTop: spacing.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    previewTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    previewLeague: { fontFamily: typography.sans, fontSize: 10, fontWeight: '900', color: colors.inkMuted, letterSpacing: 0.8 },
    previewKickoff: { fontFamily: typography.mono, fontSize: 11, color: colors.inkSoft },
    previewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 },
    previewTeam: { fontFamily: typography.sans, fontSize: 14, fontWeight: '700', color: colors.ink },
    previewOdds: {
      minWidth: 64,
      textAlign: 'center',
      paddingVertical: 8,
      borderRadius: radius.sm,
      backgroundColor: colors.emeraldWash,
      fontFamily: typography.mono,
      fontSize: 13,
      color: colors.emeraldDeep,
    },
  });
}
