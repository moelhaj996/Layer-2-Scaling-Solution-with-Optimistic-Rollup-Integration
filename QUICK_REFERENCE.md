# Quick Reference Guide

## 🚀 Quick Start Commands

### Using Docker (Recommended)
```bash
# Start everything
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Restart a service
docker-compose restart backend
```

### Manual Setup

#### Contracts
```bash
cd contracts
npm install
npm run compile
npm test
npm run deploy:l1  # Deploy to Sepolia
npm run deploy:l2  # Deploy to Optimism Sepolia
```

#### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

#### Database
```bash
# Using Docker
docker run --name l2-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=l2scaling \
  -p 5432:5432 -d postgres:15-alpine

# Connect
psql -h localhost -U postgres -d l2scaling
```

## 📂 Project Structure

```
l2-scaling-solution/
├── contracts/              # Smart contracts
│   ├── contracts/         # Solidity files
│   ├── test/             # Hardhat tests
│   └── scripts/          # Deployment scripts
├── backend/               # Java Spring Boot
│   └── src/main/
│       ├── java/         # Java source code
│       └── resources/    # Config & migrations
├── frontend/              # React/Next.js (to be added)
├── docker-compose.yml     # Docker setup
├── .env.example          # Environment template
├── README.md             # Main documentation
├── GETTING_STARTED.md    # Setup guide
└── PROJECT_SUMMARY.md    # Project overview
```

## 🔑 Environment Variables

Required in `.env`:
```bash
# RPC URLs
L1_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
L2_RPC_URL=https://sepolia.optimism.io

# Contract Addresses (after deployment)
L1_BRIDGE_ADDRESS=0x...
L2_BRIDGE_ADDRESS=0x...
L1_TOKEN_ADDRESS=0x...
L2_TOKEN_ADDRESS=0x...

# Relayer (for auto-finalization)
PRIVATE_KEY=0x...

# Database
DB_PASSWORD=secure_password

# WalletConnect (for frontend)
WALLET_CONNECT_PROJECT_ID=your_id
```

## 🌐 Endpoints

### Backend API
- Health: `http://localhost:8080/api/health`
- Gas Comparison: `http://localhost:8080/api/analytics/gas-comparison`
- L1 Transactions: `http://localhost:8080/api/transactions/l1`
- L2 Transactions: `http://localhost:8080/api/transactions/l2`
- Gas Trends: `http://localhost:8080/api/analytics/trends?hours=24`

### WebSocket
- Connect: `ws://localhost:8080/ws`
- Topics:
  - `/topic/l1-transactions`
  - `/topic/l2-transactions`
  - `/topic/gas-analytics`

### Frontend (when added)
- Dashboard: `http://localhost:3000`

## 🧪 Testing Commands

### Smart Contracts
```bash
cd contracts
npm test                    # Run all tests
npm run test:gas           # With gas reporting
npm run test:coverage      # Coverage report
```

### Backend
```bash
cd backend
mvn test                   # Unit tests
mvn verify                 # Integration tests
mvn jacoco:report         # Coverage report
```

## 🔍 Useful Queries

### Database
```sql
-- Check transaction counts
SELECT COUNT(*) FROM l1_transactions;
SELECT COUNT(*) FROM l2_transactions;

-- Recent gas analytics
SELECT * FROM gas_analytics
ORDER BY timestamp DESC
LIMIT 10;

-- Bridge health
SELECT * FROM bridge_health_status;

-- Calculate total savings
SELECT * FROM calculate_total_savings();
```

### Hardhat Console
```bash
cd contracts
npx hardhat console --network sepolia

# In console:
const L1Bridge = await ethers.getContractFactory("L1Bridge");
const bridge = L1Bridge.attach("YOUR_ADDRESS");
await bridge.depositCounter();
```

## 📊 Key Metrics to Monitor

- **L1 Gas Price**: Average ~20-100 Gwei
- **L2 Gas Price**: Average ~0.001 Gwei
- **Expected Savings**: 80-95%
- **Deposit Time**: L1 → L2 ~1-2 minutes
- **Withdrawal Time**: L2 → L1 ~7 days (with challenge period)

## 🐛 Common Issues & Quick Fixes

| Issue | Fix |
|-------|-----|
| "Insufficient funds" | Get Sepolia ETH from [faucet](https://sepoliafaucet.com/) |
| "Port 8080 in use" | `lsof -i :8080` then `kill -9 PID` |
| "DB connection failed" | Check PostgreSQL is running: `docker ps` |
| "RPC timeout" | Check Infura key in `.env` |
| "Tests fail" | Check Node.js version (need v18+) |

## 🔐 Security Checklist

- [ ] Never commit `.env` file
- [ ] Use dedicated test wallet (not main wallet)
- [ ] Keep private keys secure
- [ ] Use strong database passwords
- [ ] Enable 2FA on all accounts
- [ ] Review smart contracts before deploying
- [ ] Test on testnet first
- [ ] Monitor transactions for anomalies

## 📚 Important Files

| File | Purpose |
|------|---------|
| `README.md` | Comprehensive project docs |
| `GETTING_STARTED.md` | Setup instructions |
| `PROJECT_SUMMARY.md` | What's been built |
| `.env.example` | Environment template |
| `docker-compose.yml` | Container orchestration |
| `contracts/hardhat.config.js` | Hardhat configuration |
| `backend/pom.xml` | Maven dependencies |
| `backend/src/main/resources/application.yml` | Spring Boot config |

## 🎯 Next Steps After Setup

1. ✅ Verify all services are running
2. ✅ Deploy contracts to testnet
3. ✅ Update `.env` with contract addresses
4. ✅ Test a deposit transaction
5. ✅ Check gas analytics API
6. ✅ Monitor transaction events
7. ✅ Add frontend (optional)
8. ✅ Create demo video
9. ✅ Deploy to portfolio

## 🌟 Portfolio Tips

When presenting this project:
- **Demo the gas savings** (80-95% reduction)
- **Show real-time monitoring** (WebSocket updates)
- **Explain security features** (reentrancy guards, access control)
- **Walk through architecture** (event-driven, dual-chain)
- **Highlight testing** (80%+ coverage)
- **Discuss scalability** (Docker, horizontal scaling ready)

## 📞 Resources

- [Hardhat Docs](https://hardhat.org/)
- [Web3j Docs](https://docs.web3j.io/)
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Optimism Docs](https://docs.optimism.io/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura](https://infura.io/)
- [WalletConnect](https://cloud.walletconnect.com/)

## ⚡ Pro Tips

- **Save gas**: Batch transactions when possible
- **Monitor RPC**: Use Infura rate limits wisely
- **Test thoroughly**: Always test on testnet first
- **Document changes**: Keep deployment logs
- **Version control**: Tag releases (v1.0.0, etc.)
- **CI/CD**: Add GitHub Actions for automated testing

---

**Need help?** Check `GETTING_STARTED.md` for detailed setup instructions or `PROJECT_SUMMARY.md` for a complete overview.
