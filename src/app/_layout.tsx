import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { DMMono_400Regular, DMMono_500Medium } from '@expo-google-fonts/dm-mono';

import BetSlipBar from '@/components/bet-slip-bar';
import BetSlipSheet from '@/components/bet-slip-sheet';
import LoadingBall from '@/components/loading-ball';
import { BetSlipProvider } from '@/store/bet-slip';
import { SportsProvider } from '@/store/sports';
import { ThemeProvider, useTheme } from '@/theme/theme';

SplashScreen.preventAutoHideAsync();

function AppShell() {
  const { colors, isDark } = useTheme();
  return (
    <BetSlipProvider>
      <SportsProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.canvas },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="event/[id]" />
          <Stack.Screen name="search" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="results" />
          <Stack.Screen name="sport/[slug]" />
          <Stack.Screen name="league/[slug]" />
        </Stack>
        <BetSlipBar />
        <BetSlipSheet />
      </SportsProvider>
    </BetSlipProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    DMMono_400Regular,
    DMMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppShell />
        {!fontsLoaded ? <LoadingBall fullScreen label="Loading Touchline" /> : null}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
