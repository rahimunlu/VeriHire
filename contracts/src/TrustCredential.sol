// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title TrustCredential
 * @dev Privacy-preserving employment verification system using ZK proofs
 * @notice This contract stores employment verification proofs without revealing sensitive data
 */
contract TrustCredential is Ownable, ReentrancyGuard, Pausable {
    struct EmploymentProof {
        bytes32 credentialHash; // Hash of employment details
        bytes32 verificationProof; // ZK proof of verification
        uint256 trustScore; // Calculated trust score (0-100)
        uint256 verificationCount; // Number of successful verifications
        uint256 issuanceDate; // When credential was issued
        bool isActive; // Whether credential is still valid
    }

    struct VerificationRequest {
        bytes32 candidateId; // World ID nullifier hash
        bytes32 companyHash; // Hashed company name
        bytes32 positionHash; // Hashed position title
        bytes32 employerHash; // Hashed employer identifier
        bool verified; // Verification result
        uint256 timestamp; // Verification timestamp
    }

    // Mappings
    mapping(bytes32 => EmploymentProof) public credentials;
    mapping(bytes32 => VerificationRequest[]) public verificationHistory;
    mapping(bytes32 => bool) public nullifierHashes;
    mapping(address => bool) public authorizedVerifiers;

    // Events
    event CredentialIssued(
        bytes32 indexed candidateId,
        bytes32 credentialHash,
        uint256 trustScore
    );

    event EmploymentVerified(
        bytes32 indexed candidateId,
        bytes32 companyHash,
        bool verified,
        uint256 timestamp
    );

    event TrustScoreUpdated(
        bytes32 indexed candidateId,
        uint256 oldScore,
        uint256 newScore
    );

    event VerifierAuthorized(address indexed verifier, bool authorized);

    // Modifiers
    modifier onlyAuthorizedVerifier() {
        require(
            authorizedVerifiers[msg.sender] || msg.sender == owner(),
            "Not authorized verifier"
        );
        _;
    }

    modifier validNullifier(bytes32 _nullifierHash) {
        require(_nullifierHash != bytes32(0), "Invalid nullifier hash");
        _;
    }

    constructor() Ownable(msg.sender) {
        authorizedVerifiers[msg.sender] = true;
    }

    /**
     * @dev Issue a new trust credential for a candidate
     * @param _candidateId World ID nullifier hash (unique identifier)
     * @param _credentialHash Hash of employment details
     * @param _verificationProof ZK proof of verification
     * @param _initialTrustScore Initial trust score (0-100)
     */
    function issueCredential(
        bytes32 _candidateId,
        bytes32 _credentialHash,
        bytes32 _verificationProof,
        uint256 _initialTrustScore
    )
        external
        onlyAuthorizedVerifier
        validNullifier(_candidateId)
        whenNotPaused
    {
        require(_credentialHash != bytes32(0), "Invalid credential hash");
        require(_initialTrustScore <= 100, "Trust score must be <= 100");
        require(!nullifierHashes[_candidateId], "Credential already exists");

        nullifierHashes[_candidateId] = true;

        credentials[_candidateId] = EmploymentProof({
            credentialHash: _credentialHash,
            verificationProof: _verificationProof,
            trustScore: _initialTrustScore,
            verificationCount: 0,
            issuanceDate: block.timestamp,
            isActive: true
        });

        emit CredentialIssued(
            _candidateId,
            _credentialHash,
            _initialTrustScore
        );
    }

    /**
     * @dev Add employment verification to candidate's history
     * @param _candidateId World ID nullifier hash
     * @param _companyHash Hashed company name
     * @param _positionHash Hashed position title
     * @param _employerHash Hashed employer identifier
     * @param _verified Whether employment was verified
     */
    function addEmploymentVerification(
        bytes32 _candidateId,
        bytes32 _companyHash,
        bytes32 _positionHash,
        bytes32 _employerHash,
        bool _verified
    )
        external
        onlyAuthorizedVerifier
        validNullifier(_candidateId)
        whenNotPaused
    {
        require(
            credentials[_candidateId].isActive,
            "No active credential found"
        );

        VerificationRequest memory verification = VerificationRequest({
            candidateId: _candidateId,
            companyHash: _companyHash,
            positionHash: _positionHash,
            employerHash: _employerHash,
            verified: _verified,
            timestamp: block.timestamp
        });

        verificationHistory[_candidateId].push(verification);

        if (_verified) {
            credentials[_candidateId].verificationCount++;
            _updateTrustScore(_candidateId, true);
        } else {
            _updateTrustScore(_candidateId, false);
        }

        emit EmploymentVerified(
            _candidateId,
            _companyHash,
            _verified,
            block.timestamp
        );
    }

    /**
     * @dev Update trust score based on verification results
     * @param _candidateId World ID nullifier hash
     * @param _verified Whether the verification was successful
     */
    function _updateTrustScore(bytes32 _candidateId, bool _verified) internal {
        EmploymentProof storage credential = credentials[_candidateId];
        uint256 oldScore = credential.trustScore;

        if (_verified) {
            // Increase score for successful verification (diminishing returns)
            uint256 increase = 10 - (credential.verificationCount / 5);
            credential.trustScore = _min(100, credential.trustScore + increase);
        } else {
            // Decrease score for failed verification
            credential.trustScore = credential.trustScore > 5
                ? credential.trustScore - 5
                : 0;
        }

        emit TrustScoreUpdated(_candidateId, oldScore, credential.trustScore);
    }

    /**
     * @dev Get candidate's trust credential
     * @param _candidateId World ID nullifier hash
     * @return credentialHash Hash of the credential
     * @return trustScore Current trust score
     * @return verificationCount Number of verifications
     * @return issuanceDate When credential was issued
     * @return isActive Whether credential is active
     */
    function getCredential(
        bytes32 _candidateId
    )
        external
        view
        returns (
            bytes32 credentialHash,
            uint256 trustScore,
            uint256 verificationCount,
            uint256 issuanceDate,
            bool isActive
        )
    {
        EmploymentProof memory credential = credentials[_candidateId];
        return (
            credential.credentialHash,
            credential.trustScore,
            credential.verificationCount,
            credential.issuanceDate,
            credential.isActive
        );
    }

    /**
     * @dev Get verification history for a candidate
     * @param _candidateId World ID nullifier hash
     * @return Array of verification requests
     */
    function getVerificationHistory(
        bytes32 _candidateId
    ) external view returns (VerificationRequest[] memory) {
        return verificationHistory[_candidateId];
    }

    /**
     * @dev Verify if a candidate has a valid credential
     * @param _candidateId World ID nullifier hash
     * @return isValid Whether candidate has valid credential
     * @return trustScore Their trust score
     */
    function verifyCredential(
        bytes32 _candidateId
    ) external view returns (bool isValid, uint256 trustScore) {
        EmploymentProof memory credential = credentials[_candidateId];
        return (
            credential.isActive && credential.credentialHash != bytes32(0),
            credential.trustScore
        );
    }

    /**
     * @dev Authorize/deauthorize verifiers
     * @param _verifier Address to authorize
     * @param _authorized Whether to authorize or deauthorize
     */
    function setAuthorizedVerifier(
        address _verifier,
        bool _authorized
    ) external onlyOwner {
        authorizedVerifiers[_verifier] = _authorized;
        emit VerifierAuthorized(_verifier, _authorized);
    }

    /**
     * @dev Revoke a credential (for compliance or fraud cases)
     * @param _candidateId World ID nullifier hash
     */
    function revokeCredential(bytes32 _candidateId) external onlyOwner {
        require(credentials[_candidateId].isActive, "Credential not active");
        credentials[_candidateId].isActive = false;
    }

    /**
     * @dev Pause contract (emergency use)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get minimum of two numbers
     */
    function _min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Generate credential hash from employment data
     * @param _candidateId World ID nullifier hash
     * @param _company Company name
     * @param _position Position title
     * @param _startDate Employment start date
     * @param _endDate Employment end date
     * @return Credential hash
     */
    function generateCredentialHash(
        bytes32 _candidateId,
        string memory _company,
        string memory _position,
        uint256 _startDate,
        uint256 _endDate
    ) external pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    _candidateId,
                    _company,
                    _position,
                    _startDate,
                    _endDate
                )
            );
    }
}
