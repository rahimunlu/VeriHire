# VeriHire - World Mini App

This is the World Mini App version of VeriHire, built to run natively inside the World App with full integration of World ID and World Chain.

## Features

- **World ID Integration**: Seamless biometric verification
- **World Chain Compatible**: Built for the World ecosystem
- **Native World App Experience**: Optimized for World App interface
- **Safe Area Handling**: Automatically adjusts for World App UI elements
- **Transaction Support**: Native blockchain transactions through World App
- **Share Functionality**: Share content using World App's sharing features

## Development Setup

### Prerequisites

- Node.js 18+ (required for Next.js 15)
- npm or yarn
- World App for testing (iOS/Android)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Testing in World App

1. **Local Development**:

   ```bash
   # Expose your local server using ngrok
   ngrok http 3000
   ```

2. **Configure in Developer Portal**:

   - Go to [World Developer Portal](https://developer.world.org)
   - Add your ngrok URL as the Mini App URL
   - Submit for testing

3. **Test on Device**:
   - Open World App on your mobile device
   - Navigate to your Mini App
   - Test all functionality

### World Mini App Components

#### MiniKitProvider

Provides World App context and connection state throughout the app.

```tsx
import { MiniKitProvider } from "@/components/minikit-provider";

export default function RootLayout({ children }) {
  return <MiniKitProvider>{children}</MiniKitProvider>;
}
```

#### WorldAppLayout

Handles safe area insets and World App specific styling.

```tsx
import { WorldAppLayout } from "@/components/world-app-layout";

export default function MyPage() {
  return <WorldAppLayout>{/* Your content */}</WorldAppLayout>;
}
```

#### useWorldMiniApp Hook

Provides World Mini App specific functionality.

```tsx
import { useWorldMiniApp } from "@/hooks/use-world-mini-app";

export default function MyComponent() {
  const { isConnected, sendTransaction, share, copyToClipboard } =
    useWorldMiniApp();

  const handleTransaction = async () => {
    const result = await sendTransaction({
      to: "0x...",
      value: "0.1",
      data: "0x...",
    });
  };

  return (
    <div>
      <p>Connected: {isConnected ? "Yes" : "No"}</p>
      <button onClick={handleTransaction}>Send Transaction</button>
    </div>
  );
}
```

## Key Features

### 1. World ID Integration

- Biometric verification through World ID
- Sybil-proof user authentication
- Privacy-preserving zero-knowledge proofs

### 2. World Chain Integration

- Native blockchain transactions
- Gas-free transactions (sponsored by World App)
- Smart contract interactions

### 3. Mini App Features

- **Safe Area Handling**: Automatic adjustment for World App UI
- **Native Sharing**: Share content using World App's sharing system
- **Deep Linking**: Navigate between Mini App sections
- **Clipboard Access**: Copy content to device clipboard

### 4. Responsive Design

- Optimized for mobile devices
- World App native styling
- Smooth animations and transitions

## Environment Variables

```bash
# Add to .env.local
NEXT_PUBLIC_WORLD_APP_ENV=development
NEXT_PUBLIC_WORLD_CHAIN_RPC=https://worldchain.org
```

## Deployment

### For World App Review

1. **Build for Production**:

   ```bash
   npm run build
   ```

2. **Deploy to Your Hosting**:

   - Vercel (recommended)
   - Netlify
   - Firebase Hosting

3. **Submit to World Developer Portal**:
   - Update your Mini App URL
   - Submit for review
   - Wait for approval

### Important Notes

- **Mainnet Only**: World Mini Apps must be deployed to mainnet
- **Gas Sponsorship**: World App sponsors gas fees for verified users
- **Security**: All transactions are secured by World ID verification

## Architecture

```
frontend(new)/
├── src/
│   ├── components/
│   │   ├── minikit-provider.tsx      # World App context
│   │   ├── world-app-layout.tsx      # Safe area handling
│   │   └── ui/                       # UI components
│   ├── hooks/
│   │   ├── use-world-mini-app.ts     # World Mini App utilities
│   │   └── use-toast.ts              # Toast notifications
│   ├── app/
│   │   ├── layout.tsx                # Root layout with MiniKit
│   │   └── page.tsx                  # Main landing page
│   └── lib/
│       └── utils.ts                  # Utility functions
├── public/
│   └── manifest.json                 # Web App Manifest
└── package.json                      # Dependencies
```

## Troubleshooting

### Common Issues

1. **Not Connected to World App**:

   - Ensure you're testing in World App, not a regular browser
   - Check that window.WorldApp is available

2. **Transaction Failures**:

   - Verify contract addresses are correct
   - Check gas limits and transaction data
   - Ensure user has sufficient balance

3. **Safe Area Issues**:

   - Use WorldAppLayout component
   - Check safeAreaInsets values
   - Test on different devices

4. **World ID Verification Issues**:
   - **"Verification Rejected"**: For World Mini Apps, explicit World ID verification is not needed
   - **Email Verification Loop**: Users in World App are automatically verified - no separate action required
   - **Action Not Found**: Mini Apps don't need specific World ID actions - verification is automatic
   - **App ID Issues**: For mini apps, you can use the default staging app ID

### Debug Mode

```tsx
// Enable debug logging
console.log("World App detected:", !!window.WorldApp);
console.log("MiniKit connected:", isConnected);
console.log("World ID verified:", isWorldIdVerified);
```

### World ID Mini App Configuration

For World Mini Apps, the verification process is automatic:

1. **No Manual World ID Required**: Users are automatically verified when using World App
2. **No Action Parameter**: Mini apps don't need specific World ID actions
3. **Automatic Redirect**: Users should skip the World ID verification step
4. **Environment Variables**: Can use default staging values for mini apps

```bash
# .env.local (for mini apps)
NEXT_PUBLIC_WORLD_APP_ID=app_staging_test
WORLD_ACTION_ID=trust-match-verification
```

## Support

- [World Developer Documentation](https://docs.world.org)
- [World Developer Portal](https://developer.world.org)
- [World Discord Community](https://discord.gg/world)

## License

This project is licensed under the MIT License.
