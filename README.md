# TaaS - CryptoRent Platform

A comprehensive blockchain-powered rental agreement platform that revolutionizes the traditional rental process with cryptocurrency payments, secure escrow services, and automated yield generation.

## 🏠 Platform Overview

The CryptoRent platform enables landlords and tenants to create, sign, and manage rental agreements using cryptocurrency while providing additional benefits:

- **For Landlords**: Earn yield on security deposits through DeFi integration
- **For Tenants**: Receive rewards for timely rent payments and secure deposit protection
- **For Both**: Transparent, automated, and secure rental process powered by smart contracts

## 🚀 Key Features

### 💰 Multi-Currency Support
- **PYUSD on Ethereum Sepolia**: PayPal's stablecoin for familiar crypto experience
- **USDF on Flow EVM**: Fast and developer-friendly blockchain integration

### 🔒 Secure Escrow System
- Smart contract-based escrow for security deposits
- Multi-signature agreement validation
- Automated fund release based on contract terms

### 📈 Yield Generation & Rewards
- Landlords earn 4.5% APY on deposited security funds
- Tenants receive 1% rewards for on-time rent payments
- Transparent yield calculation and distribution

### 📱 User-Friendly Interface
- Modern React-based web application
- MetaMask and Web3 wallet integration
- Real-time transaction and agreement status updates

## 🏗️ Project Structure

```
taas/
├── landlord-tenant-platform/    # Frontend React application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/              # Main application pages
│   │   ├── contexts/           # React context providers
│   │   ├── hooks/              # Custom React hooks
│   │   └── utils/              # Utility functions
│   ├── contracts/              # Smart contracts
│   │   ├── RentalEscrow.sol    # Main escrow contract
│   │   └── scripts/            # Deployment scripts
│   └── public/                 # Static assets
└── README.md                   # This file
```

## 🛠️ Technology Stack

### Frontend
- **React 18** with Vite for fast development
- **Tailwind CSS** for modern, responsive design
- **Ethers.js** for blockchain interactions
- **React Router** for navigation
- **Lucide React** for icons

### Blockchain
- **Solidity 0.8.19** for smart contracts
- **Hardhat** for development and deployment
- **OpenZeppelin** for security standards
- **Ethereum Sepolia** and **Flow EVM** testnets

### Web3 Integration
- MetaMask wallet connection
- Multi-network support
- ERC-20 token interactions
- Digital signature verification

## 🌐 Supported Networks

| Network | Chain ID | Currency | Contract Address |
|---------|----------|----------|------------------|
| Ethereum Sepolia | 11155111 | PYUSD | `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9` |
| Flow EVM Testnet | 545 | USDF | TBA (Placeholder) |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MetaMask or compatible Web3 wallet
- Test tokens on supported networks

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd taas/landlord-tenant-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open application**
   Navigate to `http://localhost:5173`

### Smart Contract Deployment

1. **Navigate to contracts directory**
   ```bash
   cd contracts
   npm install
   ```

2. **Configure environment**
   ```bash
   # Create .env file with:
   # PRIVATE_KEY=your_private_key
   # ETHERSCAN_API_KEY=your_etherscan_api_key
   # ETH_SEPOLIA_RPC_URL=your_infura_url
   ```

3. **Deploy to testnet**
   ```bash
   # Deploy to Ethereum Sepolia
   npm run deploy:sepolia
   
   # Deploy to Flow EVM
   npm run deploy:flow
   ```

## 📋 How It Works

### 1. Agreement Creation
- Landlord creates rental agreement with property details
- Specifies rent amount, security deposit, and lease terms
- Agreement hash is generated and signed by landlord

### 2. Tenant Signature & Deposit
- Tenant reviews agreement terms
- Signs agreement with their wallet
- Deposits security amount in PYUSD or USDF
- Funds are locked in escrow smart contract

### 3. Agreement Activation
- Landlord confirms tenant signature and deposit
- Agreement becomes active and yield generation begins
- Security deposit starts earning 4.5% APY for landlord

### 4. Monthly Operations
- Tenant pays rent in cryptocurrency
- On-time payments earn 1% rewards for tenant
- Yield automatically distributed to landlord
- All transactions recorded on blockchain

### 5. Agreement Completion
- At lease end, security deposit returned to tenant
- Any deductions processed transparently
- Final yield distributions completed

## 🔐 Security Features

### Smart Contract Security
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency stop functionality
- **Ownable**: Admin access controls
- **Multi-signature**: Both parties must sign agreements

### Financial Security
- **Escrow Protection**: Funds held in audited smart contracts
- **Transparent Terms**: All conditions coded and immutable
- **Automated Execution**: Reduces human error and disputes
- **Yield Verification**: On-chain calculation and distribution

## 🎯 Use Cases

### For Landlords
- **Yield Generation**: Earn passive income on security deposits
- **Reduced Risk**: Automated payment processing and tenant screening
- **Global Reach**: Accept tenants from anywhere with crypto
- **Transparency**: All transactions visible on blockchain

### For Tenants
- **Deposit Protection**: Funds secured in smart contracts
- **Payment Rewards**: Earn crypto for timely rent payments
- **Portability**: Digital agreements work across borders
- **Dispute Resolution**: Transparent, automated processes

### For Property Managers
- **Scalability**: Manage multiple properties efficiently
- **Automation**: Reduced manual processing and paperwork
- **Analytics**: Real-time insights into portfolio performance
- **Compliance**: Built-in regulatory compliance features

## 🛣️ Roadmap

### Phase 1: Foundation (Current)
- ✅ Frontend application development
- ✅ Smart contract implementation
- ✅ Basic escrow functionality
- ✅ Multi-network support

### Phase 2: Enhanced Features
- [ ] Advanced dispute resolution
- [ ] Property verification system
- [ ] KYC/AML integration
- [ ] Mobile application

### Phase 3: DeFi Integration
- [ ] Multiple yield strategies
- [ ] Lending pool integration
- [ ] Cross-chain functionality
- [ ] Insurance coverage

### Phase 4: Ecosystem Expansion
- [ ] Property management tools
- [ ] Marketplace for rental listings
- [ ] Third-party integrations
- [ ] Governance token launch

## 🤝 Contributing

We welcome contributions from developers, designers, and blockchain enthusiasts!

### Development Guidelines
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Areas for Contribution
- Smart contract optimization
- Frontend UI/UX improvements
- Additional blockchain network support
- Security audits and testing
- Documentation and tutorials

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Demo**: [Live Demo URL]
- **Documentation**: [Docs URL]
- **Discord**: [Community Discord]
- **Twitter**: [Twitter Handle]

## 📞 Support

For technical support, business inquiries, or partnership opportunities:

- **Email**: support@cryptorent.com
- **Discord**: Join our community
- **Issues**: GitHub Issues for bug reports

---

Built with ❤️ for the future of rental agreements