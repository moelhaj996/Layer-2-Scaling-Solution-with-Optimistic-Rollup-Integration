# Layer 2 Scaling Solution with Optimistic Rollup Integration

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue.svg)](https://soliditylang.org/)
[![Java](https://img.shields.io/badge/Java-17-red.svg)](https://openjdk.java.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-green.svg)](https://spring.io/projects/spring-boot)
[![Web3j](https://img.shields.io/badge/Web3j-4.10-orange.svg)](https://www.web3j.io/)

A comprehensive portfolio project demonstrating Layer 2 scaling solutions with cross-chain communication between Ethereum L1 and Optimistic Rollup L2 networks.

## 🎯 Project Overview

This project showcases advanced blockchain development skills including:

- **Smart Contract Development**: Secure bridge contracts on both L1 and L2
- **Cross-Chain Communication**: Event-driven architecture for L1 ↔ L2 messaging
- **Java + Web3j Integration**: Multi-chain monitoring and analytics service
- **Gas Optimization**: Real-time comparison of L1 vs L2 transaction costs
- **Modern Full-Stack**: React/Next.js dashboard with real-time WebSocket updates
- **Production-Ready**: Docker containerization, comprehensive testing, and CI/CD

## 📁 Project Structure

```
l2-scaling-solution/
├── contracts/               # Solidity smart contracts (Hardhat)
│   ├── contracts/
│   │   ├── L1Bridge.sol    # L1 deposit/withdrawal manager
│   │   ├── L2Bridge.sol    # L2 deposit finalization & withdrawal initiation
│   │   ├── TestToken.sol   # ERC20 token for L1
│   │   └── L2Token.sol     # Mintable/burnable token for L2
│   ├── test/               # Comprehensive Hardhat tests
│   └── scripts/            # Deployment scripts
│
├── backend/                # Java Spring Boot monitoring service
│   └── src/main/java/com/l2scaling/monitor/
│       ├── config/         # Web3j & WebSocket configuration
│       ├── model/          # JPA entities
│       ├── repository/     # Spring Data repositories
│       ├── service/        # Business logic (L1/L2 monitors, gas analytics)
│       ├── controller/     # REST API endpoints
│       └── dto/            # Data Transfer Objects
│
├── frontend/               # React/Next.js dashboard
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions & Wagmi config
│
├── docker-compose.yml     # Local development environment
└── k8s/                   # Kubernetes deployment configs (optional)
```

## 🚀 Features

### Smart Contracts

- **L1Bridge.sol**:
  - Deposit tokens from L1 to L2
  - Finalize withdrawals from L2 with Merkle proof verification (simplified)
  - Emergency pause/unpause functionality
  - Reentrancy protection

- **L2Bridge.sol**:
  - Finalize deposits from L1 (relayer-triggered)
  - Initiate withdrawals to L1
  - Track withdrawal data for proof generation

- **Security Features**:
  - OpenZeppelin's ReentrancyGuard, Pausable, Ownable
  - Input validation on all functions
  - Replay attack prevention
  - 80%+ test coverage

### Java Backend (Spring Boot + Web3j)

- **Dual-Chain Monitoring**:
  - Real-time event listening on both L1 and L2
  - Automatic transaction persistence to PostgreSQL
  - WebSocket push notifications to frontend

- **Gas Analytics**:
  - Live gas price fetching from both networks
  - Cost comparison for identical operations
  - Historical trend tracking
  - Savings percentage calculation

- **REST API**:
  - `/api/transactions/l1` - Get L1 transactions
  - `/api/transactions/l2` - Get L2 transactions
  - `/api/analytics/gas-comparison` - Latest gas cost comparison
  - `/api/analytics/trends?hours=24` - Historical gas trends
  - `/api/health` - Service health check

- **Optional Relayer**:
  - Automatic deposit finalization from L1 to L2
  - Nonce management and transaction signing

### Frontend (React/Next.js)

- **Wallet Integration**: RainbowKit for multi-wallet support
- **Bridge Interface**: User-friendly deposit/withdraw UI
- **Gas Comparison Chart**: Real-time visualization with Recharts
- **Transaction History**: Paginated list with status indicators
- **Network Status**: Live health indicators for L1 and L2
- **Real-time Updates**: WebSocket integration for instant transaction notifications

## 🛠️ Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Smart Contracts | Solidity | 0.8.20+ |
| Contract Framework | Hardhat | Latest |
| Testing Framework | Hardhat, Mocha, Chai | Latest |
| Backend Language | Java | 17+ |
| Backend Framework | Spring Boot | 3.2.0+ |
| Blockchain Library | Web3j | 4.10+ |
| Database | PostgreSQL | 15+ |
| Database Migrations | Flyway | Latest |
| Frontend Framework | Next.js + TypeScript | 14+ |
| Wallet Integration | Wagmi + RainbowKit | Latest |
| Charting | Recharts | Latest |
| Containerization | Docker + Docker Compose | Latest |
| Orchestration (Optional) | Kubernetes | 1.28+ |

## 📋 Prerequisites

- **Node.js** 18+ (for contracts and frontend)
- **Java** 17+ (for backend)
- **Maven** 3.8+ (for backend builds)
- **Docker** & **Docker Compose** (for local deployment)
- **PostgreSQL** 15+ (or use Docker)
- **Ethereum Wallet** with Sepolia testnet ETH

## 🎬 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/moelhaj996/Layer-2-Scaling-Solution-with-Optimistic-Rollup-Integration.git
cd l2-scaling-solution
```

### 2. Set Up Environment Variables

Create `.env` file in the root directory:

```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/l2scaling
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password

# RPC URLs
L1_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
L2_RPC_URL=https://sepolia.optimism.io

# Contract Addresses (fill after deployment)
L1_BRIDGE_ADDRESS=0x...
L2_BRIDGE_ADDRESS=0x...
L1_TOKEN_ADDRESS=0x...
L2_TOKEN_ADDRESS=0x...

# Private Key (for relayer - NEVER commit real keys)
PRIVATE_KEY=0x...

# WalletConnect Project ID
WALLET_CONNECT_PROJECT_ID=your_project_id
```

### 3. Deploy Smart Contracts

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia (L1)
npx hardhat run scripts/deploy-l1.js --network sepolia

# Deploy to Optimism Sepolia (L2)
npx hardhat run scripts/deploy-l2.js --network optimismSepolia

# Update .env with deployed contract addresses
```

### 4. Start Backend Service

```bash
cd ../backend

# Build with Maven
mvn clean install

# Run Spring Boot application
mvn spring-boot:run

# Or run with Docker
docker build -t l2-backend .
docker run -p 8080:8080 --env-file ../.env l2-backend
```

### 5. Start Frontend Dashboard

```bash
cd ../frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### 6. Start with Docker Compose (Easiest)

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 📊 Gas Cost Comparison Results

Based on test network data:

| Operation | L1 Cost (ETH) | L2 Cost (ETH) | Savings |
|-----------|---------------|---------------|---------|
| ERC20 Transfer | 0.0021 | 0.00021 | **90%** |
| Bridge Deposit | 0.0045 | N/A | N/A |
| Bridge Withdrawal | N/A | 0.00035 | **92%** |

*Note: Actual savings vary based on network congestion and gas prices*

## 🧪 Testing

### Smart Contract Tests

```bash
cd contracts

# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run coverage
npx hardhat coverage
```

### Backend Tests

```bash
cd backend

# Run unit tests
mvn test

# Run integration tests
mvn verify
```

## 🏗️ Architecture Diagrams

### High-Level Architecture

```
┌────────────────────────────────────────────────────┐
│            USER (React Dashboard)                   │
└───────────────────┬────────────────────────────────┘
                    │
                    │ WebSocket + REST API
                    ▼
┌────────────────────────────────────────────────────┐
│      Java Monitoring Service (Spring Boot)         │
│  - Event Listeners                                 │
│  - Gas Analytics                                   │
│  - PostgreSQL Persistence                          │
└──────────┬─────────────────────────┬───────────────┘
           │                         │
           │ Web3j                   │ Web3j
           ▼                         ▼
    ┌──────────────┐         ┌──────────────┐
    │ Ethereum L1  │◄───────►│ Optimism L2  │
    │  (Sepolia)   │  Bridge │ (OP Sepolia) │
    └──────────────┘         └──────────────┘
```

### Bridge Flow

```
1. DEPOSIT (L1 → L2):
   User → L1Bridge.depositToL2()
   → DepositInitiated event
   → Java service detects event
   → Relayer calls L2Bridge.finalizeDeposit()
   → L2 tokens minted

2. WITHDRAWAL (L2 → L1):
   User → L2Bridge.initiateWithdrawal()
   → L2 tokens burned
   → WithdrawalInitiated event
   → Wait for challenge period
   → Call L1Bridge.finalizeWithdrawal()
   → L1 tokens released
```

## 🚢 Deployment

### Production Checklist

- [ ] Remove test token mint functions
- [ ] Implement full Merkle proof verification
- [ ] Enable all security features (pause, rate limiting)
- [ ] Set up monitoring and alerting
- [ ] Configure proper gas estimation
- [ ] Implement challenge period for withdrawals
- [ ] Set up multi-sig wallet for admin functions
- [ ] Enable SSL/TLS for all endpoints
- [ ] Configure firewall rules
- [ ] Set up backup and disaster recovery

### Kubernetes Deployment (Optional)

```bash
cd k8s

# Create namespace
kubectl apply -f namespace.yaml

# Deploy database
kubectl apply -f postgres/

# Deploy backend
kubectl apply -f backend/

# Deploy frontend
kubectl apply -f frontend/

# Configure ingress
kubectl apply -f ingress.yaml
```

## 📚 API Documentation

### REST Endpoints

#### Health Check
```
GET /api/health
Response: {
  "status": "UP",
  "l1Connected": true,
  "l2Connected": true
}
```

#### Gas Comparison
```
GET /api/analytics/gas-comparison?operationType=ERC20_TRANSFER
Response: {
  "operationType": "ERC20_TRANSFER",
  "l1GasCost": 0.0021,
  "l2GasCost": 0.00021,
  "savingsPercentage": 90.0,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### Transaction History
```
GET /api/transactions/l1?page=0&size=20
Response: {
  "content": [...],
  "totalElements": 150,
  "totalPages": 8
}
```

### WebSocket Topics

- `/topic/l1-transactions` - L1 transaction updates
- `/topic/l2-transactions` - L2 transaction updates
- `/topic/gas-analytics` - Gas cost updates

## 🤝 Contributing

This is a portfolio project, but suggestions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎓 Learning Resources

- [Ethereum L2 Scaling Solutions](https://ethereum.org/en/developers/docs/scaling/)
- [Optimistic Rollups Explained](https://ethereum.org/en/developers/docs/scaling/optimistic-rollups/)
- [Web3j Documentation](https://docs.web3j.io/)
- [Hardhat Documentation](https://hardhat.org/getting-started/)
- [Spring Boot Reference](https://spring.io/projects/spring-boot)

## 👨‍💻 Author

GitHub: https://github.com/moelhaj996


## 🙏 Acknowledgments

- OpenZeppelin for secure contract libraries
- Optimism team for L2 infrastructure
- Web3j team for Java-Ethereum integration
- Spring Boot community

---

**⚠️ DISCLAIMER**: This is a portfolio/educational project designed for testnet use only. Do not use in production without thorough security audits and proper testing.
