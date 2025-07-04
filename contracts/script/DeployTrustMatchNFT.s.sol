// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/TrustMatchNFT.sol";

contract DeployTrustMatchNFT is Script {
    function run() external {
        // Start broadcasting transactions (private key passed via command line)
        vm.startBroadcast();

        // Deploy the TrustMatchNFT contract
        TrustMatchNFT trustMatchNFT = new TrustMatchNFT(
            "Trust Match Badges", // name
            "TMB", // symbol
            "https://trustmatch.app/metadata/" // baseURI
        );

        // Stop broadcasting
        vm.stopBroadcast();

        // Log the deployed contract address
        console.log("TrustMatchNFT deployed to:");
        console.log(address(trustMatchNFT));
        console.log("Deployer address:");
        console.log(msg.sender);
        console.log("Contract owner:");
        console.log(trustMatchNFT.owner());

        // Verify the deployment
        console.log("Contract name:");
        console.log(trustMatchNFT.name());
        console.log("Contract symbol:");
        console.log(trustMatchNFT.symbol());
    }
}
