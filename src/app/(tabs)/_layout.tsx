import { Tabs } from 'expo-router';

import TabBar from '@/components/tab-bar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="sports" />
      <Tabs.Screen name="live" />
      <Tabs.Screen name="bets" />
      <Tabs.Screen name="account" />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
