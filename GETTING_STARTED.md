# Getting Started Guide - L2 Scaling Solution

This guide will walk you through setting up and running the L2 Scaling Solution project on your local machine.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Deployment](#deployment)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** (v18 or higher)
  ```bash
  node --version  # Should be >= 18.0.0
  ```

- **Java** (JDK 17 or higher)
  ```bash
  java --version  # Should be >= 17
  ```

- **Maven** (v3.8 or higher)
  ```bash
  mvn --version  # Should be >= 3.8
  ```

- **Docker & Docker Compose**
  ```bash
  docker --version
  docker-compose --version
  ```

- **Git**
  ```bash
  git --version
  ```

### Recommended IDE/Editors

- **For Solidity**: VSCode with Solidity extension
- **For Java**: IntelliJ IDEA, Eclipse, or VSCode with Java extensions
- **For Frontend**: VSCode with ESLint and Prettier

### Blockchain Requirements

- **Ethereum Wallet**: MetaMask or similar
- **Testnet ETH**: Sepolia ETH for L1 (get from [Sepolia Faucet](https://sepoliafaucet.com/))
- **Optimism Sepolia ETH**: Bridge from Sepolia at [Optimism Bridge](https://app.optimism.io/bridge)
- **Infura Account**: For RPC access ([Sign up](https://infura.io/))
- **WalletConnect Project**: For frontend wallet integration ([Create project](https://cloud.walletconnect.com/))

## 📥 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/l2-scaling-solution.git
cd l2-scaling-solution
```

### Step 2: Install Smart Contract Dependencies

```bash
cd contracts
npm install
cd ..
```

### Step 3: Install Backend Dependencies

```bash
cd backend
mvn clean install
cd ..
```

### Step 4: Install Frontend Dependencies (if building frontend)

```bash
cd frontend
npm install
cd ..
```

## ⚙️ Configuration

### Step 1: Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

### Step 2: Configure RPC URLs

Edit `.env` and add your Infura project ID:

```bash
# Replace YOUR_INFURA_PROJECT_ID with your actual project ID
L1_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
L2_RPC_URL=https://sepolia.optimism.io
```

### Step 3: Set Up Database Credentials

```bash
DB_USER=postgres
DB_PASSWORD=your_secure_password
```

### Step 4: Configure Private Key (for relayer)

**⚠️ IMPORTANT**: Use a dedicated test wallet with only testnet ETH. NEVER use your main wallet!

```bash
# Create a new wallet for testing
PRIVATE_KEY=0xYOUR_TEST_WALLET_PRIVATE_KEY
```

### Step 5: Get WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy the Project ID
4. Add to `.env`:

```bash
WALLET_CONNECT_PROJECT_ID=your_project_id_here
```

## 🚀 Deployment

### Option A: Deploy with Docker (Easiest - Recommended for First Time)

This will set up the entire stack (database, backend, frontend):

```bash
# Make sure Docker is running
docker-compose up -d

# Check logs
docker-compose logs -f

# Access services:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8080
# - PostgreSQL: localhost:5432
```

### Option B: Manual Deployment (For Development)

#### 1. Start PostgreSQL

```bash
# Using Docker
docker run --name l2-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=l2scaling \
  -p 5432:5432 \
  -d postgres:15-alpine

# Or install PostgreSQL locally and create database:
createdb l2scaling
```

#### 2. Deploy Smart Contracts

**Deploy to Sepolia (L1):**

```bash
cd contracts

# Compile contracts
npm run compile

# Run tests first to ensure everything works
npm test

# Deploy to Sepolia
npm run deploy:l1

# Save the deployed addresses shown in terminal
```

**Deploy to Optimism Sepolia (L2):**

```bash
# Deploy to Optimism Sepolia
npm run deploy:l2

# This will automatically read L1 addresses from deployment file
```

**Update Environment File:**

After deployment, update `.env` with the contract addresses:

```bash
L1_BRIDGE_ADDRESS=0x... # From deploy-l1 output
L2_BRIDGE_ADDRESS=0x... # From deploy-l2 output
L1_TOKEN_ADDRESS=0x...  # From deploy-l1 output
L2_TOKEN_ADDRESS=0x...  # From deploy-l2 output
```

#### 3. Update L1Bridge with L2Bridge Address

You need to update the L1 bridge contract with the L2 bridge address:

```javascript
// Using Hardhat console
npx hardhat console --network sepolia

const L1Bridge = await ethers.getContractFactory("L1Bridge");
const bridge = L1Bridge.attach("YOUR_L1_BRIDGE_ADDRESS");
await bridge.updateL2Bridge("YOUR_L2_BRIDGE_ADDRESS");
```

Or create a script `scripts/update-l1-bridge.js`:

```javascript
import hre from "hardhat";

async function main() {
  const l1BridgeAddress = process.env.L1_BRIDGE_ADDRESS;
  const l2BridgeAddress = process.env.L2_BRIDGE_ADDRESS;

  const L1Bridge = await hre.ethers.getContractFactory("L1Bridge");
  const bridge = L1Bridge.attach(l1BridgeAddress);

  console.log("Updating L1Bridge with L2Bridge address...");
  const tx = await bridge.updateL2Bridge(l2BridgeAddress);
  await tx.wait();

  console.log("✅ L1Bridge updated successfully!");
}

main();
```

#### 4. Start Backend Service

```bash
cd backend

# Run with Maven
mvn spring-boot:run

# Or build and run JAR
mvn clean package
java -jar target/*.jar

# Backend will start on http://localhost:8080
```

#### 5. Start Frontend (Optional)

```bash
cd frontend

# Development mode
npm run dev

# Production build
npm run build
npm start

# Frontend will start on http://localhost:3000
```

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts

# Run all tests
npm test

# Run with gas reporting
npm run test:gas

# Run coverage
npm run test:coverage

# Expected output: All tests should pass with >80% coverage
```

### Backend Tests

```bash
cd backend

# Run unit tests
mvn test

# Run integration tests
mvn verify

# Generate coverage report
mvn jacoco:report
# View report: target/site/jacoco/index.html
```

### Frontend Tests (if implemented)

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📊 Verifying the Setup

### 1. Check Backend Health

```bash
curl http://localhost:8080/api/health

# Expected response:
# {
#   "status": "UP",
#   "l1Connected": true,
#   "l2Connected": true
# }
```

### 2. Check Database Connection

```bash
# Connect to PostgreSQL
docker exec -it l2-postgres psql -U postgres -d l2scaling

# List tables
\dt

# Expected tables:
# - l1_transactions
# - l2_transactions
# - gas_analytics
# - bridge_events
# - system_metadata
```

### 3. Test Gas Analytics API

```bash
curl http://localhost:8080/api/analytics/gas-comparison

# Expected: JSON response with L1 vs L2 gas comparison
```

### 4. Test Bridge Functionality

1. Open frontend: http://localhost:3000
2. Connect your wallet (make sure you're on Sepolia network)
3. Approve tokens for bridge
4. Deposit tokens from L1 to L2
5. Check transaction status in dashboard
6. Verify tokens appear on L2

## 🐛 Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Issue: "Insufficient funds for intrinsic transaction cost"

**Solution:**
- Make sure you have enough Sepolia ETH in your wallet
- Get more from [Sepolia Faucet](https://sepoliafaucet.com/)

### Issue: "Hardhat tests fail with 'require is not defined'"

**Solution:**
- This is a Node.js version compatibility issue
- Use Node.js v18 LTS or downgrade Hardhat
- Or remove `"type": "module"` from contracts/package.json if not using ES modules

### Issue: "Web3j connection timeout"

**Solution:**
```bash
# Check RPC URLs in .env
# Test connection manually:
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  -H "Content-Type: application/json" \
  YOUR_RPC_URL

# If timeout, try different RPC provider (Alchemy, Ankr)
```

### Issue: "Port 8080 already in use"

**Solution:**
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 PID

# Or change port in application.yml
server:
  port: 8081
```

### Issue: "Frontend can't connect to backend"

**Solution:**
1. Check backend is running: `curl http://localhost:8080/api/health`
2. Check CORS settings in WebSocketConfig.java
3. Update NEXT_PUBLIC_API_URL in .env if using different port

### Issue: "MetaMask shows wrong network"

**Solution:**
1. In MetaMask, switch to Sepolia network
2. For Optimism Sepolia, add network manually:
   - Network Name: Optimism Sepolia
   - RPC URL: https://sepolia.optimism.io
   - Chain ID: 11155420
   - Currency Symbol: ETH
   - Block Explorer: https://sepolia-optimism.etherscan.io

## 📚 Next Steps

1. **Explore the Dashboard**: Open http://localhost:3000 and familiarize yourself with the UI
2. **Make a Test Transaction**: Try depositing tokens from L1 to L2
3. **Monitor Gas Savings**: Check the analytics dashboard for real-time gas comparisons
4. **Review the Code**: Explore the smart contracts, backend services, and frontend components
5. **Customize**: Modify the project to add your own features

## 🎓 Learning Resources

- [Project README](README.md) - Comprehensive project documentation
- [Hardhat Documentation](https://hardhat.org/)
- [Web3j Documentation](https://docs.web3j.io/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Next.js Documentation](https://nextjs.org/docs)
- [Optimism Developer Docs](https://docs.optimism.io/)

## 🤝 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review the [README.md](README.md)
3. Check existing GitHub issues
4. Create a new issue with:
   - Your environment details (OS, Node version, Java version)
   - Steps to reproduce the problem
   - Error messages and logs
   - What you've already tried

## ✅ Success Checklist

Before considering your setup complete, verify:

- [ ] Smart contracts compile without errors
- [ ] All tests pass (contracts and backend)
- [ ] Contracts deployed to both L1 and L2 testnets
- [ ] Database is running and migrations applied
- [ ] Backend API responds to health check
- [ ] Frontend loads without errors
- [ ] Can connect wallet to frontend
- [ ] Can view gas comparison data
- [ ] Can see transaction history
- [ ] Successfully completed a test deposit

Congratulations! 🎉 You're now ready to explore the L2 Scaling Solution!

---

**Need More Help?** Join our [Discord](https://discord.gg/your-server) or check the [FAQ](FAQ.md).
