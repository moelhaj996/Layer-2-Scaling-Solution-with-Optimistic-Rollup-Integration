const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying L2 contracts to Optimism Sepolia...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Load L1 deployment data
  const l1DeploymentPath = path.join(process.cwd(), "deployments", "l1-deployment.json");
  if (!fs.existsSync(l1DeploymentPath)) {
    console.error("❌ L1 deployment file not found. Deploy L1 contracts first!");
    process.exit(1);
  }

  const l1Deployment = JSON.parse(fs.readFileSync(l1DeploymentPath, "utf8"));
  console.log("📝 Using L1Bridge address:", l1Deployment.l1Bridge);

  // Deploy L2Bridge (use deployer as initial relayer)
  console.log("\n📝 Deploying L2Bridge...");
  const L2Bridge = await hre.ethers.getContractFactory("L2Bridge");
  const l2Bridge = await L2Bridge.deploy(
    "0x0000000000000000000000000000000000000002", // Placeholder for L2Token
    l1Deployment.l1Bridge,
    deployer.address // Initial relayer
  );
  await l2Bridge.waitForDeployment();
  const bridgeAddress = await l2Bridge.getAddress();
  console.log("✅ L2Bridge deployed to:", bridgeAddress);

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await l2Bridge.deploymentTransaction().wait(5);

  // Deploy L2Token
  console.log("\n📝 Deploying L2Token...");
  const L2Token = await hre.ethers.getContractFactory("L2Token");
  const l2Token = await L2Token.deploy(bridgeAddress);
  await l2Token.waitForDeployment();
  const tokenAddress = await l2Token.getAddress();
  console.log("✅ L2Token deployed to:", tokenAddress);

  // Wait for confirmations
  console.log("⏳ Waiting for confirmations...");
  await l2Token.deploymentTransaction().wait(5);

  // Save deployment addresses
  const deploymentData = {
    network: "optimismSepolia",
    chainId: 11155420,
    l2Token: tokenAddress,
    l2Bridge: bridgeAddress,
    l1Bridge: l1Deployment.l1Bridge,
    relayer: deployer.address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };

  const deploymentDir = path.join(process.cwd(), "deployments");
  fs.writeFileSync(
    path.join(deploymentDir, "l2-deployment.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("\n📄 Deployment info saved to deployments/l2-deployment.json");

  console.log("\n" + "=".repeat(60));
  console.log("🎉 L2 Deployment Complete!");
  console.log("=".repeat(60));
  console.log("L2Token:", tokenAddress);
  console.log("L2Bridge:", bridgeAddress);
  console.log("Relayer:", deployer.address);
  console.log("\n⚠️  IMPORTANT: Update L2Bridge address in L1Bridge contract");
  console.log("Run this command on L1:");
  console.log(`l1Bridge.updateL2Bridge("${bridgeAddress}")`);
  console.log("\nContract verification commands:");
  console.log(`npx hardhat verify --network optimismSepolia ${tokenAddress} ${bridgeAddress}`);
  console.log(`npx hardhat verify --network optimismSepolia ${bridgeAddress} "0x0000000000000000000000000000000000000002" ${l1Deployment.l1Bridge} ${deployer.address}`);
  console.log("=".repeat(60));

  // Create combined deployment file
  const combinedDeployment = {
    l1: l1Deployment,
    l2: deploymentData,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(deploymentDir, "deployment-summary.json"),
    JSON.stringify(combinedDeployment, null, 2)
  );

  console.log("\n📋 Combined deployment summary saved to deployments/deployment-summary.json");
  console.log("\n✨ All done! Update your .env file with these addresses:");
  console.log(`L1_BRIDGE_ADDRESS=${l1Deployment.l1Bridge}`);
  console.log(`L2_BRIDGE_ADDRESS=${bridgeAddress}`);
  console.log(`L1_TOKEN_ADDRESS=${l1Deployment.testToken}`);
  console.log(`L2_TOKEN_ADDRESS=${tokenAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
