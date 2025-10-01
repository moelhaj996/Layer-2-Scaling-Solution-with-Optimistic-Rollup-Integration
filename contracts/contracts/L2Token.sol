// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title L2Token
 * @dev L2 wrapped token with mint/burn capability restricted to bridge
 */
contract L2Token is ERC20, Ownable {
    address public bridge;

    event BridgeUpdated(address indexed oldBridge, address indexed newBridge);

    modifier onlyBridge() {
        require(msg.sender == bridge, "Only bridge can call");
        _;
    }

    constructor(address _bridge) ERC20("L2 Test Token", "L2TEST") Ownable(msg.sender) {
        require(_bridge != address(0), "Bridge address cannot be zero");
        bridge = _bridge;
    }

    /**
     * @notice Mint tokens (only callable by bridge)
     * @param to Recipient address
     * @param amount Amount to mint
     */
    function mint(address to, uint256 amount) external onlyBridge {
        _mint(to, amount);
    }

    /**
     * @notice Burn tokens (only callable by bridge)
     * @param from Address to burn from
     * @param amount Amount to burn
     */
    function burn(address from, uint256 amount) external onlyBridge {
        _burn(from, amount);
    }

    /**
     * @notice Update bridge address (emergency only)
     * @param _newBridge New bridge address
     */
    function updateBridge(address _newBridge) external onlyOwner {
        require(_newBridge != address(0), "Bridge address cannot be zero");
        address oldBridge = bridge;
        bridge = _newBridge;
        emit BridgeUpdated(oldBridge, _newBridge);
    }
}
