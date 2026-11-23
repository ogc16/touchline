import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Radio, ReceiptText, Trophy, UserRound } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { useBetSlip } from '@/store/bet-slip';
import { useTheme } from '@/theme/theme';
import { layout, spacing, typography, type ThemeColors } from '@/theme/tokens';

const icons: Record<string, LucideIcon> = {
  index: Home,
  sports: Trophy,
  live: Radio,
  bets: ReceiptText,
  account: UserRound,
  profile: UserRound,
};

const labels: Record<string, string> = {
  index: 'Home',
  sports: 'Sports',
  live: 'Live',
  bets: 'My bets',
  account: 'Account',
  profile: 'Account',
};

interface TabRoute {
  key: string;
  name: string;
}

interface TabBarProps {
  state: { routes: TabRoute[]; index: number };
  navigateToTab: (routeKey: string) => void;
}

export default function TabBar({ state, navigateToTab }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors, elevation } = useTheme();
  const styles = useMemo(() => createStyles(colors, elevation), [colors, elevation]);
  const { selections } = useBetSlip();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const Icon = icons[route.name] ?? Home;
        const color = focused ? colors.emerald : colors.inkMuted;
        const showBadge = route.name === 'bets' && selections.length > 0;

        return (
          <Pressable
            key={route.key}
            onPress={() => navigateToTab(route.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={labels[route.name] ?? route.name}
            style={({ pressed }) => [styles.tab, pressed ? styles.pressed : null]}
          >
            <View style={styles.iconWrap}>
              <Icon
                size={21}
                color={color}
                strokeWidth={focused ? 2.4 : 2}
                fill={focused && (route.name === 'index' || route.name === 'sports') ? colors.emerald : 'none'}
              />
              {showBadge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{selections.length}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, focused ? styles.labelActive : null]}>
              {labels[route.name] ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors: ThemeColors, elevation: ReturnType<typeof useTheme>['elevation']) {
  return StyleSheet.create({
    bar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      alignSelf: 'center',
      maxWidth: 720,
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.line,
      paddingTop: spacing.sm,
      minHeight: layout.tabBarHeight,
      zIndex: 10,
      ...elevation.card,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 48,
      gap: 4,
    },
    pressed: { transform: [{ scale: 0.94 }] },
    iconWrap: { position: 'relative' },
    badge: {
      position: 'absolute',
      top: -6,
      right: -10,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.emerald,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 3,
    },
    badgeText: { fontFamily: typography.mono, fontSize: 9, color: colors.white },
    label: { fontFamily: typography.sans, fontSize: 11, fontWeight: '600', color: colors.inkMuted },
    labelActive: { color: colors.emerald, fontWeight: '800' },
  });
}
