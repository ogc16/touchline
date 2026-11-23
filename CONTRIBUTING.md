# Contributing to Touchline

Thanks for helping improve Touchline. This project is a demo sports-betting UI built with Expo Router, React Native, and TypeScript. It does not process real money.

## Getting started

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the web app:
   ```bash
   npm run web
   ```
4. Create a branch for your change:
   ```bash
   git checkout -b feat/short-description
   ```

## Development expectations

- Keep changes focused and small.
- Follow the existing component and theme patterns in `src/components`, `src/theme`, and `src/store`.
- Use the theme tokens and `useTheme()` instead of hardcoded colors.
- Preserve responsive behavior for phone, tablet, and desktop layouts.
- Do not introduce real-money flows, credentials, or private API keys.
- ESPN scoreboard data is public and keyless; keep fallbacks deterministic and clearly labelled as demo data.

## Before opening a pull request

Run:

```bash
npx tsc --noEmit
npm run lint
npx expo export --platform web
```

If your change affects UI, include screenshots or a short screen recording for mobile and desktop widths.

## Pull request checklist

- [ ] TypeScript passes.
- [ ] Lint passes.
- [ ] Web export succeeds.
- [ ] Light and dark themes still render correctly.
- [ ] Mobile bet slip and desktop sidebar remain usable.
- [ ] No secrets, tokens, or personal data are committed.

## Commit style

Use concise, imperative commit messages, for example:

```text
Add league filter to search screen
Fix odds flash timing on live events
```

## Reporting issues

Open a GitHub issue with:

- What you expected to happen.
- What actually happened.
- Steps to reproduce.
- Device/browser and screen width.
- Screenshots if the issue is visual.

## Code of conduct

By participating, you agree to uphold the [Code of Conduct](CODE_OF_CONDUCT.md).
