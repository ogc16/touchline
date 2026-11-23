import { useMemo, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, RefreshCw } from 'lucide-react-native';
import { router, useRouter } from 'expo-router';

import EventCard from '@/components/event-card';
import type { SportEvent } from '@/data/types';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/theme/theme';
import { radius, spacing } from '@/theme/tokens';

type ScreenProps = Pick<
  ScrollViewProps,
  'refreshControl' | 'showsVerticalScrollIndicator' | 'keyboardShouldPersistTaps'
> & {
  children: ReactNode;
  contentStyle?: ScrollViewProps['contentContainerStyle'];
};

export function Screen({ children, contentStyle, ...rest }: ScreenProps) {
  const { colors } = useTheme();
  const { bottomPadding, contentPadding, contentWidth } = useResponsive();
  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.canvas }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...rest}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: contentPadding,
            paddingBottom: bottomPadding,
            maxWidth: contentWidth + contentPadding * 2,
            alignSelf: 'center',
            width: '100%',
          },
          contentStyle,
        ]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function PageTitle({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.pageTitleRow}>
      <View style={styles.pageTitleText}>
        <Text style={[styles.pageTitle, { color: colors.ink }]}>{title}</Text>
        {subtitle ? <Text style={[styles.pageSubtitle, { color: colors.inkSoft }]}>{subtitle}</Text> : null}
      </View>
      {trailing}
    </View>
  );
}

export function SettingsHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  const { colors } = useTheme();
  return (
    <View style={styles.settingsHeader}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, { backgroundColor: colors.surface, borderColor: colors.line }, pressed ? styles.backPressed : null]}
      >
        <ArrowLeft size={19} color={colors.ink} strokeWidth={2.2} />
      </Pressable>
      <View style={styles.settingsHeaderText}>
        <Text style={[styles.settingsHeaderTitle, { color: colors.ink }]}>{title}</Text>
        {subtitle ? <Text style={[styles.settingsHeaderSubtitle, { color: colors.inkMuted }]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode | string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionHeadingText}>
        <Text style={[styles.sectionTitle, { color: colors.ink }]}>{title}</Text>
        {subtitle ? <Text style={[styles.sectionSubtitle, { color: colors.inkMuted }]}>{subtitle}</Text> : null}
      </View>
      {typeof action === 'string' && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <Text style={[styles.sectionAction, { color: colors.emerald }]}>{action}</Text>
        </Pressable>
      ) : (
        action
      )}
    </View>
  );
}

export function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        {
          backgroundColor: active ? colors.ink : colors.surface,
          borderColor: active ? colors.ink : colors.line,
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      <Text style={[styles.filterChipText, { color: active ? colors.white : colors.inkSoft }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function FilterRow({ children }: { children: ReactNode }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
      {children}
    </ScrollView>
  );
}

export function DataStatus({
  loading,
  refreshing,
  source,
  error,
  lastUpdated,
  onRefresh,
}: {
  loading: boolean;
  refreshing: boolean;
  source: 'espn' | 'demo';
  error: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
}) {
  const { colors } = useTheme();
  const updated = lastUpdated
    ? new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(lastUpdated)
    : '--:--';
  const message = loading
    ? 'Loading live fixtures'
    : error
      ? 'Demo feed active'
      : source === 'espn'
        ? `Live feed updated ${updated}`
        : 'Demo feed active';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Refresh fixtures"
      onPress={onRefresh}
      style={({ pressed }) => [
        styles.dataStatus,
        {
          backgroundColor: error ? colors.redWash : colors.surface,
          borderColor: error ? colors.red : colors.line,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      {refreshing || loading ? (
        <ActivityIndicator size="small" color={colors.emerald} />
      ) : (
        <RefreshCw size={13} color={error ? colors.red : colors.emerald} strokeWidth={2.4} />
      )}
      <Text style={[styles.dataStatusText, { color: error ? colors.red : colors.inkSoft }]}>
        {message}
      </Text>
      <Text style={[styles.dataStatusTime, { color: colors.inkMuted }]}>Tap to refresh</Text>
    </Pressable>
  );
}

export function EventGrid({ events }: { events: SportEvent[] }) {
  const { cardColumns, contentWidth } = useResponsive();
  const gap = spacing.md;
  const itemWidth = Math.max(240, (contentWidth - gap * (cardColumns - 1)) / cardColumns);
  const items = useMemo(
    () =>
      events.map((event) => (
        <View key={event.id} style={[styles.gridItem, { width: itemWidth }]}>
          <EventCard
            event={event}
            compact={itemWidth < 360}
            onPress={() => router.push(`/event/${event.id}`)}
          />
        </View>
      )),
    [events, itemWidth],
  );

  return <View style={styles.grid}>{items}</View>;
}

export function LoadingRows({ count = 3 }: { count?: number }) {
  const { colors } = useTheme();
  const { cardColumns, contentWidth } = useResponsive();
  const gap = spacing.md;
  const itemWidth = Math.max(240, (contentWidth - gap * (cardColumns - 1)) / cardColumns);
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.skeletonCard,
            { width: itemWidth, backgroundColor: colors.skeleton, borderColor: colors.line },
          ]}
        />
      ))}
    </View>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.line }]}>
      <Text style={[styles.emptyTitle, { color: colors.ink }]}>{title}</Text>
      <Text style={[styles.emptyDetail, { color: colors.inkSoft }]}>{detail}</Text>
    </View>
  );
}

