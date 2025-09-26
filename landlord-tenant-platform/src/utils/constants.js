// Contract addresses for deployed RentalEscrow contracts
export const CONTRACT_ADDRESSES = {
  11155111: '0x283B98E2eEeFB32308674D932dBDF27a041f0DDa', // Ethereum Sepolia
  545: '0x727A2162c03F4D87165E1694A7Eb5A3fd6E21dd5'      // Flow EVM Testnet
};

// Token addresses for supported stablecoins
export const TOKEN_ADDRESSES = {
  11155111: {
    PYUSD: '0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9'
  },
  545: {
    USDF: '0x221' // Flow EVM testnet USDF address (placeholder)
  }
};

// Network configurations
export const NETWORK_CONFIGS = {
  11155111: {
    chainId: '0xaa36a7',
    chainName: 'Ethereum Sepolia',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
  },
  545: {
    chainId: '0x221',
    chainName: 'Flow EVM Testnet',
    nativeCurrency: { name: 'FLOW', symbol: 'FLOW', decimals: 18 },
    rpcUrls: ['https://testnet.evm.nodes.onflow.org'],
    blockExplorerUrls: ['https://evm-testnet.flowscan.org/'],
  },
};

// Contract ABIs
export const RENTAL_ESCROW_ABI = [
  "function createAgreement(address _tenant, address _token, uint256 _rentAmount, uint256 _securityDeposit, uint256 _startDate, uint256 _endDate, uint256 _paymentDay) external returns (uint256)",
  "function signAgreementAndDeposit(uint256 _id) external",
  "function landlordConfirm(uint256 _id) external",
  "function payRent(uint256 _id) external",
  "function releaseSecurity(uint256 _id) external",
  "function agreements(uint256) external view returns (uint256 id, address landlord, address tenant, address token, uint256 rentAmount, uint256 securityDeposit, uint256 startDate, uint256 endDate, uint256 paymentDay, uint8 status, uint256 lastRentPayment, uint256 totalYieldEarned)",
  "function nextAgreementId() external view returns (uint256)",
  "event AgreementCreated(uint256 indexed id, address landlord, address tenant, uint256 rent, uint256 deposit)",
  "event AgreementSigned(uint256 indexed id, address signer, uint8 status)",
  "event RentPaid(uint256 indexed id, uint256 amount, uint256 reward, uint256 fee)"
];

export const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)"
];

// Agreement status enum
export const AGREEMENT_STATUS = {
  0: 'PendingTenant',
  1: 'PendingLandlord', 
  2: 'Active',
  3: 'Completed',
  4: 'Cancelled'
};