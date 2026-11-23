import { Check } from 'lucide-react-native';

import { Screen, SettingsGroup, SettingsHeader, SettingsRow } from '@/components/ui';
import { useTheme } from '@/theme/theme';

export default function VerificationScreen() {
  const { colors } = useTheme();
  return (
    <Screen>
      <SettingsHeader title="Verification" subtitle="Account checks and verification status." />

      <SettingsGroup title="Completed">
        <SettingsRow
          icon={<Check size={18} color={colors.emerald} strokeWidth={2.6} />}
          label="Identity confirmed"
          detail="Government ID checked"
          value="Verified"
          onPress={() => {}}
        />
        <SettingsRow
          icon={<Check size={18} color={colors.emerald} strokeWidth={2.6} />}
          label="Address confirmed"
          detail="Utility bill accepted"
          value="Verified"
          onPress={() => {}}
        />
        <SettingsRow
          icon={<Check size={18} color={colors.emerald} strokeWidth={2.6} />}
          label="Payment method"
          detail="Visa ending 4821"
          value="Verified"
          onPress={() => {}}
        />
      </SettingsGroup>
    </Screen>
  );
}
