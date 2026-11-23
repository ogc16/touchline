import { Stack } from 'expo-router';

import { useTheme } from '@/theme/theme';

export default function AccountLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    />
  );
}
