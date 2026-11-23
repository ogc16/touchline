# Touchline

A responsive, cross-platform sports betting interface prototype built with Expo Router, React Native, and TypeScript. Touchline combines live fixture data with a polished odds-board experience across web, phone, and tablet layouts.

Repository: https://github.com/ogc16/touchline

> **Demo notice:** Touchline is a UI prototype. It does not accept deposits, place real wagers, settle real bets, or pay out winnings. Balances, bet history, and some odds are illustrative demo data.

## About

Touchline was built to explore what a fast, modern sports betting product could feel like when designed for everyday bettors. It focuses on the parts users touch most: a clear event board, compact odds buttons, an always-reachable bet slip, fast sport and fixture navigation, and a light/dark interface that adapts from small phones to wide desktops.

The app uses real, keyless ESPN public scoreboard data for fixtures and scores. Where a public feed does not provide wagering prices, Touchline generates stable, deterministic demo odds so the full interaction can still be explored.

## Highlights

- **Live fixture board** sourced from ESPN public scoreboards; no API key required.
- **Real scores and statuses**, including scheduled, live, and finished events.
- **Demo odds layer** with deterministic fallbacks and simulated price movement.
- **Full bet slip flow**: add selections, enter stake, view potential payout, place demo bet, and review bet history.
- **Responsive layouts**: compact mobile slip bar and modal, tablet two-column grids, desktop event board with persistent bet slip rail.
- **Light, dark, and system themes** with saved appearance preference.
- **Complete route set** for home, sports, live, results, search, event detail, sport and league pages, bets, account, and account settings.
- **Accessible foundations** with semantic labels, readable contrast, keyboard-friendly web controls, and reduced-motion-ready theme structure.
- **Modern stack**: Expo SDK 58, React 19, React Native 0.88, Expo Router 6, and TypeScript 6.

## Screens and routes

| Area | Route | Purpose |
| --- | --- | --- |
| Home | `src/app/(tabs)/index.tsx` | Featured events, sport shortcuts, data status, quick bet slip access |
| Sports | `src/app/(tabs)/sports.tsx` | All sports and competition filters |
| Live | `src/app/(tabs)/live.tsx` | In-play fixtures and live score cards |
| Bets | `src/app/(tabs)/bets.tsx` | Open and settled demo bets |
| Account | `src/app/(tabs)/account/index.tsx` | Profile entry point and settings links |
| Event detail | `src/app/event/[id].tsx` | Event markets, odds selection, navigation to league |
| Sport detail | `src/app/sport/[slug].tsx` | Fixtures filtered by sport |
| League detail | `src/app/league/[slug].tsx` | Fixtures filtered by competition |
| Search | `src/app/search.tsx` | Search teams, leagues, and events |
| Results | `src/app/results.tsx` | Finished events grouped by date |
| Notifications | `src/app/notifications.tsx` | Recent demo updates |
| Profile | `src/app/(tabs)/account/profile.tsx` | Demo account identity |
| Payment methods | `src/app/(tabs)/account/payment-methods.tsx` | Example payment instruments |
| Notification settings | `src/app/(tabs)/account/notifications.tsx` | Alert preferences |
| Betting limits | `src/app/(tabs)/account/betting-limits.tsx` | Deposit and stake caps |
| Verification | `src/app/(tabs)/account/verification.tsx` | Demo verification status |
| Appearance | `src/app/(tabs)/account/appearance.tsx` | Theme and motion controls |
| Help | `src/app/(tabs)/account/help.tsx` | Expandable FAQ |
| Terms | `src/app/(tabs)/account/terms.tsx` | Demo terms and privacy notice |

## Tech stack

- **Framework:** Expo and Expo Router
- **UI:** React Native, React Native Web, Reanimated, Gesture Handler, Safe Area Context, Screens
- **Language:** TypeScript
- **Icons:** lucide-react-native
- **Fonts:** Manrope and DM Mono from `@expo-google-fonts`
- **Data:** ESPN public scoreboard endpoints
- **State:** React context providers for theme, sports data, odds feed, and bet slip
- **Linting:** ESLint with `eslint-config-expo`

## Data model

Fixture data is fetched from ESPN public scoreboard endpoints such as:

```text
https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard?dates=YYYYMMDD
```

The service normalizes ESPN competitions into a local `SportEvent` type containing:

- Stable event ID and sport
- League name and league key
- Home and away team names, abbreviations, colors, and logos
- Kickoff time, date label, and status
- Live period, clock, and score where available
- Demo market odds derived deterministically from event IDs

If ESPN is unavailable or the browser blocks the request, the app falls back to a curated sample set so the interface remains usable. The data status component surfaces whether the current board is using live, published, or demo data.

## Responsive behavior

| Width | Layout |
| --- | --- |
| `< 700px` | Single-column feed, compact bet slip bar, full-screen slip modal, bottom tab bar |
| `700px - 1100px` | Two-column event grid, expanded cards, still mobile-style slip flow |
| `> 1100px` | Three-column event area plus persistent right-hand bet slip rail and wider content gutters |

Theme values are centralized in `src/theme/tokens.ts`. Components consume semantic colors and spacing through `useTheme()` rather than hardcoded values, which keeps light and dark modes consistent.

## Project structure

```text
src/
  app/
    (tabs)/                 Main tab navigator and account settings routes
    event/                  Event detail route
    league/                 League detail route
    sport/                  Sport detail route
    _layout.tsx             Root layout and global providers
    notifications.tsx       Notifications route
    results.tsx             Results route
    search.tsx              Search route
  components/               Reusable UI, cards, slip, navigation, and layout pieces
  data/                     Types and demo fallback fixtures
  hooks/                    Responsive and odds-feed hooks
  services/                 ESPN data access and normalization
  store/                    Theme, sports, odds, and bet-slip context providers
  theme/                    Theme tokens and provider
  utils/                    Formatting and deterministic helpers
```

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Optional: Expo Go for iOS or Android testing

### Install

```bash
git clone https://github.com/ogc16/touchline.git
cd touchline
npm install
```

### Run

```bash
npm run web
```

Then open the URL printed by Expo, or run the native targets:

```bash
npm run android
npm run ios
```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo development server |
| `npm run web` | Start the web app |
| `npm run android` | Start Android |
| `npm run ios` | Start iOS |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Run TypeScript checks |
| `npx expo export --platform web` | Produce a static web export in `dist/` |

There is currently no automated test suite. Contributions that add focused unit or component tests are welcome.

## Architecture notes

- `ThemeProvider` resolves system, light, and dark appearance and persists the user's choice.
- `SportsProvider` owns fixtures, loading, refresh, error, source, and date state.
- `useOddsFeed` simulates small price movements on top of deterministic base odds.
- `BetSlipProvider` manages selections, stake input, payout calculation, placement, balance, and order history.
- Route-level screens stay mostly declarative; data and cross-screen state live in providers and hooks.
- ESPN endpoints are unauthenticated and unofficial. Their response shape can change; the normalization layer keeps the rest of the app insulated.

## Roadmap

Ideas for future work:

- Add unit tests for odds calculation and ESPN normalization.
- Add user-selectable dates on the sports board.
- Add richer market groups and per-sport market rules.
- Add optional real odds provider behind a server-side proxy.
- Add saved slips and notification delivery.
- Add accessibility audits with automated browser tooling.
- Add offline caching for the last loaded fixture set.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request, and follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Released under the [MIT License](LICENSE).
