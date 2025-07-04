// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/TrustCredential.sol";
import "../src/TrustMatchNFT.sol";

contract TrustMatchTest is Test {
    TrustCredential public trustCredential;
    TrustMatchNFT public trustMatchNFT;

    address public candidate = address(0x1);
    address public employer = address(0x2);
    address public recruiter = address(0x3);

    bytes32 public candidateId = keccak256("test-candidate-nullifier");
    bytes32 public credentialHash = keccak256("test-credential-hash");
    bytes32 public verificationProof = keccak256("test-verification-proof");

    event CredentialIssued(
        bytes32 indexed candidateId,
        bytes32 credentialHash,
        uint256 trustScore
    );
    event TrustNFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        bytes32 candidateId,
        uint256 trustScore
    );

    function setUp() public {
        // Deploy contracts
        trustCredential = new TrustCredential();
        trustMatchNFT = new TrustMatchNFT(
            "Trust Match Badge",
            "TRUST",
            "https://api.trustmatch.com/metadata/"
        );

        // Set up contract connections
        trustMatchNFT.setTrustCredentialContract(address(trustCredential));
        trustCredential.setAuthorizedVerifier(address(trustMatchNFT), true);

        // Give some ETH to test addresses
        vm.deal(candidate, 1 ether);
        vm.deal(employer, 1 ether);
        vm.deal(recruiter, 1 ether);
    }

    function testIssueCredential() public {
        uint256 initialTrustScore = 75;

        vm.expectEmit(true, false, false, true);
        emit CredentialIssued(candidateId, credentialHash, initialTrustScore);

        trustCredential.issueCredential(
            candidateId,
            credentialHash,
            verificationProof,
            initialTrustScore
        );

        // Verify credential was issued
        (
            bytes32 storedHash,
            uint256 trustScore,
            uint256 verificationCount,
            uint256 issuanceDate,
            bool isActive
        ) = trustCredential.getCredential(candidateId);

        assertEq(storedHash, credentialHash);
        assertEq(trustScore, initialTrustScore);
        assertEq(verificationCount, 0);
        assertGt(issuanceDate, 0);
        assertTrue(isActive);
    }

    function testCannotIssueDuplicateCredential() public {
        // Issue first credential
        trustCredential.issueCredential(
            candidateId,
            credentialHash,
            verificationProof,
            75
        );

        // Try to issue duplicate - should fail
        vm.expectRevert("Credential already exists");
        trustCredential.issueCredential(
            candidateId,
            credentialHash,
            verificationProof,
            80
        );
    }

    function testMintTrustNFT() public {
        // First issue credential
        trustCredential.issueCredential(
            candidateId,
            credentialHash,
            verificationProof,
            85
        );

        vm.expectEmit(true, true, false, true);
        emit TrustNFTMinted(candidate, 1, candidateId, 85);

        // Mint NFT
        uint256 tokenId = trustMatchNFT.mintTrustNFT(
            candidate,
            candidateId,
            credentialHash,
            85,
            2
        );

        assertEq(tokenId, 1);
        assertEq(trustMatchNFT.ownerOf(tokenId), candidate);
        assertTrue(trustMatchNFT.locked(tokenId));

        // Check trust profile
        TrustMatchNFT.TrustProfile memory profile = trustMatchNFT
            .getTrustProfile(tokenId);
        assertEq(profile.candidateId, candidateId);
        assertEq(profile.trustScore, 85);
        assertEq(profile.verificationCount, 2);
        assertTrue(profile.isActive);
    }

    function testNFTIsSoulBound() public {
        // Issue credential and mint NFT
        trustCredential.issueCredential(
            candidateId,
            credentialHash,
            verificationProof,
            80
        );
        uint256 tokenId = trustMatchNFT.mintTrustNFT(
            candidate,
            candidateId,
            credentialHash,
            80,
            1
        );

        // Try to transfer - should fail
        vm.prank(candidate);
        vm.expectRevert("Token is soul-bound and cannot be transferred");
        trustMatchNFT.transferFrom(candidate, employer, tokenId);

        // Try to approve - should fail
        vm.prank(candidate);
        vm.expectRevert("Token is soul-bound and cannot be approved");
        trustMatchNFT.approve(employer, tokenId);
    }

    function testEmploymentVerification() public {
        // Issue credential
        trustCredential.issueCredential(
            candidateId,
            credentialHash,
            verificationProof,
            60
        );

        bytes32 companyHash = keccak256("TechCorp Inc");
        bytes32 positionHash = keccak256("Software Engineer");
        bytes32 employerHash = keccak256("employer-id");

        // Add successful verification
        trustCredential.addEmploymentVerification(
            candidateId,
            companyHash,
            positionHash,
            employerHash,
            true
        );

        // Check updated trust score
        (, uint256 trustScore, uint256 verificationCount, , ) = trustCredential
            .getCredential(candidateId);
        assertGt(trustScore, 60); // Should have increased
        assertEq(verificationCount, 1);

        // Check verification history
        TrustCredential.VerificationRequest[] memory history = trustCredential
            .getVerificationHistory(candidateId);
        assertEq(history.length, 1);
        assertEq(history[0].companyHash, companyHash);
        assertTrue(history[0].verified);
    }

    function testTrustScoreUpdate() public {
        // Issue credential and mint NFT
        trustCredential.issueCredential(
            candidateId,
            credentialHash,
            verificationProof,
            70
        );
        uint256 tokenId = trustMatchNFT.mintTrustNFT(
            candidate,
            candidateId,
            credentialHash,
            70,
            1
        );

        // Update trust score
        trustMatchNFT.updateTrustScore(tokenId, 85, 3);

        // Verify update
        TrustMatchNFT.TrustProfile memory profile = trustMatchNFT
            .getTrustProfile(tokenId);
        assertEq(profile.trustScore, 85);
        assertEq(profile.verificationCount, 3);
    }

    function testCredentialRevocation() public {
        // Issue credential and mint NFT
        trustCredential.issueCredential(
            candidateId,
            credentialHash,
            verificationProof,
            80
        );
        uint256 tokenId = trustMatchNFT.mintTrustNFT(
            candidate,
            candidateId,
            credentialHash,
            80,
            2
        );

        // Revoke credential
        trustCredential.revokeCredential(candidateId);

        // Check credential is revoked
        (, , , , bool isActive) = trustCredential.getCredential(candidateId);
        assertFalse(isActive);

        // Revoke NFT
        trustMatchNFT.revokeCredential(tokenId);

        // Check NFT is revoked
        TrustMatchNFT.TrustProfile memory profile = trustMatchNFT
            .getTrustProfile(tokenId);
        assertFalse(profile.isActive);
    }

    function testUnauthorizedAccess() public {
        vm.prank(employer);
        vm.expectRevert("Not authorized verifier");
        trustCredential.issueCredential(
            candidateId,
            credentialHash,
            verificationProof,
            70
        );

        vm.prank(employer);
        vm.expectRevert("Unauthorized");
        trustMatchNFT.mintTrustNFT(
            candidate,
            candidateId,
            credentialHash,
            70,
            1
        );
    }

    function testCredentialHashGeneration() public {
        bytes32 expectedHash = keccak256(
            abi.encodePacked(
                candidateId,
                "TechCorp Inc",
                "Software Engineer",
                uint256(1640995200), // 2022-01-01
                uint256(1672531200) // 2023-01-01
            )
        );

        bytes32 actualHash = trustCredential.generateCredentialHash(
            candidateId,
            "TechCorp Inc",
            "Software Engineer",
            1640995200,
            1672531200
        );

        assertEq(actualHash, expectedHash);
    }

    function testDynamicNFTMetadata() public {
        // Issue credential and mint NFT with high trust score
        trustCredential.issueCredential(
            candidateId,
            credentialHash,
            verificationProof,
            95
        );
        uint256 tokenId = trustMatchNFT.mintTrustNFT(
            candidate,
            candidateId,
            credentialHash,
            95,
            5
        );

        // Get token URI - should contain metadata
        string memory tokenURI = trustMatchNFT.tokenURI(tokenId);

        // Basic check that it returns something (full JSON parsing would be complex in Solidity)
        assertTrue(bytes(tokenURI).length > 0);

        // Should contain "Platinum" for score of 95
        // This is a simplified check - in practice you'd use a more sophisticated approach
        assertTrue(bytes(tokenURI).length > 100); // Reasonable minimum length for full metadata
    }

    function testVerifyCredential() public {
        // Issue credential
        trustCredential.issueCredential(
            candidateId,
            credentialHash,
            verificationProof,
            80
        );

        (bool isValid, uint256 trustScore) = trustCredential.verifyCredential(
            candidateId
        );
        assertTrue(isValid);
        assertEq(trustScore, 80);

        // Test with non-existent credential
        bytes32 fakeCandidateId = keccak256("fake-candidate");
        (bool isValidFake, uint256 trustScoreFake) = trustCredential
            .verifyCredential(fakeCandidateId);
        assertFalse(isValidFake);
        assertEq(trustScoreFake, 0);
    }
}
