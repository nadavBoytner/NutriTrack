# NutriTrack Mobile

Expo (React Native, Expo Router) app — same flows and design system as the web dashboard, ported to native.

## Setup

```bash
cp .env.example .env.local
npx expo start
```

Scan the QR code with **Expo Go** on your phone. Your phone must be on the **same Wi-Fi network** as your dev machine.

**Important:** `EXPO_PUBLIC_API_URL` defaults to `http://localhost:3000`, which only works when testing in a web preview on the same machine. A real phone can't resolve "localhost" to your computer — set it to your machine's LAN IP instead (find it with `ipconfig`/`ifconfig`), e.g. `EXPO_PUBLIC_API_URL=http://192.168.1.23:3000`.

## Design system

Same dark glassmorphism tokens as web (`lib/colors.ts`), built with `expo-blur` (`GlassPanel`) and `expo-linear-gradient` (buttons, wordmark accent).

## Known platform difference

The web wordmark uses true gradient text (CSS `background-clip: text`); mobile uses a solid accent color instead, since React Native has no equivalent without an extra `MaskedView` dependency.
