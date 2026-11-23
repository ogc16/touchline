import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { Screen, SettingsGroup, SettingsHeader } from '@/components/ui';
import { useTheme } from '@/theme/theme';
import { spacing } from '@/theme/tokens';

const faqs = [
  {
    question: 'How are bets settled?',
    answer: 'Bets settle when the official result is published. Settlement appears in My bets.',
  },
  {
    question: 'Can I cancel a bet?',
    answer: 'Once placed, a bet cannot be cancelled. Check your slip before confirming.',
  },
  {
    question: 'Where can I see my limits?',
    answer: 'Open Betting limits in Account to review deposit and stake caps.',
  },
  {
    question: 'Are the odds real?',
    answer: 'Fixtures come from ESPN. Odds are a mix of published prices and illustrative demo prices.',
  },
];

export default function HelpScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createHelpStyles(colors), [colors]);
  return (
    <Screen>
      <SettingsHeader title="Help centre" subtitle="Answers to common Touchline questions." />
      <SettingsGroup title="Frequently asked">
        {faqs.map((faq) => (
          <FaqRow key={faq.question} faq={faq} styles={styles} />
        ))}
      </SettingsGroup>
    </Screen>
  );
}

function FaqRow({ faq, styles }: { faq: (typeof faqs)[number]; styles: ReturnType<typeof createHelpStyles> }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [styles.question, pressed ? styles.pressed : null]}
      >
        <Text style={styles.questionText}>{faq.question}</Text>
        <ChevronDown
          size={17}
          color={colors.inkMuted}
          strokeWidth={2.2}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </Pressable>
      {open ? <Text style={styles.answer}>{faq.answer}</Text> : null}
    </View>
  );
}

function createHelpStyles(colors: ReturnType<typeof useTheme>['colors']) {
  return StyleSheet.create({
    row: { borderBottomWidth: 1, borderBottomColor: colors.line },
    question: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
    questionText: { flex: 1, fontSize: 13, fontWeight: '800', color: colors.ink },
    answer: { fontSize: 12, color: colors.inkSoft, lineHeight: 18, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
    pressed: { opacity: 0.7 },
  });
}
