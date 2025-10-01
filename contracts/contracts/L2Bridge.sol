// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./L2Token.sol";

/**
 * @title L2Bridge
 * @dev Handle deposits from L1 and initiate withdrawals to L1
 */
contract L2Bridge is ReentrancyGuard, Ownable, Pausable {
    address public l2Token;
    address public l1Bridge;
    address public relayer;
    uint256 public withdrawalCounter;

    mapping(uint256 => bool) public processedDeposits;
    mapping(bytes32 => WithdrawalData) public withdrawals;

    struct WithdrawalData {
        address from;
        address to;
        uint256 amount;
        uint256 withdrawalId;
        uint256 timestamp;
        bool exists;
    }

    // Events
    event DepositFinalized(
        address indexed to,
        uint256 amount,
        uint256 indexed depositId,
        uint256 timestamp
    );

    event WithdrawalInitiated(
        address indexed from,
        address indexed to,
        uint256 amount,
        uint256 indexed withdrawalId,
        bytes32 withdrawalHash,
        uint256 timestamp
    );

    event RelayerUpdated(address indexed oldRelayer, address indexed newRelayer);

    modifier onlyRelayer() {
        require(msg.sender == relayer, "Only relayer can call");
        _;
    }

    /**
     * @notice Constructor
     * @param _l2Token L2 wrapped token address
     * @param _l1Bridge Corresponding L1 bridge address
     * @param _relayer Authorized relayer address
     */
    constructor(
        address _l2Token,
        address _l1Bridge,
        address _relayer
    ) Ownable(msg.sender) {
        require(_l2Token != address(0), "L2 token address cannot be zero");
        require(_l1Bridge != address(0), "L1 bridge address cannot be zero");
        require(_relayer != address(0), "Relayer address cannot be zero");

        l2Token = _l2Token;
        l1Bridge = _l1Bridge;
        relayer = _relayer;
    }

    /**
     * @notice Finalize deposit from L1 (called by relayer monitoring L1 events)
     * @param _to Recipient on L2
     * @param _amount Amount to mint
     * @param _depositId Deposit ID from L1
     */
    function finalizeDeposit(
        address _to,
        uint256 _amount,
        uint256 _depositId
    )
        external
        onlyRelayer
        nonReentrant
        whenNotPaused
    {
        require(_to != address(0), "Recipient address cannot be zero");
        require(_amount > 0, "Amount must be greater than zero");
        require(!processedDeposits[_depositId], "Deposit already processed");

        // Mark deposit as processed
        processedDeposits[_depositId] = true;

        // Mint L2 tokens to recipient
        L2Token(l2Token).mint(_to, _amount);

        // Emit event
        emit DepositFinalized(_to, _amount, _depositId, block.timestamp);
    }

    /**
     * @notice Initiate withdrawal from L2 to L1
     * @param _to Recipient address on L1
     * @param _amount Amount to withdraw
     */
    function initiateWithdrawal(address _to, uint256 _amount)
        external
        nonReentrant
        whenNotPaused
    {
        require(_to != address(0), "Recipient address cannot be zero");
        require(_amount > 0, "Amount must be greater than zero");

        // Burn L2 tokens from sender
        L2Token(l2Token).burn(msg.sender, _amount);

        // Increment withdrawal counter
        uint256 withdrawalId = withdrawalCounter++;

        // Create withdrawal hash
        bytes32 withdrawalHash = keccak256(
            abi.encodePacked(
                msg.sender,
                _to,
                _amount,
                withdrawalId,
                block.timestamp
            )
        );

        // Store withdrawal data
        withdrawals[withdrawalHash] = WithdrawalData({
            from: msg.sender,
            to: _to,
            amount: _amount,
            withdrawalId: withdrawalId,
            timestamp: block.timestamp,
            exists: true
        });

        // Emit event for L1 bridge to listen
        emit WithdrawalInitiated(
            msg.sender,
            _to,
            _amount,
            withdrawalId,
            withdrawalHash,
            block.timestamp
        );
    }

    /**
     * @notice Update relayer address
     * @param _newRelayer New relayer address
     */
    function updateRelayer(address _newRelayer) external onlyOwner {
        require(_newRelayer != address(0), "Relayer address cannot be zero");
        address oldRelayer = relayer;
        relayer = _newRelayer;
        emit RelayerUpdated(oldRelayer, _newRelayer);
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
     * @notice Check if deposit has been processed
     * @param _depositId Deposit ID to check
     * @return bool Whether deposit has been processed
     */
    function isDepositProcessed(uint256 _depositId) external view returns (bool) {
        return processedDeposits[_depositId];
    }

    /**
     * @notice Get withdrawal data
     * @param _withdrawalHash Withdrawal hash
     * @return WithdrawalData Withdrawal data
     */
    function getWithdrawal(bytes32 _withdrawalHash)
        external
        view
        returns (WithdrawalData memory)
    {
        return withdrawals[_withdrawalHash];
    }
}
