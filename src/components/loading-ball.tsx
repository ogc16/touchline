import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme/theme';
import { radius, spacing, typography, type ThemeColors } from '@/theme/tokens';

interface LoadingBallProps {
  size?: number;
  label?: string;
  fullScreen?: boolean;
}

export default function LoadingBall({
  size = 36,
  label,
  fullScreen = false,
}: LoadingBallProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const spin = useSharedValue(0);

  useEffect(() => {
    spin.value = withRepeat(
      withTiming(1, { duration: 850, easing: Easing.linear }),
      -1,
      false,
    );
  }, [spin]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value * 360}deg` }],
  }));

  const ball = (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Loading'}
      style={[styles.wrap, label ? styles.wrapWithLabel : null]}
    >
      <Animated.View
        style={[
          styles.ball,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: Math.max(2, Math.round(size * 0.09)),
          },
          animatedStyle,
        ]}
      >
        <View
          style={[
            styles.core,
            {
              width: size * 0.24,
              height: size * 0.24,
              borderRadius: radius.pill,
            },
          ]}
        />
      </Animated.View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{ball}</View>;
  }

  return ball;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    fullScreen: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.canvas,
      zIndex: 20,
    },
    wrap: { alignItems: 'center', justifyContent: 'center' },
    wrapWithLabel: { gap: spacing.md },
    ball: {
      borderColor: colors.line,
      borderTopColor: colors.emerald,
      alignItems: 'center',
      justifyContent: 'center',
    },
    core: { backgroundColor: colors.emerald },
    label: {
      fontFamily: typography.sans,
      fontSize: 12,
      fontWeight: '700',
      color: colors.inkSoft,
      letterSpacing: 0.2,
    },
  });
}
