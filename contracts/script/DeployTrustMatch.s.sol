// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/TrustCredential.sol";
import "../src/TrustMatchNFT.sol";

contract DeployTrustMatch is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // Deploy TrustCredential contract
        TrustCredential trustCredential = new TrustCredential();
        console.log("TrustCredential deployed at:", address(trustCredential));

        // Deploy TrustMatchNFT contract
        TrustMatchNFT trustMatchNFT = new TrustMatchNFT(
            "Trust Match Badge",
            "TRUST",
            "https://api.trustmatch.com/metadata/"
        );
        console.log("TrustMatchNFT deployed at:", address(trustMatchNFT));

        // Set the trust credential contract address in the NFT contract
        trustMatchNFT.setTrustCredentialContract(address(trustCredential));
        console.log("TrustCredential contract address set in NFT contract");

        // Authorize the NFT contract as a verifier in the credential contract
        trustCredential.setAuthorizedVerifier(address(trustMatchNFT), true);
        console.log("NFT contract authorized as verifier");

        vm.stopBroadcast();

        // Log deployment info
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("Network: World Chain");
        console.log("TrustCredential:", address(trustCredential));
        console.log("TrustMatchNFT:", address(trustMatchNFT));
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("========================\n");
    }
}
