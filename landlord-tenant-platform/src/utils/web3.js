import { ethers } from 'ethers';

// Contract addresses from environment
export const CONTRACTS = {
  PYUSD_ADDRESS: import.meta.env.VITE_PYUSD_CONTRACT_ADDRESS,
  USDF_ADDRESS: import.meta.env.VITE_USDF_CONTRACT_ADDRESS,
};

// Network configurations
export const NETWORKS = {
  ETH_SEPOLIA: {
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    rpcUrl: import.meta.env.VITE_ETH_SEPOLIA_RPC_URL,
    currency: 'PYUSD',
    contractAddress: CONTRACTS.PYUSD_ADDRESS,
  },
  FLOW_EVM: {
    chainId: 545,
    name: 'Flow EVM Testnet',
    rpcUrl: import.meta.env.VITE_FLOW_EVM_RPC_URL,
    currency: 'USDF',
    contractAddress: CONTRACTS.USDF_ADDRESS,
  },
};

// ERC-20 Token ABI (minimal)
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
];

// Escrow Contract ABI (simplified - you would need to implement the actual contract)
export const ESCROW_ABI = [
  'function createAgreement(address tenant, uint256 rentAmount, uint256 securityDeposit, address tokenAddress, uint256 duration) returns (uint256)',
  'function signAgreement(uint256 agreementId) payable',
  'function confirmAgreement(uint256 agreementId)',
  'function payRent(uint256 agreementId, uint256 amount)',
  'function withdrawYield(uint256 agreementId)',
  'function getAgreement(uint256 agreementId) view returns (tuple)',
  'function getYieldEarned(uint256 agreementId) view returns (uint256)',
  'event AgreementCreated(uint256 indexed agreementId, address indexed landlord, address indexed tenant)',
  'event AgreementSigned(uint256 indexed agreementId, address indexed signer)',
  'event RentPaid(uint256 indexed agreementId, uint256 amount)',
  'event YieldWithdrawn(uint256 indexed agreementId, uint256 amount)',
];

/**
 * Get token contract instance
 */
export const getTokenContract = (tokenAddress, signerOrProvider) => {
  return new ethers.Contract(tokenAddress, ERC20_ABI, signerOrProvider);
};

/**
 * Get user's token balance
 */
export const getTokenBalance = async (tokenAddress, userAddress, provider) => {
  try {
    const tokenContract = getTokenContract(tokenAddress, provider);
    const balance = await tokenContract.balanceOf(userAddress);
    const decimals = await tokenContract.decimals();
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Error getting token balance:', error);
    return '0';
  }
};

/**
 * Approve token spending
 */
export const approveToken = async (tokenAddress, spenderAddress, amount, signer) => {
  try {
    const tokenContract = getTokenContract(tokenAddress, signer);
    const decimals = await tokenContract.decimals();
    const amountInWei = ethers.parseUnits(amount.toString(), decimals);
    
    const tx = await tokenContract.approve(spenderAddress, amountInWei);
    return await tx.wait();
  } catch (error) {
    console.error('Error approving token:', error);
    throw error;
  }
};

/**
 * Transfer tokens
 */
export const transferToken = async (tokenAddress, toAddress, amount, signer) => {
  try {
    const tokenContract = getTokenContract(tokenAddress, signer);
    const decimals = await tokenContract.decimals();
    const amountInWei = ethers.parseUnits(amount.toString(), decimals);
    
    const tx = await tokenContract.transfer(toAddress, amountInWei);
    return await tx.wait();
  } catch (error) {
    console.error('Error transferring token:', error);
    throw error;
  }
};

/**
 * Get current network info
 */
export const getCurrentNetwork = (chainId) => {
  return Object.values(NETWORKS).find(network => network.chainId === chainId);
};

/**
 * Format address for display
 */
export const formatAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return '';
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * Validate Ethereum address
 */
export const isValidAddress = (address) => {
  return ethers.isAddress(address);
};

/**
 * Generate agreement hash for signing
 */
export const generateAgreementHash = (agreementData) => {
  const message = ethers.solidityPackedKeccak256(
    ['string', 'address', 'address', 'uint256', 'uint256', 'uint256', 'uint256'],
    [
      agreementData.propertyAddress,
      agreementData.landlord,
      agreementData.tenant,
      ethers.parseEther(agreementData.rentAmount.toString()),
      ethers.parseEther(agreementData.securityDeposit.toString()),
      Math.floor(new Date(agreementData.startDate).getTime() / 1000),
      Math.floor(new Date(agreementData.endDate).getTime() / 1000),
    ]
  );
  return message;
};

/**
 * Sign message with wallet
 */
export const signMessage = async (message, signer) => {
  try {
    const signature = await signer.signMessage(ethers.getBytes(message));
    return signature;
  } catch (error) {
    console.error('Error signing message:', error);
    throw error;
  }
};

/**
 * Verify signature
 */
export const verifySignature = (message, signature, address) => {
  try {
    const recoveredAddress = ethers.verifyMessage(ethers.getBytes(message), signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
};

/**
 * Calculate yield (mock implementation)
 */
export const calculateYield = (principal, apy, days) => {
  const dailyRate = apy / 365 / 100;
  return principal * dailyRate * days;
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount, currency = 'USD', decimals = 2) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

/**
 * Get gas estimate for transaction
 */
export const estimateGas = async (contract, method, params = []) => {
  try {
    const gasEstimate = await contract[method].estimateGas(...params);
    return gasEstimate;
  } catch (error) {
    console.error('Error estimating gas:', error);
    return ethers.parseUnits('300000', 'wei'); // Default gas limit
  }
};