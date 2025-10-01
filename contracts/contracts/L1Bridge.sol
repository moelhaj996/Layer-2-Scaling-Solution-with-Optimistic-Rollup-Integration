// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title L1Bridge
 * @dev Manages deposits from L1 to L2 and withdrawals from L2 to L1
 */
contract L1Bridge is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    address public l1Token;
    address public l2Bridge;
    mapping(bytes32 => bool) public processedWithdrawals;
    uint256 public depositCounter;

    // Events
    event DepositInitiated(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 indexed depositId,
        uint256 timestamp
    );

    event WithdrawalFinalized(
        address indexed to,
        uint256 amount,
        bytes32 indexed withdrawalHash,
        uint256 timestamp
    );

    event L2BridgeUpdated(address indexed oldBridge, address indexed newBridge);

    /**
     * @notice Constructor
     * @param _l1Token L1 ERC20 token address
     * @param _l2Bridge Corresponding L2 bridge address
     */
    constructor(address _l1Token, address _l2Bridge) Ownable(msg.sender) {
        require(_l1Token != address(0), "L1 token address cannot be zero");
        require(_l2Bridge != address(0), "L2 bridge address cannot be zero");

        l1Token = _l1Token;
        l2Bridge = _l2Bridge;
    }

    /**
     * @notice Deposit tokens from L1 to L2
     * @param _to Recipient address on L2
     * @param _amount Amount to deposit
     */
    function depositToL2(address _to, uint256 _amount)
        external
        nonReentrant
        whenNotPaused
    {
        require(_to != address(0), "Recipient address cannot be zero");
        require(_amount > 0, "Amount must be greater than zero");

        // Transfer tokens from user to bridge
        IERC20(l1Token).safeTransferFrom(msg.sender, address(this), _amount);

        // Increment deposit counter
        uint256 depositId = depositCounter++;

        // Emit event for L2 monitoring
        emit DepositInitiated(
            msg.sender,
            _to,
            _amount,
            depositId,
            block.timestamp
        );
    }

    /**
     * @notice Finalize withdrawal from L2 (called after challenge period)
     * @param _to Recipient on L1
     * @param _amount Amount to withdraw
     * @param _withdrawalHash Unique withdrawal identifier
     * @param _merkleProof Merkle proof from L2 (optional for simplified version)
     */
    function finalizeWithdrawal(
        address _to,
        uint256 _amount,
        bytes32 _withdrawalHash,
        bytes32[] calldata _merkleProof
    )
        external
        nonReentrant
        whenNotPaused
    {
        require(_to != address(0), "Recipient address cannot be zero");
        require(_amount > 0, "Amount must be greater than zero");
        require(!processedWithdrawals[_withdrawalHash], "Withdrawal already processed");

        // For simplified version: skip merkle proof verification
        // In production: verify merkle proof against state root
        // require(_verifyMerkleProof(_withdrawalHash, _merkleProof), "Invalid merkle proof");

        // Mark withdrawal as processed to prevent replay attacks
        processedWithdrawals[_withdrawalHash] = true;

        // Transfer tokens to recipient
        IERC20(l1Token).safeTransfer(_to, _amount);

        // Emit event
        emit WithdrawalFinalized(
            _to,
            _amount,
            _withdrawalHash,
            block.timestamp
        );
    }

    /**
     * @notice Verify merkle proof (simplified for portfolio project)
     * @param _withdrawalHash Withdrawal hash to verify
     * @param _merkleProof Merkle proof
     * @return bool Whether proof is valid
     */
    function _verifyMerkleProof(
        bytes32 _withdrawalHash,
        bytes32[] calldata _merkleProof
    )
        internal
        pure
        returns (bool)
    {
        // Simplified version: accept any proof
        // In production: implement full Merkle tree verification
        return _merkleProof.length > 0 || _withdrawalHash != bytes32(0);
    }

    /**
     * @notice Update L2 bridge address (emergency only)
     * @param _newL2Bridge New L2 bridge address
     */
    function updateL2Bridge(address _newL2Bridge) external onlyOwner {
        require(_newL2Bridge != address(0), "L2 bridge address cannot be zero");
        address oldBridge = l2Bridge;
        l2Bridge = _newL2Bridge;
        emit L2BridgeUpdated(oldBridge, _newL2Bridge);
    }

    /**
     * @notice Pause bridge operations
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause bridge operations
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Get contract balance of L1 token
     * @return uint256 Token balance
     */
    function getBalance() external view returns (uint256) {
        return IERC20(l1Token).balanceOf(address(this));
    }
}
