import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronUp } from 'lucide-react-native';

import { formatOdds } from '@/data/events';
import { useResponsive } from '@/hooks/use-responsive';
import { useBetSlip } from '@/store/bet-slip';
import { useTheme } from '@/theme/theme';
import { layout, radius, spacing, typography, type ThemeColors } from '@/theme/tokens';

export default function BetSlipBar() {
  const insets = useSafeAreaInsets();
  const { colors, elevation } = useTheme();
  const { contentWidth } = useResponsive();
  const styles = useMemo(() => createStyles(colors, elevation), [colors, elevation]);
  const { selections, combinedOdds, setSheetOpen } = useBetSlip();

  if (selections.length === 0) {
    return null;
  }

  return (
    <Pressable
      onPress={() => setSheetOpen(true)}
      accessibilityRole="button"
      accessibilityLabel={`Open bet slip with ${selections.length} selections`}
      style={({ pressed }) => [
        styles.bar,
        {
          bottom: layout.tabBarHeight + insets.bottom + 8,
          left: spacing.lg,
          right: spacing.lg,
          maxWidth: contentWidth,
        },
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={styles.left}>
        <View style={styles.count}>
          <Text style={styles.countText}>{selections.length}</Text>
        </View>
        <Text style={styles.label}>Bet slip</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.oddsLabel}>ODDS</Text>
        <Text style={styles.odds}>{formatOdds(combinedOdds)}</Text>
        <ChevronUp size={16} color={colors.white} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors, elevation: ReturnType<typeof useTheme>['elevation']) {
  return StyleSheet.create({
    bar: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignSelf: 'center',
      height: layout.slipHeight,
      borderRadius: radius.lg,
      backgroundColor: colors.navy,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      zIndex: 11,
      ...elevation.raised,
    },
    pressed: { transform: [{ scale: 0.985 }] },
    left: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    count: {
      minWidth: 24,
      height: 24,
      borderRadius: radius.sm,
      backgroundColor: colors.emerald,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 5,
    },
    countText: { fontFamily: typography.mono, fontSize: 12, fontWeight: '500', color: colors.white },
    label: { fontFamily: typography.sans, fontSize: 14, fontWeight: '700', color: colors.white },
    right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    oddsLabel: {
      fontFamily: typography.mono,
      fontSize: 9,
      color: colors.onNavySoft,
      letterSpacing: 0.8,
    },
    odds: {
      fontFamily: typography.mono,
      fontSize: 15,
      fontWeight: '500',
      color: colors.lime,
      fontVariant: ['tabular-nums'],
    },
  });
}
