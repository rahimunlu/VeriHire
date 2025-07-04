import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// World Chain configuration
const WORLD_CHAIN_RPC =
  process.env.WORLD_CHAIN_RPC_URL ||
  "https://worldchain-sepolia.g.alchemy.com/public";
const WORLD_CHAIN_ID = 4801; // World Chain sepolia chain ID
const TRUST_MATCH_NFT_CONTRACT = process.env.TRUST_MATCH_NFT_CONTRACT_ADDRESS;
const DEPLOYER_PRIVATE_KEY = process.env.WORLD_CHAIN_PRIVATE_KEY;

// World Chain specific configuration
const WORLD_CHAIN_CONFIG = {
  chainId: WORLD_CHAIN_ID,
  name: "World Chain",
  rpcUrl: WORLD_CHAIN_RPC,
  blockExplorer: "https://worldscan.org",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
};

// Contract ABI - only the functions we need
const TRUST_MATCH_NFT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "bytes32", name: "candidateId", type: "bytes32" },
      { internalType: "bytes32", name: "credentialHash", type: "bytes32" },
      { internalType: "uint256", name: "trustScore", type: "uint256" },
      { internalType: "uint256", name: "verificationCount", type: "uint256" },
    ],
    name: "mintTrustNFT",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "candidateId", type: "bytes32" }],
    name: "getTokenIdByCandidate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
];

