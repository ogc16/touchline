import { Bell, CircleDollarSign, Radio, TrendingUp } from 'lucide-react-native';

import { Screen, SettingsGroup, SettingsHeader, SettingsRow } from '@/components/ui';
import { useTheme } from '@/theme/theme';

export default function NotificationsRoute() {
  const { colors } = useTheme();
  return (
    <Screen>
      <SettingsHeader title="Notifications" subtitle="Recent updates from your events and slip." />
      <SettingsGroup title="Today">
        <SettingsRow
          icon={<Radio size={18} color={colors.emerald} strokeWidth={2.2} />}
          label="Live fixtures refreshed"
          detail="The board has been updated from the live feed."
          value="Now"
          onPress={() => {}}
        />
        <SettingsRow
          icon={<TrendingUp size={18} color={colors.emerald} strokeWidth={2.2} />}
          label="Odds movement"
          detail="Prices on popular markets have changed."
          value="12m"
          onPress={() => {}}
        />
        <SettingsRow
          icon={<CircleDollarSign size={18} color={colors.emerald} strokeWidth={2.2} />}
          label="Bet placed"
          detail="Your latest bet is active in My bets."
          value="1h"
          onPress={() => {}}
        />
      </SettingsGroup>
      <SettingsGroup title="Earlier">
        <SettingsRow
          icon={<Bell size={18} color={colors.emerald} strokeWidth={2.2} />}
          label="Welcome to Touchline"
          detail="Your demo balance is ready to use."
          value="Yesterday"
          onPress={() => {}}
        />
      </SettingsGroup>
    </Screen>
  );
}
