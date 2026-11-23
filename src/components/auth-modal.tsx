import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import LoadingBall from '@/components/loading-ball';
import { DEMO_EMAIL, DEMO_PASSWORD, useAuth } from '@/store/auth';
import { useTheme } from '@/theme/theme';
import { radius, spacing, typography, type ThemeColors } from '@/theme/tokens';

type AuthMode = 'signin' | 'signup';

export default function AuthModal() {
  const { colors, elevation } = useTheme();
  const styles = useMemo(() => createStyles(colors, elevation), [colors, elevation]);
  const { height } = useWindowDimensions();
  const {
    promptOpen,
    promptTitle,
    closeAuthPrompt,
    continueAsGuest,
    signIn,
    signUp,
    isAuthenticated,
    user,
  } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const maxHeight = Math.min(Math.round(height * 0.92), 760);

  function switchMode(next: AuthMode) {
    setMode(next);
    setError(null);
  }

  function handleDismiss() {
    if (busy) {
      return;
    }
    closeAuthPrompt();
    setError(null);
    setPassword('');
  }

  async function handleSubmit() {
    if (busy) {
      return;
    }
    setBusy(true);
    setError(null);
    const result =
      mode === 'signin'
        ? await signIn(email, password)
        : await signUp(name, email, password);
    setBusy(false);
    if (result.ok) {
      setPassword('');
      closeAuthPrompt();
      return;
    }
    setError(result.error ?? 'Something went wrong. Try again.');
  }

  return (
    <Modal
      visible={promptOpen}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={handleDismiss}
          accessibilityRole="button"
          accessibilityLabel="Close sign in"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.position}
        >
          <SafeAreaView edges={['bottom']} style={[styles.card, { maxHeight }]}>
            <View style={styles.handle} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
              <View style={styles.header}>
                <View style={styles.headerCopy}>
                  <Text style={styles.eyebrow}>TOUCHLINE ACCOUNT</Text>
                  <Text style={styles.title}>{promptTitle}</Text>
                  <Text style={styles.subtitle}>
                    You can keep browsing without an account. Sign in to place demo bets and save your
                    profile on this device.
                  </Text>
                </View>
                <Pressable
                  onPress={handleDismiss}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Close sign in"
                  style={styles.closeButton}
                >
                  <X size={18} color={colors.ink} strokeWidth={2.2} />
                </Pressable>
              </View>

              {isAuthenticated ? (
                <View style={styles.signedInCard}>
                  <Text style={styles.signedInTitle}>Signed in</Text>
                  <Text style={styles.signedInCopy}>{user?.email}</Text>
                  <Pressable
                    onPress={handleDismiss}
                    accessibilityRole="button"
                    style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null]}
                  >
                    <Text style={styles.primaryText}>Done</Text>
                  </Pressable>
                </View>
              ) : (
                <>
                  <View style={styles.tabs}>
                    <Pressable
                      onPress={() => switchMode('signin')}
                      accessibilityRole="button"
                      accessibilityState={{ selected: mode === 'signin' }}
                      style={[styles.tab, mode === 'signin' ? styles.tabActive : null]}
                    >
                      <Text style={[styles.tabText, mode === 'signin' ? styles.tabTextActive : null]}>
                        Sign in
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => switchMode('signup')}
                      accessibilityRole="button"
                      accessibilityState={{ selected: mode === 'signup' }}
                      style={[styles.tab, mode === 'signup' ? styles.tabActive : null]}
                    >
                      <Text style={[styles.tabText, mode === 'signup' ? styles.tabTextActive : null]}>
                        Create account
                      </Text>
                    </Pressable>
                  </View>

                  {mode === 'signup' ? (
                    <Field
                      label="Name"
                      value={name}
                      onChangeText={setName}
                      placeholder="Your name"
                      autoCapitalize="words"
                      styles={styles}
                    />
                  ) : null}

                  <Field
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    styles={styles}
                  />
                  <Field
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 6 characters"
                    autoCapitalize="none"
                    secureTextEntry
                    styles={styles}
                  />

                  {error ? <Text style={styles.errorText}>{error}</Text> : null}

                  <Pressable
                    onPress={() => void handleSubmit()}
                    disabled={busy}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: busy }}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed ? styles.pressed : null,
                      busy ? styles.primaryDisabled : null,
                    ]}
                  >
                    {busy ? <LoadingBall size={18} /> : null}
                    <Text style={styles.primaryText}>
                      {busy
                        ? mode === 'signin'
                          ? 'Signing in'
                          : 'Creating account'
                        : mode === 'signin'
                          ? 'Sign in'
                          : 'Create account'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => void continueAsGuest()}
                    accessibilityRole="button"
                    style={styles.guestButton}
                  >
                    <Text style={styles.guestText}>Continue as guest</Text>
                  </Pressable>

                  <View style={styles.demoNote}>
                    <Text style={styles.demoLabel}>DEMO ACCOUNT</Text>
                    <Text style={styles.demoText}>{DEMO_EMAIL}</Text>
                    <Text style={styles.demoText}>Password: {DEMO_PASSWORD}</Text>
                    <Text style={styles.demoCopy}>Do not use a real password. Data stays on this device.</Text>
                  </View>
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

