// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title TrustMatchNFT
 * @dev Soul-bound NFT implementing ERC-5192 for non-transferable trust credentials
 * @notice These NFTs represent verified employment credentials and cannot be transferred
 */
contract TrustMatchNFT is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // ERC-5192 Soul-bound Token events
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);

    struct TrustProfile {
        bytes32 candidateId; // World ID nullifier hash
        bytes32 credentialHash; // Reference to credential in TrustCredential contract
        uint256 trustScore; // Trust score (0-100)
        uint256 verificationCount; // Number of verifications
        uint256 issuanceDate; // When NFT was minted
        string metadataURI; // Custom metadata URI
        bool isActive; // Whether credential is active
    }

    // State variables
    mapping(uint256 => TrustProfile) public trustProfiles;
    mapping(bytes32 => uint256) public candidateToTokenId;
    mapping(uint256 => bool) public locked; // ERC-5192 compliance

    uint256 private _nextTokenId = 1;
    string private _baseTokenURI;
    address public trustCredentialContract;

    // Events
    event TrustNFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        bytes32 candidateId,
        uint256 trustScore
    );

    event TrustScoreUpdated(
        uint256 indexed tokenId,
        uint256 oldScore,
        uint256 newScore
    );

    event CredentialRevoked(uint256 indexed tokenId);

    // Modifiers
    modifier onlyTrustContract() {
        require(
            msg.sender == trustCredentialContract || msg.sender == owner(),
            "Unauthorized"
        );
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Mint a soul-bound NFT for verified employment credential
     * @param to Address to mint to
     * @param candidateId World ID nullifier hash
     * @param credentialHash Reference to credential
     * @param trustScore Initial trust score
     * @param verificationCount Number of verifications
     * @return tokenId The ID of the minted token
     */
    function mintTrustNFT(
        address to,
        bytes32 candidateId,
        bytes32 credentialHash,
        uint256 trustScore,
        uint256 verificationCount
    ) external onlyTrustContract nonReentrant returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(candidateId != bytes32(0), "Invalid candidate ID");
        require(trustScore <= 100, "Trust score must be <= 100");
        require(
            candidateToTokenId[candidateId] == 0,
            "Token already exists for candidate"
        );

        uint256 tokenId = _nextTokenId++;

        // Mint the token
        _safeMint(to, tokenId);

        // Lock the token (soul-bound)
        locked[tokenId] = true;
        emit Locked(tokenId);

        // Store trust profile
        trustProfiles[tokenId] = TrustProfile({
            candidateId: candidateId,
            credentialHash: credentialHash,
            trustScore: trustScore,
            verificationCount: verificationCount,
            issuanceDate: block.timestamp,
            metadataURI: "",
            isActive: true
        });

        candidateToTokenId[candidateId] = tokenId;

        emit TrustNFTMinted(to, tokenId, candidateId, trustScore);

        return tokenId;
    }

    /**
     * @dev Update trust score for existing NFT
     * @param tokenId Token ID to update
     * @param newTrustScore New trust score
     * @param newVerificationCount Updated verification count
     */
    function updateTrustScore(
        uint256 tokenId,
        uint256 newTrustScore,
        uint256 newVerificationCount
    ) external onlyTrustContract tokenExists(tokenId) {
        require(newTrustScore <= 100, "Trust score must be <= 100");
        require(trustProfiles[tokenId].isActive, "Credential is not active");

        uint256 oldScore = trustProfiles[tokenId].trustScore;
        trustProfiles[tokenId].trustScore = newTrustScore;
        trustProfiles[tokenId].verificationCount = newVerificationCount;

        emit TrustScoreUpdated(tokenId, oldScore, newTrustScore);
    }

    /**
     * @dev Revoke a trust credential (disable NFT)
     * @param tokenId Token ID to revoke
     */
    function revokeCredential(
        uint256 tokenId
    ) external onlyTrustContract tokenExists(tokenId) {
        trustProfiles[tokenId].isActive = false;
        emit CredentialRevoked(tokenId);
    }

    /**
     * @dev Get trust profile for a token
     * @param tokenId Token ID
     * @return TrustProfile struct
     */
    function getTrustProfile(
        uint256 tokenId
    ) external view tokenExists(tokenId) returns (TrustProfile memory) {
        return trustProfiles[tokenId];
    }

    /**
     * @dev Get token ID for a candidate
     * @param candidateId World ID nullifier hash
     * @return tokenId Token ID (0 if not found)
     */
    function getTokenIdByCandidate(
        bytes32 candidateId
    ) external view returns (uint256) {
        return candidateToTokenId[candidateId];
    }

    /**
     * @dev Check if a token is locked (ERC-5192)
     * @param tokenId Token ID to check
     * @return Whether the token is locked
     */
    function isLocked(uint256 tokenId) external view returns (bool) {
        return locked[tokenId];
    }

    /**
     * @dev Generate dynamic metadata based on trust score
     * @param tokenId Token ID
     * @return JSON metadata string
     */
    function tokenURI(
        uint256 tokenId
    ) public view override tokenExists(tokenId) returns (string memory) {
        TrustProfile memory profile = trustProfiles[tokenId];

        if (!profile.isActive) {
            return _generateRevokedMetadata(tokenId);
        }

        return _generateDynamicMetadata(tokenId, profile);
    }

    /**
     * @dev Generate dynamic metadata based on trust score
     */
    function _generateDynamicMetadata(
        uint256 tokenId,
        TrustProfile memory profile
    ) internal view returns (string memory) {
        string memory trustLevel;
        string memory badgeColor;
        string memory scoreRange;

        // Determine trust level and visual properties
        if (profile.trustScore >= 90) {
            trustLevel = "Platinum";
            badgeColor = "#E5E7EB"; // Platinum
            scoreRange = "90-100";
        } else if (profile.trustScore >= 75) {
            trustLevel = "Gold";
            badgeColor = "#FCD34D"; // Gold
            scoreRange = "75-89";
        } else if (profile.trustScore >= 60) {
            trustLevel = "Silver";
            badgeColor = "#9CA3AF"; // Silver
            scoreRange = "60-74";
        } else if (profile.trustScore >= 40) {
            trustLevel = "Bronze";
            badgeColor = "#92400E"; // Bronze
            scoreRange = "40-59";
        } else {
            trustLevel = "Unverified";
            badgeColor = "#6B7280"; // Gray
            scoreRange = "0-39";
        }

        // Generate SVG badge
        string memory svg = string(
            abi.encodePacked(
                '<svg width="350" height="350" xmlns="http://www.w3.org/2000/svg">',
                '<rect width="350" height="350" fill="',
                badgeColor,
                '" rx="25"/>',
                '<text x="175" y="100" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="white">Trust Match</text>',
                '<text x="175" y="140" font-family="Arial" font-size="18" text-anchor="middle" fill="white">',
                trustLevel,
                " Badge</text>",
                '<text x="175" y="180" font-family="Arial" font-size="36" font-weight="bold" text-anchor="middle" fill="white">',
                profile.trustScore.toString(),
                "</text>",
                '<text x="175" y="210" font-family="Arial" font-size="14" text-anchor="middle" fill="white">Trust Score</text>',
                '<text x="175" y="250" font-family="Arial" font-size="12" text-anchor="middle" fill="white">',
                profile.verificationCount.toString(),
                " Verifications</text>",
                '<text x="175" y="300" font-family="Arial" font-size="10" text-anchor="middle" fill="white">Verified Employment Credential</text>',
                "</svg>"
            )
        );

        string memory imageURI = string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(bytes(svg))
            )
        );

        // Generate JSON metadata
        string memory json = string(
            abi.encodePacked(
                '{"name": "Trust Match Badge #',
                tokenId.toString(),
                '",',
                '"description": "Verified employment credential with ',
                profile.verificationCount.toString(),
                ' verifications",',
                '"image": "',
                imageURI,
                '",',
                '"attributes": [',
                '{"trait_type": "Trust Level", "value": "',
                trustLevel,
                '"},',
                '{"trait_type": "Trust Score", "value": ',
                profile.trustScore.toString(),
                "},",
                '{"trait_type": "Score Range", "value": "',
                scoreRange,
                '"},',
                '{"trait_type": "Verifications", "value": ',
                profile.verificationCount.toString(),
                "},",
                '{"trait_type": "Issue Date", "value": ',
                profile.issuanceDate.toString(),
                "},",
                '{"trait_type": "Status", "value": "Active"}',
                "]}"
            )
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    /**
     * @dev Generate metadata for revoked credentials
     */
    function _generateRevokedMetadata(
        uint256 tokenId
    ) internal view returns (string memory) {
        TrustProfile memory profile = trustProfiles[tokenId];

        string memory svg = string(
            abi.encodePacked(
                '<svg width="350" height="350" xmlns="http://www.w3.org/2000/svg">',
                '<rect width="350" height="350" fill="#EF4444" rx="25"/>',
                '<text x="175" y="100" font-family="Arial" font-size="24" font-weight="bold" text-anchor="middle" fill="white">Trust Match</text>',
                '<text x="175" y="140" font-family="Arial" font-size="18" text-anchor="middle" fill="white">REVOKED</text>',
                '<text x="175" y="200" font-family="Arial" font-size="14" text-anchor="middle" fill="white">This credential has been revoked</text>',
                "</svg>"
            )
        );

        string memory imageURI = string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(bytes(svg))
            )
        );

        string memory json = string(
            abi.encodePacked(
                '{"name": "Trust Match Badge #',
                tokenId.toString(),
                ' (REVOKED)",',
                '"description": "This employment credential has been revoked",',
                '"image": "',
                imageURI,
                '",',
                '"attributes": [',
                '{"trait_type": "Status", "value": "Revoked"}',
                "]}"
            )
        );

        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(bytes(json))
                )
            );
    }

    /**
     * @dev Set the trust credential contract address
     * @param _trustCredentialContract Address of the TrustCredential contract
     */
    function setTrustCredentialContract(
        address _trustCredentialContract
    ) external onlyOwner {
        trustCredentialContract = _trustCredentialContract;
    }

    /**
     * @dev Set base URI for metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    /**
     * @dev Override transfer functions to make tokens soul-bound
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        // Allow minting (from == address(0)) but prevent transfers
        require(
            from == address(0) || !locked[tokenId],
            "Token is soul-bound and cannot be transferred"
        );
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Override approve to prevent approval of soul-bound tokens
     */
    function approve(address to, uint256 tokenId) public override {
        require(!locked[tokenId], "Token is soul-bound and cannot be approved");
        super.approve(to, tokenId);
    }

    /**
     * @dev Override setApprovalForAll to prevent approval of soul-bound tokens
     */
    function setApprovalForAll(
        address operator,
        bool approved
    ) public override {
        // Only allow if no tokens are locked (for future flexibility)
        super.setApprovalForAll(operator, approved);
    }

    /**
     * @dev Check if contract supports ERC-5192
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == 0xb45a3c0e || super.supportsInterface(interfaceId); // ERC-5192
    }
}
