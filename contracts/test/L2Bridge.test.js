const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("L2Bridge", function () {
  async function deployL2BridgeFixture() {
    const [owner, relayer, user1, user2, l1Bridge, attacker] = await ethers.getSigners();

    // Deploy L2Token (we need to deploy bridge first to pass address)
    // For testing, we'll deploy token with owner as bridge, then update it
    const L2Token = await ethers.getContractFactory("L2Token");
    const token = await L2Token.deploy(owner.address); // Temporary
    await token.waitForDeployment();

    // Deploy L2Bridge
    const L2Bridge = await ethers.getContractFactory("L2Bridge");
    const bridge = await L2Bridge.deploy(
      await token.getAddress(),
      l1Bridge.address,
      relayer.address
    );
    await bridge.waitForDeployment();

    // Update token's bridge address
    await token.updateBridge(await bridge.getAddress());

    return { bridge, token, owner, relayer, user1, user2, l1Bridge, attacker };
  }

  describe("Deployment", function () {
    it("Should set the correct L2 token address", async function () {
      const { bridge, token } = await loadFixture(deployL2BridgeFixture);
      expect(await bridge.l2Token()).to.equal(await token.getAddress());
    });

    it("Should set the correct L1 bridge address", async function () {
      const { bridge, l1Bridge } = await loadFixture(deployL2BridgeFixture);
      expect(await bridge.l1Bridge()).to.equal(l1Bridge.address);
    });

    it("Should set the correct relayer address", async function () {
      const { bridge, relayer } = await loadFixture(deployL2BridgeFixture);
      expect(await bridge.relayer()).to.equal(relayer.address);
    });

    it("Should initialize withdrawal counter to 0", async function () {
      const { bridge } = await loadFixture(deployL2BridgeFixture);
      expect(await bridge.withdrawalCounter()).to.equal(0);
    });

    it("Should revert if L2 token address is zero", async function () {
      const [, l1Bridge, relayer] = await ethers.getSigners();
      const L2Bridge = await ethers.getContractFactory("L2Bridge");

      await expect(
        L2Bridge.deploy(ethers.ZeroAddress, l1Bridge.address, relayer.address)
      ).to.be.revertedWith("L2 token address cannot be zero");
    });

    it("Should revert if L1 bridge address is zero", async function () {
      const [, , relayer] = await ethers.getSigners();
      const L2Token = await ethers.getContractFactory("L2Token");
      const token = await L2Token.deploy(relayer.address);
      await token.waitForDeployment();

      const L2Bridge = await ethers.getContractFactory("L2Bridge");

      await expect(
        L2Bridge.deploy(await token.getAddress(), ethers.ZeroAddress, relayer.address)
      ).to.be.revertedWith("L1 bridge address cannot be zero");
    });

    it("Should revert if relayer address is zero", async function () {
      const [, l1Bridge] = await ethers.getSigners();
      const L2Token = await ethers.getContractFactory("L2Token");
      const token = await L2Token.deploy(l1Bridge.address);
      await token.waitForDeployment();

      const L2Bridge = await ethers.getContractFactory("L2Bridge");

      await expect(
        L2Bridge.deploy(await token.getAddress(), l1Bridge.address, ethers.ZeroAddress)
      ).to.be.revertedWith("Relayer address cannot be zero");
    });
  });

  describe("Deposit Finalization", function () {
    it("Should finalize deposit from L1", async function () {
      const { bridge, token, relayer, user1 } = await loadFixture(deployL2BridgeFixture);

      const amount = ethers.parseEther("100");
      const depositId = 0;

      await expect(
        bridge.connect(relayer).finalizeDeposit(user1.address, amount, depositId)
      ).to.emit(bridge, "DepositFinalized");

      expect(await token.balanceOf(user1.address)).to.equal(amount);
      expect(await bridge.processedDeposits(depositId)).to.be.true;
    });

    it("Should prevent duplicate deposit finalization", async function () {
      const { bridge, relayer, user1 } = await loadFixture(deployL2BridgeFixture);

      const amount = ethers.parseEther("100");
      const depositId = 0;

      // First finalization should succeed
      await bridge.connect(relayer).finalizeDeposit(user1.address, amount, depositId);

      // Second attempt should fail
      await expect(
        bridge.connect(relayer).finalizeDeposit(user1.address, amount, depositId)
      ).to.be.revertedWith("Deposit already processed");
    });

    it("Should only allow relayer to finalize deposits", async function () {
      const { bridge, user1, attacker } = await loadFixture(deployL2BridgeFixture);

      await expect(
        bridge.connect(attacker).finalizeDeposit(
          user1.address,
          ethers.parseEther("100"),
          0
        )
      ).to.be.revertedWith("Only relayer can call");
    });

    it("Should revert on zero amount", async function () {
      const { bridge, relayer, user1 } = await loadFixture(deployL2BridgeFixture);

      await expect(
        bridge.connect(relayer).finalizeDeposit(user1.address, 0, 0)
      ).to.be.revertedWith("Amount must be greater than zero");
    });

    it("Should revert on zero address", async function () {
      const { bridge, relayer } = await loadFixture(deployL2BridgeFixture);

      await expect(
        bridge.connect(relayer).finalizeDeposit(
          ethers.ZeroAddress,
          ethers.parseEther("100"),
          0
        )
      ).to.be.revertedWith("Recipient address cannot be zero");
    });
  });

  describe("Withdrawal Initiation", function () {
    it("Should initiate withdrawal to L1", async function () {
      const { bridge, token, relayer, user1 } = await loadFixture(deployL2BridgeFixture);

      // First finalize a deposit to give user1 tokens
      const amount = ethers.parseEther("100");
      await bridge.connect(relayer).finalizeDeposit(user1.address, amount, 0);

      // Now user1 can initiate withdrawal
      const withdrawAmount = ethers.parseEther("50");

      await expect(
        bridge.connect(user1).initiateWithdrawal(user1.address, withdrawAmount)
      ).to.emit(bridge, "WithdrawalInitiated");

      expect(await token.balanceOf(user1.address)).to.equal(amount - withdrawAmount);
      expect(await bridge.withdrawalCounter()).to.equal(1);
    });

    it("Should increment withdrawal counter", async function () {
      const { bridge, relayer, user1, user2 } = await loadFixture(deployL2BridgeFixture);

      // Finalize deposits for both users
      await bridge.connect(relayer).finalizeDeposit(user1.address, ethers.parseEther("100"), 0);
      await bridge.connect(relayer).finalizeDeposit(user2.address, ethers.parseEther("100"), 1);

      // Initiate withdrawals
      await bridge.connect(user1).initiateWithdrawal(user1.address, ethers.parseEther("50"));
      expect(await bridge.withdrawalCounter()).to.equal(1);

      await bridge.connect(user2).initiateWithdrawal(user2.address, ethers.parseEther("30"));
      expect(await bridge.withdrawalCounter()).to.equal(2);
    });

    it("Should revert if insufficient balance", async function () {
      const { bridge, relayer, user1 } = await loadFixture(deployL2BridgeFixture);

      // User1 has no tokens yet
      await expect(
        bridge.connect(user1).initiateWithdrawal(user1.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });

    it("Should revert on zero amount", async function () {
      const { bridge, relayer, user1 } = await loadFixture(deployL2BridgeFixture);

      // Give user1 tokens first
      await bridge.connect(relayer).finalizeDeposit(user1.address, ethers.parseEther("100"), 0);

      await expect(
        bridge.connect(user1).initiateWithdrawal(user1.address, 0)
      ).to.be.revertedWith("Amount must be greater than zero");
    });

    it("Should revert on zero address", async function () {
      const { bridge, relayer, user1 } = await loadFixture(deployL2BridgeFixture);

      // Give user1 tokens first
      await bridge.connect(relayer).finalizeDeposit(user1.address, ethers.parseEther("100"), 0);

      await expect(
        bridge.connect(user1).initiateWithdrawal(ethers.ZeroAddress, ethers.parseEther("50"))
      ).to.be.revertedWith("Recipient address cannot be zero");
    });

    it("Should store withdrawal data correctly", async function () {
      const { bridge, relayer, user1 } = await loadFixture(deployL2BridgeFixture);

      // Give user1 tokens
      await bridge.connect(relayer).finalizeDeposit(user1.address, ethers.parseEther("100"), 0);

      // Initiate withdrawal
      const amount = ethers.parseEther("50");
      const tx = await bridge.connect(user1).initiateWithdrawal(user1.address, amount);
      const receipt = await tx.wait();

      // Get withdrawal hash from event
      const event = receipt.logs.find(log => {
        try {
          return bridge.interface.parseLog(log).name === "WithdrawalInitiated";
        } catch {
          return false;
        }
      });

      const parsedEvent = bridge.interface.parseLog(event);
      const withdrawalHash = parsedEvent.args.withdrawalHash;

      // Check stored data
      const withdrawal = await bridge.getWithdrawal(withdrawalHash);
      expect(withdrawal.from).to.equal(user1.address);
      expect(withdrawal.to).to.equal(user1.address);
      expect(withdrawal.amount).to.equal(amount);
      expect(withdrawal.exists).to.be.true;
    });
  });

  describe("Security", function () {
    it("Should pause and unpause", async function () {
      const { bridge, relayer, user1, owner } = await loadFixture(deployL2BridgeFixture);

      // Pause the bridge
      await bridge.connect(owner).pause();

      // Attempt to finalize deposit should fail
      await expect(
        bridge.connect(relayer).finalizeDeposit(
          user1.address,
          ethers.parseEther("100"),
          0
        )
      ).to.be.reverted;

      // Unpause
      await bridge.connect(owner).unpause();

      // Finalize deposit should now succeed
      await expect(
        bridge.connect(relayer).finalizeDeposit(
          user1.address,
          ethers.parseEther("100"),
          0
        )
      ).to.emit(bridge, "DepositFinalized");
    });

    it("Should only allow owner to pause", async function () {
      const { bridge, user1 } = await loadFixture(deployL2BridgeFixture);

      await expect(
        bridge.connect(user1).pause()
      ).to.be.reverted;
    });
  });

  describe("Admin Functions", function () {
    it("Should update relayer address", async function () {
      const { bridge, owner } = await loadFixture(deployL2BridgeFixture);
      const [,,,,, newRelayer] = await ethers.getSigners();

      await expect(bridge.connect(owner).updateRelayer(newRelayer.address))
        .to.emit(bridge, "RelayerUpdated");

      expect(await bridge.relayer()).to.equal(newRelayer.address);
    });

    it("Should revert updating relayer to zero address", async function () {
      const { bridge, owner } = await loadFixture(deployL2BridgeFixture);

      await expect(
        bridge.connect(owner).updateRelayer(ethers.ZeroAddress)
      ).to.be.revertedWith("Relayer address cannot be zero");
    });

    it("Should only allow owner to update relayer", async function () {
      const { bridge, user1 } = await loadFixture(deployL2BridgeFixture);
      const [,,,,, newRelayer] = await ethers.getSigners();

      await expect(
        bridge.connect(user1).updateRelayer(newRelayer.address)
      ).to.be.reverted;
    });
  });

  describe("View Functions", function () {
    it("Should check if deposit is processed", async function () {
      const { bridge, relayer, user1 } = await loadFixture(deployL2BridgeFixture);

      expect(await bridge.isDepositProcessed(0)).to.be.false;

      await bridge.connect(relayer).finalizeDeposit(
        user1.address,
        ethers.parseEther("100"),
        0
      );

      expect(await bridge.isDepositProcessed(0)).to.be.true;
    });
  });

  describe("Gas Optimization", function () {
    it("Should demonstrate gas usage for deposit finalization", async function () {
      const { bridge, relayer, user1 } = await loadFixture(deployL2BridgeFixture);

      const tx = await bridge.connect(relayer).finalizeDeposit(
        user1.address,
        ethers.parseEther("100"),
        0
      );
      const receipt = await tx.wait();

      console.log("Deposit finalization gas used:", receipt.gasUsed.toString());

      expect(receipt.gasUsed).to.be.lessThan(200000);
    });

    it("Should demonstrate gas usage for withdrawal initiation", async function () {
      const { bridge, relayer, user1 } = await loadFixture(deployL2BridgeFixture);

      // Give user tokens first
      await bridge.connect(relayer).finalizeDeposit(
        user1.address,
        ethers.parseEther("100"),
        0
      );

      const tx = await bridge.connect(user1).initiateWithdrawal(
        user1.address,
        ethers.parseEther("50")
      );
      const receipt = await tx.wait();

      console.log("Withdrawal initiation gas used:", receipt.gasUsed.toString());

      expect(receipt.gasUsed).to.be.lessThan(250000);
    });
  });
});