type ModalStyles = ReturnType<typeof createStyles>;

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize,
  keyboardType,
  secureTextEntry,
  styles,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: 'none' | 'words';
  keyboardType?: 'email-address';
  secureTextEntry?: boolean;
  styles: ModalStyles;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={styles.fieldInput}
      />
    </View>
  );
}

function createStyles(colors: ThemeColors, elevation: ReturnType<typeof useTheme>['elevation']) {
  return StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
    backdrop: { position: 'absolute', inset: 0, backgroundColor: colors.overlay },
    position: { width: '100%', maxWidth: 560, alignItems: 'center' },
    card: {
      width: '100%',
      backgroundColor: colors.surface,
      borderRadius: radius.xl,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.line,
      ...elevation.raised,
    },
    handle: {
      width: 38,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.line,
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    scroll: { paddingBottom: spacing.xl },
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
    headerCopy: { flex: 1 },
    eyebrow: {
      fontFamily: typography.mono,
      fontSize: 9,
      letterSpacing: 1,
      color: colors.emerald,
    },
    title: {
      fontFamily: typography.sans,
      fontSize: 22,
      fontWeight: '800',
      color: colors.ink,
      letterSpacing: -0.4,
      marginTop: 6,
    },
    subtitle: {
      fontFamily: typography.sans,
      fontSize: 12,
      lineHeight: 18,
      color: colors.inkMuted,
      marginTop: spacing.sm,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabs: {
      flexDirection: 'row',
      padding: 4,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceMuted,
      marginTop: spacing.xl,
    },
    tab: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.xs },
    tabActive: { backgroundColor: colors.surface, ...elevation.card },
    tabText: { fontFamily: typography.sans, fontSize: 12, fontWeight: '700', color: colors.inkMuted },
    tabTextActive: { color: colors.ink },
    field: { marginTop: spacing.md },
    fieldLabel: {
      fontFamily: typography.sans,
      fontSize: 12,
      fontWeight: '700',
      color: colors.inkSoft,
      marginBottom: 6,
    },
    fieldInput: {
      height: 48,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.input,
      paddingHorizontal: spacing.md,
      fontFamily: typography.sans,
      fontSize: 14,
      color: colors.ink,
    },
    errorText: {
      fontFamily: typography.sans,
      fontSize: 12,
      color: colors.red,
      marginTop: spacing.md,
    },
    primaryButton: {
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: colors.emerald,
      marginTop: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    primaryDisabled: { backgroundColor: colors.disabled },
    primaryText: {
      fontFamily: typography.sans,
      fontSize: 14,
      fontWeight: '800',
      color: colors.onEmerald,
    },
    pressed: { transform: [{ scale: 0.985 }] },
    guestButton: { alignItems: 'center', paddingVertical: spacing.md },
    guestText: { fontFamily: typography.sans, fontSize: 13, fontWeight: '700', color: colors.inkSoft },
    demoNote: {
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: radius.sm,
      backgroundColor: colors.emeraldWash,
    },
    demoLabel: {
      fontFamily: typography.mono,
      fontSize: 9,
      letterSpacing: 0.8,
      color: colors.emeraldDeep,
    },
    demoText: {
      fontFamily: typography.mono,
      fontSize: 12,
      color: colors.ink,
      marginTop: 4,
    },
    demoCopy: {
      fontFamily: typography.sans,
      fontSize: 11,
      color: colors.inkSoft,
      marginTop: spacing.sm,
    },
    signedInCard: {
      marginTop: spacing.xl,
      padding: spacing.lg,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceMuted,
    },
    signedInTitle: { fontFamily: typography.sans, fontSize: 16, fontWeight: '800', color: colors.ink },
    signedInCopy: { fontFamily: typography.sans, fontSize: 12, color: colors.inkMuted, marginTop: 4 },
  });
}
