# NFT Credential Setup Guide

## Overview

This guide explains how to set up the soul-bound NFT credential functionality for Trust Match on World Chain.

## Prerequisites

1. Deployed TrustMatchNFT contract on World Chain
2. Alchemy API key for World Chain RPC access
3. Private key of the contract owner/deployer

## Environment Variables

Add these to your `.env.local` file:

```bash
# World Chain Configuration (Chain ID: 480)
WORLD_CHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
TRUST_MATCH_NFT_CONTRACT_ADDRESS=0x... # Your deployed contract address
DEPLOYER_PRIVATE_KEY=0x... # Private key with minting permissions

# Alternative RPC endpoints for World Chain:
# WORLD_CHAIN_RPC_URL=https://rpc.worldchain.org (if available)
# WORLD_CHAIN_RPC_URL=https://worldchain.drpc.org (if available)

# Existing variables (keep these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_WORLD_APP_ID=your_world_app_id
ASI_API_KEY=your_asi_api_key
```

## Contract Deployment

1. **Deploy TrustMatchNFT Contract on World Chain**

   ```bash
   cd contracts

   # Deploy to World Chain (Chain ID: 480)
   forge create --rpc-url https://worldchain-mainnet.g.alchemy.com/v2/YOUR_API_KEY \
     --private-key YOUR_PRIVATE_KEY \
     --chain-id 480 \
     src/TrustMatchNFT.sol:TrustMatchNFT \
     --constructor-args "Trust Match Badges" "TMB" "https://trustmatch.app/metadata/"

   # Verify contract on World Chain (if verification is available)
   forge verify-contract --chain-id 480 \
     --rpc-url https://worldchain-mainnet.g.alchemy.com/v2/YOUR_API_KEY \
     YOUR_CONTRACT_ADDRESS \
     src/TrustMatchNFT.sol:TrustMatchNFT
   ```

2. **Set Contract Permissions**
   - The deployer address needs to be set as the `trustCredentialContract` or be the owner
   - Call `setTrustCredentialContract` if using a separate credential contract

## Database Setup

Run the updated migration to create the `nft_credentials` table:

```sql
-- Add this to your Supabase SQL editor
CREATE TABLE IF NOT EXISTS nft_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id TEXT NOT NULL UNIQUE,
    token_id TEXT NOT NULL,
    contract_address TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    trust_score INTEGER NOT NULL,
    verification_count INTEGER NOT NULL DEFAULT 0,
    transaction_hash TEXT NOT NULL,
    credential_hash TEXT NOT NULL,
    token_uri TEXT,
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_nft_credentials_candidate_id ON nft_credentials(candidate_id);
CREATE INDEX IF NOT EXISTS idx_nft_credentials_token_id ON nft_credentials(token_id);
CREATE INDEX IF NOT EXISTS idx_nft_credentials_wallet ON nft_credentials(wallet_address);

-- Enable RLS
ALTER TABLE nft_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Anyone can read nft_credentials" ON nft_credentials FOR SELECT USING (true);
CREATE POLICY "Anyone can insert nft_credentials" ON nft_credentials FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update nft_credentials" ON nft_credentials FOR UPDATE USING (true);
```

## World Chain Integration

World Chain is specifically designed for real humans and provides several benefits:

1. **Human-Verified Network**: Built for World ID verified users
2. **Gas Subsidies**: Reduced transaction costs for verified users
3. **Native Integration**: Seamless World ID and World App integration
4. **Chain ID**: 480 (World Chain Mainnet)
5. **Block Explorer**: https://worldscan.org
6. **Native Currency**: ETH

## How It Works

1. **User Flow**:

   - User verifies with World ID (human verification)
   - User calculates their trust score using ASI
   - User enters their wallet address
   - System mints a soul-bound NFT with their trust score on World Chain
   - NFT is non-transferable and represents verified employment credentials

2. **NFT Features**:

   - Dynamic metadata based on trust score
   - Color-coded badges (Platinum, Gold, Silver, Bronze)
   - Displays trust score and verification count
   - Soul-bound (non-transferable) using ERC-5192

3. **Trust Score Mapping**:
   - 90-100: Platinum Badge
   - 75-89: Gold Badge
   - 60-74: Silver Badge
   - 40-59: Bronze Badge
   - 0-39: Unverified

## Security Considerations

1. **Private Key Management**:

   - Store private keys securely
   - Use environment variables
   - Consider using a hardware wallet for production

2. **Contract Permissions**:

   - Only authorized addresses can mint NFTs
   - Implement proper access controls
   - Monitor for unauthorized minting attempts

3. **Gas Optimization**:
   - World Chain has sponsored gas for verified World ID users
   - Users with World ID verification get gas subsidies
   - Batch operations when possible
   - Monitor gas usage and costs
   - World Chain uses ETH as native currency

## Testing

1. **Test with Testnet First**:

   - Deploy on World Chain testnet
   - Test the full flow with test tokens
   - Verify NFT metadata and display

2. **Verify Contract Functions**:
   - Test minting with different trust scores
   - Verify soul-bound restrictions
   - Check metadata generation

## Troubleshooting

### Common Issues

1. **"Contract address not configured"**

   - Ensure `TRUST_MATCH_NFT_CONTRACT_ADDRESS` is set
   - Verify the contract is deployed

2. **"Unauthorized" error**

   - Check that the deployer address has minting permissions
   - Verify the private key corresponds to an authorized address

3. **"Token already exists"**

   - Each candidate can only have one NFT
   - The system will return the existing NFT if already minted

4. **Gas estimation failed**
   - Check RPC connection
   - Verify wallet has sufficient balance
   - Ensure contract is deployed correctly

### Logs to Check

- Look for 🎨 emoji logs for NFT minting operations
- Check transaction hashes on World Chain explorer
- Monitor Supabase logs for database operations

## Next Steps

1. **Enhanced Features**:

   - Add NFT marketplace integration
   - Implement trust score updates
   - Add revocation functionality

2. **UI Improvements**:

   - Add wallet connection with MetaMask
   - Show NFT preview before minting
   - Add transaction status tracking

3. **Analytics**:
   - Track minting success rates
   - Monitor trust score distributions
   - Analyze user engagement metrics
