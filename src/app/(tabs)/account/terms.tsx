import { StyleSheet, Text } from 'react-native';

import { Screen, SettingsGroup, SettingsHeader } from '@/components/ui';
import { useTheme } from '@/theme/theme';
import { spacing } from '@/theme/tokens';

const paragraphs = [
  'Touchline is a demo experience. Odds, balances and results are illustrative only.',
  'Fixture data is provided by ESPN public scoreboards. Published odds may be mixed with deterministic demo prices when a feed does not supply a market.',
  'By using this app you agree to bet responsibly and only where wagering is legal in your region.',
  'No real money is accepted, held, or paid out. Payment methods shown in Account are examples.',
];

export default function TermsScreen() {
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    paragraph: { fontSize: 12, color: colors.inkSoft, lineHeight: 19, marginBottom: spacing.md },
  });
  return (
    <Screen>
      <SettingsHeader title="Terms and privacy" subtitle="Demo terms and responsible betting notice." />
      <SettingsGroup title="Terms">
        {paragraphs.map((paragraph) => (
          <Text key={paragraph} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}
      </SettingsGroup>
    </Screen>
  );
}
