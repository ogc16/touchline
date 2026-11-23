import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout, spacing } from '@/theme/tokens';

export interface ResponsiveMetrics {
  width: number;
  height: number;
  isCompact: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLandscape: boolean;
  contentPadding: number;
  contentWidth: number;
  cardColumns: number;
  liveColumns: number;
  bottomPadding: number;
}

export function useResponsive(): ResponsiveMetrics {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isTablet = width >= 720;
  const isDesktop = width >= 1080;
  const contentPadding = isDesktop ? spacing.xxl : isTablet ? spacing.xl : spacing.lg;
  const contentWidth = Math.min(width - contentPadding * 2, layout.maxContentWidth);
  const cardColumns = isDesktop ? 3 : isTablet ? 2 : 1;
  const liveColumns = isDesktop ? 3 : isTablet ? 2 : 1;

  return {
    width,
    height,
    isCompact: width < 720,
    isTablet,
    isDesktop,
    isLandscape: width > height,
    contentPadding,
    contentWidth,
    cardColumns,
    liveColumns,
    bottomPadding: layout.tabBarHeight + insets.bottom + (isTablet ? 72 : 88),
  };
}
