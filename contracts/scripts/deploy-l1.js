const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying L1 contracts to Sepolia...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy TestToken
  console.log("📝 Deploying TestToken...");
  const TestToken = await hre.ethers.getContractFactory("TestToken");
  const testToken = await TestToken.deploy();
  await testToken.waitForDeployment();
  const tokenAddress = await testToken.getAddress();
  console.log("✅ TestToken deployed to:", tokenAddress);

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await testToken.deploymentTransaction().wait(5);

  // Deploy L1Bridge (use a placeholder for L2 bridge initially)
  console.log("\n📝 Deploying L1Bridge...");
  const L1Bridge = await hre.ethers.getContractFactory("L1Bridge");
  const l1Bridge = await L1Bridge.deploy(
    tokenAddress,
    "0x0000000000000000000000000000000000000001" // Placeholder, update after L2 deployment
  );
  await l1Bridge.waitForDeployment();
  const bridgeAddress = await l1Bridge.getAddress();
  console.log("✅ L1Bridge deployed to:", bridgeAddress);

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await l1Bridge.deploymentTransaction().wait(5);

  // Save deployment addresses
  const deploymentData = {
    network: "sepolia",
    chainId: 11155111,
    testToken: tokenAddress,
    l1Bridge: bridgeAddress,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };

  const deploymentDir = path.join(process.cwd(), "deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentDir, "l1-deployment.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("\n📄 Deployment info saved to deployments/l1-deployment.json");

  console.log("\n" + "=".repeat(60));
  console.log("🎉 L1 Deployment Complete!");
  console.log("=".repeat(60));
  console.log("TestToken:", tokenAddress);
  console.log("L1Bridge:", bridgeAddress);
  console.log("\n⚠️  IMPORTANT: Update L2Bridge address in L1Bridge after L2 deployment");
  console.log("Contract verification command:");
  console.log(`npx hardhat verify --network sepolia ${tokenAddress}`);
  console.log(`npx hardhat verify --network sepolia ${bridgeAddress} ${tokenAddress} "0x0000000000000000000000000000000000000001"`);
  console.log("=".repeat(60));

  // Mint some tokens to deployer for testing
  console.log("\n💰 Minting test tokens to deployer...");
  const mintTx = await testToken.mint(deployer.address, hre.ethers.parseEther("10000"));
  await mintTx.wait();
  console.log("✅ Minted 10,000 TEST tokens");

  console.log("\n✨ All done! Update your .env file with these addresses.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
