# 86'd - Restaurant Business Simulator

> "The restaurant business doesn't care about your dreams."

A cross-platform restaurant business simulator built with React Native + Expo. Runs on iOS, Android, and Web from a single codebase.

![Version](https://img.shields.io/badge/version-2.2-orange)
![Expo](https://img.shields.io/badge/Expo-54-blue)
![Platforms](https://img.shields.io/badge/platforms-iOS%20%7C%20Android%20%7C%20Web-green)

## 🎮 Features

### 🍽️ 40+ Cuisine Types
American, Mexican, Japanese, Thai, Indian, French Fine Dining, Steakhouse, Omakase ($250 avg ticket), and more.

### 💰 9 Capital Tiers ($10K - $5M+)
| Tier | Capital | Staff | Rent |
|------|---------|-------|------|
| Hard Mode | <$30K | 2 | $1.5K |
| Bootstrap | $30-75K | 3 | $2.5K |
| Scrappy | $75-150K | 4 | $3.5K |
| Standard | $150-300K | 6 | $5K |
| Comfortable | $300-500K | 8 | $7K |
| Well-Funded | $500K-1M | 12 | $10K |
| Serious | $1-2M | 18 | $18K |
| Flagship | $2-3.5M | 25 | $28K |
| Empire | $3.5-5M+ | 35 | $40K |

### 📊 Realistic Scenarios
- Employee no-shows
- Health inspections
- Viral TikTok moments
- Equipment failures
- Staff drama
- Delivery app decisions
- Burnout warnings

### 🎯 Win Conditions
- Survive Year One (52 weeks)
- Hit $1M Net Worth
- Build 5 Locations
- Sandbox Mode

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your phone (for testing)

### Development
```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Run on specific platform
npm run web      # Web browser
npm run ios      # iOS Simulator (Mac only)
npm run android  # Android Emulator
```

### Building for Production

#### Web (Vercel)
```bash
npx expo export --platform web
# Deploy dist/ folder to Vercel
```

#### iOS (App Store)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure & build
eas build --platform ios
```

#### Android (Play Store)
```bash
eas build --platform android
```

## 📱 Deployment

### Web → Vercel
1. Push to GitHub
2. Connect repo to Vercel
3. Set Framework Preset: **Other**
4. Build Command: `npx expo export --platform web`
5. Output Directory: `dist`

### iOS → App Store
1. Configure `app.json` with your Bundle ID
2. Run `eas build --platform ios`
3. Submit via `eas submit --platform ios`

### Android → Play Store  
1. Configure `app.json` with your Package name
2. Run `eas build --platform android`
3. Submit via `eas submit --platform android`

## 🗂️ Project Structure

```
86d-game/
├── App.js           # Main game component
├── app.json         # Expo configuration
├── package.json     # Dependencies
├── assets/          # Icons & splash screens
└── README.md
```

## 📖 Real Restaurant Lessons

Every scenario teaches actual industry knowledge:
- **Loaded labor cost** adds 40-50% to base wages
- **30% delivery commissions** can destroy margins
- **Vendor price creep** happens without notice
- **Burnout** is a business risk, not personal failure
- **Second locations** fail more often than firsts

## 👨‍💻 Created By

**Justin Newbold** - Owner of Patty Shack, multi-location burger chain

## 📄 License

MIT License
