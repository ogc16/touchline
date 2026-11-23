import { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { formatOdds } from '@/data/events';
import type { OddsOption, Sport } from '@/data/types';
import { useBetSlip } from '@/store/bet-slip';
import { useTheme } from '@/theme/theme';
import { radius, typography, type ThemeColors } from '@/theme/tokens';

interface OddsButtonProps {
  option: OddsOption;
  eventId: string;
  eventLabel: string;
  marketLabel: string;
  sport: Sport;
  disabled?: boolean;
  flexible?: boolean;
}

export default function OddsButton({
  option,
  eventId,
  eventLabel,
  marketLabel,
  sport,
  disabled = false,
  flexible = false,
}: OddsButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { selections, toggleSelection } = useBetSlip();
  const selected = selections.some((item) => item.id === option.id);
  const previousOdds = useRef(option.odds);
  const upGlow = useSharedValue(0);
  const downGlow = useSharedValue(0);

  useEffect(() => {
    if (option.odds === previousOdds.current) {
      return;
    }
    if (option.odds > previousOdds.current) {
      upGlow.value = 1;
      upGlow.value = withTiming(0, { duration: 800 });
    } else {
      downGlow.value = 1;
      downGlow.value = withTiming(0, { duration: 800 });
    }
    previousOdds.current = option.odds;
  }, [downGlow, option.odds, upGlow]);

  const upStyle = useAnimatedStyle(() => ({ opacity: upGlow.value }));
  const downStyle = useAnimatedStyle(() => ({ opacity: downGlow.value }));

  function handlePress() {
    if (disabled) {
      return;
    }
    toggleSelection({
      id: option.id,
      eventId,
      eventLabel,
      marketLabel,
      odds: option.odds,
      sport,
    });
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${marketLabel}, odds ${formatOdds(option.odds)}`}
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.button,
        flexible ? styles.flexible : null,
        selected ? styles.selected : null,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <Animated.View pointerEvents="none" style={[styles.glow, styles.glowUp, upStyle]} />
      <Animated.View pointerEvents="none" style={[styles.glow, styles.glowDown, downStyle]} />
      <Text style={[styles.odds, selected ? styles.oddsSelected : null]}>
        {formatOdds(option.odds)}
      </Text>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    button: {
      minWidth: 62,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceMuted,
      overflow: 'hidden',
    },
    flexible: { flex: 1, minWidth: 0 },
    selected: { backgroundColor: colors.emeraldWash },
    disabled: { opacity: 0.45 },
    pressed: { transform: [{ scale: 0.95 }] },
    glow: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    glowUp: { backgroundColor: colors.emerald, opacity: 0 },
    glowDown: { backgroundColor: colors.red, opacity: 0 },
    odds: {
      color: colors.ink,
      fontFamily: typography.mono,
      fontSize: 14,
      fontWeight: '500',
      fontVariant: ['tabular-nums'],
      zIndex: 1,
    },
    oddsSelected: { color: colors.emeraldDeep, fontWeight: '700' },
  });
}