export async function POST(request: NextRequest) {
  try {
    console.log("🎨 Starting NFT credential creation...");

    const { candidateId, walletAddress } = await request.json();

    // Validate inputs
    if (!candidateId || !walletAddress) {
      return NextResponse.json(
        { error: "Missing candidateId or walletAddress" },
        { status: 400 },
      );
    }

    if (!ethers.isAddress(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 },
      );
    }

    // Check environment variables
    if (!TRUST_MATCH_NFT_CONTRACT || !DEPLOYER_PRIVATE_KEY) {
      console.error("❌ Missing configuration:", {
        contract: !!TRUST_MATCH_NFT_CONTRACT,
        privateKey: !!DEPLOYER_PRIVATE_KEY,
      });
      return NextResponse.json(
        {
          error: "Contract address or private key not configured",
          details: {
            contract: !!TRUST_MATCH_NFT_CONTRACT,
            privateKey: !!DEPLOYER_PRIVATE_KEY,
          },
        },
        { status: 500 },
      );
    }

    console.log("📊 Fetching candidate trust score...");

    // Get the latest trust score for the candidate
    const { data: trustScoreData, error: trustScoreError } = await supabase
      .from("trust_scores")
      .select("*")
      .eq("candidate_id", candidateId)
      .order("calculated_at", { ascending: false })
      .limit(1)
      .single();

    if (trustScoreError || !trustScoreData) {
      return NextResponse.json(
        {
          error:
            "Trust score not found. Please calculate your trust score first.",
        },
        { status: 404 },
      );
    }

    console.log("📈 Trust score found:", {
      score: trustScoreData.score,
      verifications: trustScoreData.breakdown?.verification_rate || 0,
    });

    // Get verification count
    const { data: verifications, error: verificationError } = await supabase
      .from("verifications")
      .select("*")
      .eq("candidate_id", candidateId)
      .eq("verified", true);

    const verificationCount = verifications?.length || 0;
    console.log("✅ Verification count:", verificationCount);

    // Set up Web3 connection to World Chain
    console.log("🌐 Connecting to World Chain...");
    console.log("🔗 Chain ID:", WORLD_CHAIN_ID);
    console.log("🌍 RPC URL:", WORLD_CHAIN_RPC);

    const provider = new ethers.JsonRpcProvider(WORLD_CHAIN_RPC, {
      chainId: WORLD_CHAIN_ID,
      name: WORLD_CHAIN_CONFIG.name,
    });

    // Verify we're connected to World Chain
    const network = await provider.getNetwork();
    console.log("📡 Connected to network:", {
      name: network.name,
      chainId: network.chainId.toString(),
    });

    if (Number(network.chainId) !== WORLD_CHAIN_ID) {
      throw new Error(
        `Wrong network! Expected World Chain (${WORLD_CHAIN_ID}), got ${network.chainId}`,
      );
    }

    const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
    console.log("👛 Wallet address:", wallet.address);

    // Check wallet balance
    const balance = await provider.getBalance(wallet.address);
    console.log("💰 Wallet balance:", ethers.formatEther(balance), "ETH");

    if (balance === BigInt(0)) {
      return NextResponse.json(
        {
          error: "Insufficient funds for deployment",
          details:
            "Wallet has no ETH. Please fund the wallet with World Chain Sepolia testnet ETH.",
          walletAddress: wallet.address,
          balance: ethers.formatEther(balance),
        },
        { status: 402 },
      );
    }

    const contract = new ethers.Contract(
      TRUST_MATCH_NFT_CONTRACT,
      TRUST_MATCH_NFT_ABI,
      wallet,
    );

    // Check if NFT already exists for this candidate
    console.log("🔍 Checking for existing NFT...");
    const existingTokenId = await contract.getTokenIdByCandidate(candidateId);

    if (existingTokenId > 0) {
      console.log(
        "⚠️ NFT already exists for candidate:",
        existingTokenId.toString(),
      );

      // Get the existing NFT metadata
      const tokenURI = await contract.tokenURI(existingTokenId);

      return NextResponse.json({
        success: true,
        message: "NFT already exists for this candidate",
        tokenId: existingTokenId.toString(),
        tokenURI,
        contractAddress: TRUST_MATCH_NFT_CONTRACT,
        isExisting: true,
      });
    }

    // Generate credential hash (combination of candidate ID and trust score)
    const credentialHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["bytes32", "uint256", "uint256"],
        [candidateId, trustScoreData.score, Date.now()],
      ),
    );

    console.log("🎯 Minting NFT with parameters:", {
      to: walletAddress,
      candidateId,
      credentialHash,
      trustScore: trustScoreData.score,
      verificationCount,
    });

    // Mint the NFT
    console.log("⛽ Estimating gas...");
    const gasEstimate = await contract.mintTrustNFT.estimateGas(
      walletAddress,
      candidateId,
      credentialHash,
      trustScoreData.score,
      verificationCount,
    );

    console.log("📝 Sending transaction...");
    const tx = await contract.mintTrustNFT(
      walletAddress,
      candidateId,
      credentialHash,
      trustScoreData.score,
      verificationCount,
      {
        gasLimit: (gasEstimate * BigInt(120)) / BigInt(100), // Add 20% buffer
      },
    );

    console.log("⏳ Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed:", receipt.hash);

    // Get the token ID from the transaction logs
    const mintEvent = receipt.logs.find((log: any) => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed?.name === "TrustNFTMinted";
      } catch {
        return false;
      }
    });

    let tokenId = "0";
    if (mintEvent) {
      const parsed = contract.interface.parseLog(mintEvent);
      tokenId = parsed?.args?.tokenId?.toString() || "0";
    }

    console.log("🎨 NFT minted successfully:", {
      tokenId,
      transactionHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
    });

    // Get the token URI for metadata
    let tokenURI = "";
    try {
      tokenURI = await contract.tokenURI(tokenId);
    } catch (error) {
      console.warn("Could not fetch token URI:", error);
    }

    // Store the NFT information in the database
    try {
      const { error: storeError } = await supabase
        .from("nft_credentials")
        .insert({
          candidate_id: candidateId,
          token_id: tokenId,
          contract_address: TRUST_MATCH_NFT_CONTRACT,
          wallet_address: walletAddress,
          trust_score: trustScoreData.score,
          verification_count: verificationCount,
          transaction_hash: receipt.hash,
          credential_hash: credentialHash,
          token_uri: tokenURI,
          minted_at: new Date().toISOString(),
        });

      if (storeError) {
        console.error("Error storing NFT data:", storeError);
        // Don't fail the request, just log the error
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
    }

    return NextResponse.json({
      success: true,
      message: "Trust credential NFT minted successfully!",
      tokenId,
      transactionHash: receipt.hash,
      contractAddress: TRUST_MATCH_NFT_CONTRACT,
      tokenURI,
      trustScore: trustScoreData.score,
      verificationCount,
      gasUsed: receipt.gasUsed.toString(),
    });
  } catch (error) {
    console.error("❌ NFT minting error:", error);

    let errorMessage = "Failed to mint NFT";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
