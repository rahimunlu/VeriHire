# Trust Match Setup Guide

## 🚨 URGENT: World ID Configuration Required

You're getting "Connection to your wallet failed" because World ID is not properly configured.

## Step 1: Create World ID App

1. Go to [World Developer Portal](https://developer.worldcoin.org/)
2. Sign in with World ID
3. Click "Create App"
4. Fill in app details:

   - **App Name**: Trust Match
   - **Integration Type**: External (for mini-apps)
   - **Environment**: Staging (for development)
   - **Verification Target**: Cloud

5. Create an "Action" called `trust-match-verification`
6. Copy your `app_id` (starts with `app_staging_`)

## Step 2: Configure Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
# World ID Configuration
NEXT_PUBLIC_WORLD_APP_ID=app_staging_your_actual_app_id
WORLD_APP_ID=app_staging_your_actual_app_id
WORLD_ACTION_ID=trust-match-verification

# Optional for now
DATABASE_URL=postgresql://localhost:5432/trust_match
RESEND_API_KEY=re_your_resend_key_here
ASI_API_KEY=your_asi_key_here
```

## Step 3: Restart Development Server

```bash
cd frontend
npm run dev
```

## Alternative: Use World Simulator for Testing

If you want to test without creating an app:

1. Use the Worldcoin Simulator at [simulator.worldcoin.org](https://simulator.worldcoin.org)
2. Set app_id to `app_staging_test` (already configured as fallback)
3. This is for testing only - won't work in production

## Troubleshooting

- Make sure environment variables are loaded (restart dev server)
- Check that app_id matches exactly from Developer Portal
- Verify action name is `trust-match-verification`
- For mini-apps, ensure proper World App integration

## Next Steps After World ID Works

1. Upload resume functionality
2. Magic link employment verification
3. ZK credential generation
4. Soul-bound NFT minting
