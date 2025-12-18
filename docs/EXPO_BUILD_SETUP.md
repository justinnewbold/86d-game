# Expo Build Setup Guide

This guide explains how to set up automated builds for iOS and Android using Expo Application Services (EAS).

## Prerequisites

1. An [Expo account](https://expo.dev/signup)
2. [EAS CLI](https://docs.expo.dev/eas/) installed locally (optional, for local builds)
3. GitHub repository with Actions enabled

## Getting Your EXPO_TOKEN

1. Go to [Expo Access Tokens](https://expo.dev/accounts/[your-account]/settings/access-tokens)
2. Click "Create Token"
3. Give it a descriptive name like "86d-game-ci"
4. Copy the token (you won't see it again!)

## GitHub Actions Setup

### Add the Secret to GitHub

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `EXPO_TOKEN`
5. Value: Paste your Expo access token
6. Click **Add secret**

### Optional Secrets for App Store Submission

For automatic submission to app stores, add these secrets:

| Secret | Description |
|--------|-------------|
| `APPLE_ID` | Your Apple ID email |
| `ASC_APP_ID` | App Store Connect App ID |
| `APPLE_TEAM_ID` | Your Apple Developer Team ID |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Google Play service account JSON |

## Build Profiles

| Profile | Use Case | iOS Output | Android Output |
|---------|----------|------------|----------------|
| `development` | Local development | Simulator build | Debug APK |
| `preview` | Internal testing | Simulator build | APK |
| `preview-device` | Device testing | Device build | APK |
| `production` | App Store release | App Store build | AAB bundle |

## Triggering Builds

### Automatic Triggers

- **Push to `main`**: Triggers preview build
- **Push tag `v*`**: Triggers production build + submission
- **Pull request to `main`**: Triggers preview build

### Manual Trigger

1. Go to **Actions** tab in GitHub
2. Select **EAS Build** workflow
3. Click **Run workflow**
4. Choose platform and profile
5. Click **Run workflow**

## Local Development

### Install EAS CLI

```bash
npm install -g eas-cli
```

### Login to Expo

```bash
# Interactive login
eas login

# Or use token
export EXPO_TOKEN=your_token_here
eas whoami
```

### Build Locally

```bash
# Preview build (for testing)
npm run build:preview

# Production build
npm run build:ios
npm run build:android
npm run build:all
```

## Environment Variables

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

Then fill in your values:

```env
EXPO_TOKEN=your_expo_token_here
```

## Troubleshooting

### "Not logged in" Error

```bash
# Check if token is set
echo $EXPO_TOKEN

# Verify login
eas whoami
```

### Build Fails on CI

1. Check the GitHub Actions logs
2. Verify `EXPO_TOKEN` secret is set correctly
3. Ensure the token hasn't expired

### iOS Build Requires Credentials

For device builds (not simulator), you need:
- Apple Developer account ($99/year)
- App Store Connect access
- Distribution certificate

EAS can manage these for you - just follow the prompts on first build.

## Useful Commands

```bash
# Check EAS CLI version
eas --version

# List all builds
eas build:list

# View build status
eas build:view

# Cancel a build
eas build:cancel

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

## Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Expo GitHub Action](https://github.com/expo/expo-github-action)
