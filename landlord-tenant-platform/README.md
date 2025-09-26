# CryptoRent Platform

A blockchain-powered rental agreement platform that enables secure cryptocurrency payments, escrow services, and yield generation for landlords and tenants.

## Features

- 🏠 **Digital Rental Agreements**: Create, sign, and manage rental agreements on the blockchain
- 💰 **Cryptocurrency Payments**: Support for PYUSD (Ethereum Sepolia) and USDF (Flow EVM)
- 🔒 **Secure Escrow**: Security deposits held in smart contract escrows
- 📈 **Yield Generation**: Landlords earn yield on deposited security funds through staking
- 🎁 **Tenant Rewards**: Tenants receive rewards for timely rent payments
- 🔐 **Wallet Integration**: MetaMask and other Web3 wallet support

## Supported Networks

### Ethereum Sepolia Testnet
- **Chain ID**: 11155111
- **Currency**: PYUSD (PayPal USD)
- **Contract**: `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9`

### Flow EVM Testnet
- **Chain ID**: 545 (0x221)
- **RPC URL**: `https://testnet.evm.nodes.onflow.org`
- **Currency**: USDF (USD Stablecoin)
- **Contract**: TBA (Placeholder in .env)

## How It Works

1. **Create Agreement**: Landlord creates a rental agreement with property details, rent amount, and security deposit requirements
2. **Tenant Signs & Deposits**: Tenant reviews, signs the agreement, and deposits security amount in cryptocurrency to escrow
3. **Agreement Activation**: Landlord confirms and activates the agreement
4. **Ongoing Benefits**: 
   - Landlord earns yield on deposited security funds
   - Tenant pays monthly rent and receives rewards
   - All transactions are transparent and secure

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Blockchain**: Ethereum (Sepolia) + Flow EVM
- **Web3**: Ethers.js + Web3React
- **UI Components**: Lucide React icons
- **Notifications**: React Toastify

## Getting Started

### Prerequisites

- Node.js 18+ 
- MetaMask or compatible Web3 wallet
- Test tokens on Ethereum Sepolia or Flow EVM testnet

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your configuration:
   ```
   # Ethereum Sepolia Network
   VITE_ETH_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   VITE_PYUSD_CONTRACT_ADDRESS=0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9
   VITE_ETH_SEPOLIA_CHAIN_ID=11155111

   # Flow EVM Network  
   VITE_FLOW_EVM_RPC_URL=https://testnet.evm.nodes.onflow.org
   VITE_USDF_CONTRACT_ADDRESS=PLACEHOLDER_USDF_CONTRACT_ADDRESS
   VITE_FLOW_EVM_CHAIN_ID=545
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

### Usage

1. **Connect Wallet**: Click "Connect Wallet" and select your preferred wallet
2. **Switch Network**: Ensure you're on Ethereum Sepolia or Flow EVM testnet
3. **Create Agreement**: Fill out the rental agreement form with property and financial details
4. **Send to Tenant**: Agreement is sent to tenant's wallet address for signature
5. **Sign & Deposit**: Tenant signs agreement and deposits security amount
6. **Activate**: Landlord confirms and activates the rental agreement
7. **Manage**: View dashboard for agreement status, yield earnings, and rent payments

## Smart Contract Architecture

### Escrow Contract Features
- Multi-signature agreement validation
- Automatic security deposit handling
- Yield generation through DeFi integration
- Rent payment processing with rewards
- Dispute resolution mechanisms

### Token Integration
- ERC-20 compatible stablecoin support
- Cross-chain payment capabilities
- Gas optimization for transactions
- Approval and allowance management

## Development

### Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Main application pages
├── contexts/      # React context providers
├── hooks/         # Custom React hooks
├── utils/         # Utility functions and Web3 helpers
└── assets/        # Static assets
```

### Key Components
- `Web3Context`: Manages wallet connection and blockchain interactions
- `useAgreements`: Hook for agreement management and blockchain operations
- `Navbar`: Navigation with wallet connection status
- `Dashboard`: Overview of user's agreements and earnings
- `CreateAgreement`: Form for creating new rental agreements
- `ViewAgreement`: Detailed agreement view with signing capabilities

## Security Features

- ✅ Smart contract escrow for security deposits
- ✅ Multi-signature agreement validation
- ✅ Blockchain-verified transactions
- ✅ Automated execution without intermediaries
- ✅ Transparent yield calculation and distribution

## Roadmap

- [ ] Smart contract deployment on testnets
- [ ] Integration with actual DeFi yield protocols
- [ ] Advanced dispute resolution system
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Integration with property management platforms

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@cryptorent.com or join our Discord community.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
