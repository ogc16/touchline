import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import {
  PrimaryAction,
  Screen,
  SettingsActions,
  SettingsGroup,
  SettingsHeader,
  SettingSwitch,
} from '@/components/ui';
import { useTheme } from '@/theme/theme';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create({ help: { fontSize: 12, color: colors.inkMuted, lineHeight: 18, marginTop: 4 } }), [colors]);
  const [betUpdates, setBetUpdates] = useState(true);
  const [oddsAlerts, setOddsAlerts] = useState(true);
  const [results, setResults] = useState(true);
  const [offers, setOffers] = useState(false);

  return (
    <Screen>
      <SettingsHeader title="Notifications" subtitle="Choose what reaches you and when." />

      <SettingsGroup title="Betting">
        <SettingSwitch
          label="Bet updates"
          detail="Slip changes and placed bet confirmations"
          value={betUpdates}
          onValueChange={setBetUpdates}
        />
        <SettingSwitch
          label="Odds alerts"
          detail="Price moves on events in your slip"
          value={oddsAlerts}
          onValueChange={setOddsAlerts}
        />
        <SettingSwitch
          label="Results"
          detail="Settlement and final score alerts"
          value={results}
          onValueChange={setResults}
        />
      </SettingsGroup>

      <SettingsGroup title="Offers">
        <SettingSwitch
          label="Promotions"
          detail="Demo bonuses and product news"
          value={offers}
          onValueChange={setOffers}
        />
      </SettingsGroup>

      <Text style={styles.help}>Alerts appear in the app while you have an active bet slip.</Text>

      <SettingsActions>
        <PrimaryAction label="Save preferences" onPress={() => {}} />
      </SettingsActions>
    </Screen>
  );
}
