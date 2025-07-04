# Trust Match - World Chain Deployment Guide

## 🌍 Overview

Trust Match is now fully configured for World Chain deployment with soul-bound NFT credentials. This guide covers the complete setup process for deploying on World Chain (Chain ID: 480).

## ✅ Completed Setup

### 1. Database Migration ✅

- ✅ `nft_credentials` table created via Supabase MCP
- ✅ Proper indexes and RLS policies applied
- ✅ All tables ready for production

### 2. World Chain Integration ✅

- ✅ Chain ID 480 configuration
- ✅ World Chain RPC endpoints configured
- ✅ Network verification in API
- ✅ Worldscan.org explorer integration
- ✅ ETH balance checking for gas

### 3. Smart Contract Integration ✅

- ✅ TrustMatchNFT contract ABI integrated
- ✅ Soul-bound NFT minting functionality
- ✅ Dynamic metadata generation
- ✅ Trust score to badge mapping
- ✅ Duplicate prevention logic

### 4. Frontend Updates ✅

- ✅ Wallet address input for NFT minting
- ✅ World Chain transaction links
- ✅ NFT success display with metadata
- ✅ Loading states and error handling

## 🚀 Deployment Steps

### Step 1: Environment Configuration

Create `.env.local` with these World Chain specific variables:

```bash
# World Chain Configuration (Chain ID: 480)
WORLD_CHAIN_RPC_URL=https://worldchain-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY
TRUST_MATCH_NFT_CONTRACT_ADDRESS=0x... # Your deployed contract address
DEPLOYER_PRIVATE_KEY=0x... # Private key with minting permissions

# Existing Supabase & World ID (keep these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_WORLD_APP_ID=your_world_app_id
ASI_API_KEY=your_asi_api_key
```

### Step 2: Deploy Smart Contract on World Chain

```bash
cd contracts

# Deploy to World Chain Mainnet
forge create --rpc-url https://worldchain-mainnet.g.alchemy.com/v2/YOUR_API_KEY \
  --private-key YOUR_PRIVATE_KEY \
  --chain-id 480 \
  src/TrustMatchNFT.sol:TrustMatchNFT \
  --constructor-args "Trust Match Badges" "TMB" "https://trustmatch.app/metadata/"

# Note the deployed contract address for your .env.local
```

### Step 3: Set Contract Permissions

The deployer wallet automatically becomes the owner and can mint NFTs. If you want to use a different address for minting, call:

```solidity
// Set the backend wallet as authorized minter
contract.setTrustCredentialContract(BACKEND_WALLET_ADDRESS);
```

### Step 4: Fund the Deployer Wallet

Ensure your deployer wallet has ETH on World Chain for gas fees:

- World ID verified users get gas subsidies
- Monitor wallet balance in the API logs
- Fund via World Chain bridge if needed

### Step 5: Test the Complete Flow

1. **World ID Verification**: User verifies with World ID
2. **Resume Upload**: Upload and parse resume
3. **Employment Verification**: Send magic links to employers
4. **Trust Score Calculation**: Calculate AI trust score using ASI
5. **NFT Minting**: Enter wallet address and mint soul-bound NFT
6. **Verification**: Check transaction on worldscan.org

## 🎨 NFT Features

### Trust Score Badges

- 🏆 **90-100**: Platinum Badge (Light Gray)
- 🥇 **75-89**: Gold Badge (Gold)
- 🥈 **60-74**: Silver Badge (Silver)
- 🥉 **40-59**: Bronze Badge (Bronze)
- ⚪ **0-39**: Unverified (Gray)

### Dynamic Metadata

- SVG-based badges with trust scores
- Verification count display
- Color-coded trust levels
- Revocation support

### Soul-Bound Properties (ERC-5192)

- Non-transferable NFTs
- Locked upon minting
- Permanent employment credentials
- One NFT per candidate

## 🔧 Technical Architecture

### World Chain Specific Features

- **Chain ID**: 480
- **Native Currency**: ETH
- **Block Explorer**: https://worldscan.org
- **Gas Subsidies**: For World ID verified users
- **Human-Verified Network**: Built for real humans

### API Endpoints

- `POST /api/credential/create` - Mint NFT credentials
- Network verification ensures World Chain deployment
- Comprehensive error handling and logging
- Database integration for audit trails

### Database Schema

```sql
nft_credentials:
- candidate_id (unique)
- token_id
- contract_address
- wallet_address
- trust_score
- verification_count
- transaction_hash
- credential_hash
- token_uri
- minted_at
```

## 🛡️ Security Considerations

### Private Key Management

- Store `DEPLOYER_PRIVATE_KEY` securely
- Use environment variables only
- Consider hardware wallets for production
- Monitor wallet balance and transactions

### Contract Security

- Only authorized addresses can mint
- One NFT per candidate (duplicate prevention)
- Soul-bound restrictions prevent transfers
- Revocation functionality available

### Network Security

- Chain ID verification prevents wrong network deployment
- RPC endpoint validation
- Gas estimation before transactions
- Transaction confirmation waiting

## 📊 Monitoring & Analytics

### Transaction Monitoring

- All transactions logged with 🎨 emoji
- Transaction hashes linked to worldscan.org
- Gas usage tracking
- Success/failure rates

### Database Tracking

- NFT credentials stored in Supabase
- Trust score history maintained
- Verification audit trails
- User journey analytics

## 🐛 Troubleshooting

### Common Issues

1. **"Wrong network" error**

   - Verify `WORLD_CHAIN_RPC_URL` is correct
   - Check chain ID is 480
   - Confirm Alchemy API key is valid

2. **"Unauthorized" minting error**

   - Verify deployer private key has minting permissions
   - Check contract ownership
   - Ensure wallet has sufficient ETH

3. **"Token already exists"**

   - Each candidate can only have one NFT
   - System returns existing NFT information
   - Check `nft_credentials` table for existing entries

4. **Gas estimation failed**
   - Verify wallet has ETH balance
   - Check RPC connection
   - Confirm contract is deployed correctly

### Debug Logs to Monitor

- 🌍 World Chain connection logs
- 👛 Wallet address and balance
- 📡 Network verification
- 🎯 NFT minting parameters
- ✅ Transaction confirmation

## 🎯 Next Steps

### Production Deployment

1. Deploy contract to World Chain mainnet
2. Set up monitoring and alerts
3. Configure backup RPC endpoints
4. Implement rate limiting
5. Set up analytics dashboard

### Enhanced Features

1. **Batch Minting**: Multiple NFTs in one transaction
2. **Trust Score Updates**: Update existing NFT scores
3. **Revocation System**: Revoke compromised credentials
4. **Marketplace Integration**: Display NFTs in wallets
5. **Cross-Chain Bridge**: Support other EVM chains

## 📞 Support

If you encounter issues:

1. Check the console logs for 🎨 emoji markers
2. Verify all environment variables are set
3. Confirm contract deployment on worldscan.org
4. Check wallet balance and permissions
5. Review Supabase database for data integrity

---

**Trust Match on World Chain**: Bringing verified employment credentials to the human-verified blockchain! 🌍✨