export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.settingsGroup}>
      <Text style={[styles.settingsGroupTitle, { color: colors.inkMuted }]}>{title}</Text>
      <View style={[styles.settingsCard, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        {children}
      </View>
    </View>
  );
}

export function SettingsRow({
  icon,
  label,
  detail,
  value,
  onPress,
  badge,
}: {
  icon?: ReactNode;
  label: string;
  detail?: string;
  value?: string;
  onPress: () => void;
  badge?: string;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
        { backgroundColor: pressed ? colors.surfaceMuted : colors.surface },
      ]}
    >
      {icon ? <View style={styles.settingsIcon}>{icon}</View> : null}
      <View style={styles.settingsRowText}>
        <Text style={[styles.settingsLabel, { color: colors.ink }]}>{label}</Text>
        {detail ? <Text style={[styles.settingsDetail, { color: colors.inkMuted }]}>{detail}</Text> : null}
      </View>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: colors.emeraldWash }]}>
          <Text style={[styles.badgeText, { color: colors.emeraldDeep }]}>{badge}</Text>
        </View>
      ) : null}
      {value ? <Text style={[styles.settingsValue, { color: colors.inkMuted }]}>{value}</Text> : null}
      <ChevronRight size={16} color={colors.inkMuted} strokeWidth={2} />
    </Pressable>
  );
}

export function SettingSwitch({
  label,
  detail,
  value,
  onValueChange,
}: {
  label: string;
  detail?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.settingsRow}>
      <View style={styles.settingsRowText}>
        <Text style={[styles.settingsLabel, { color: colors.ink }]}>{label}</Text>
        {detail ? <Text style={[styles.settingsDetail, { color: colors.inkMuted }]}>{detail}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.line, true: colors.emerald }}
        thumbColor={colors.white}
        ios_backgroundColor={colors.line}
      />
    </View>
  );
}

export function SettingInput({
  label,
  value,
  onChangeText,
  prefix = '',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  prefix?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.inputBlock}>
      <Text style={[styles.inputLabel, { color: colors.inkSoft }]}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.input, borderColor: colors.line }]}>
        {prefix ? <Text style={[styles.inputPrefix, { color: colors.emerald }]}>{prefix}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.inkMuted}
          style={[styles.inputValue, { color: colors.ink, flex: 1 }]}
        />
      </View>
    </View>
  );
}

export function SettingsActions({ children }: { children: ReactNode }) {
  return <View style={styles.settingsActions}>{children}</View>;
}

export function PrimaryAction({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const { colors, elevation } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryAction,
        elevation.card,
        {
          backgroundColor: disabled ? colors.disabled : colors.emerald,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.primaryActionText, { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flexGrow: 1, paddingTop: spacing.xl },
  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  pageTitleText: { flexShrink: 1 },
  pageTitle: { fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
  pageSubtitle: { fontSize: 13, marginTop: 3, fontWeight: '500' },
  settingsHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backPressed: { opacity: 0.7 },
  settingsHeaderText: { flex: 1 },
  settingsHeaderTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  settingsHeaderSubtitle: { fontSize: 11, marginTop: 3, fontWeight: '600' },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionHeadingText: { flexShrink: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  sectionSubtitle: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  sectionAction: { fontSize: 12, fontWeight: '800' },
  filterRow: { gap: spacing.sm, paddingRight: spacing.lg, marginBottom: spacing.md },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 12, fontWeight: '800' },
  dataStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.md,
  },
  dataStatusText: { fontSize: 11, fontWeight: '800', flexShrink: 1 },
  dataStatusTime: { fontSize: 10, marginLeft: 'auto', fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridItem: { maxWidth: '100%' },
  skeletonCard: {
    height: 158,
    borderRadius: radius.md,
    borderWidth: 1,
    maxWidth: '100%',
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: '800' },
  emptyDetail: { fontSize: 12, marginTop: 6, textAlign: 'center', lineHeight: 18 },
  settingsGroup: { marginBottom: spacing.xl },
  settingsGroupTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
    marginLeft: 2,
  },
  settingsCard: { borderWidth: 1, borderRadius: radius.md, overflow: 'hidden' },
  settingsRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  settingsIcon: { width: 22, alignItems: 'center' },
  settingsRowText: { flex: 1 },
  settingsLabel: { fontSize: 13, fontWeight: '800' },
  settingsDetail: { fontSize: 11, marginTop: 3, fontWeight: '600', lineHeight: 15 },
  settingsValue: { fontSize: 11, fontWeight: '700', maxWidth: 110, textAlign: 'right' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  badgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.4 },
  inputBlock: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  inputLabel: { fontSize: 11, fontWeight: '800', marginBottom: spacing.sm },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  inputPrefix: { fontSize: 15, fontWeight: '800', marginRight: 6 },
  inputValue: { fontSize: 15, fontWeight: '800' },
  settingsActions: { gap: spacing.md, marginTop: spacing.lg },
  primaryAction: {
    minHeight: 48,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primaryActionText: { fontSize: 13, fontWeight: '900', letterSpacing: 0.2 },
});
