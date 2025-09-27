import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { 
  CONTRACT_ADDRESSES, 
  TOKEN_ADDRESSES, 
  NETWORK_CONFIGS,
  RENTAL_ESCROW_ABI, 
  ERC20_ABI 
} from '../utils/constants';

const Web3Context = createContext();
const RoleContext = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a Web3Provider');
  }
  return context;
};

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Role management
  const [userRole, setUserRole] = useState(null); // 'landlord' | 'tenant' | null
  const [isRoleSelected, setIsRoleSelected] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask!');
      return;
    }

    setIsConnecting(true);
    try {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await web3Provider.send('eth_requestAccounts', []);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      
      // Check if user has a saved role for this address
      const savedRole = localStorage.getItem(`userRole_${accounts[0]}`);
      if (savedRole) {
        setUserRole(savedRole);
        setIsRoleSelected(true);
      }
      
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

    const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setAccount(null);
    setChainId(null);
    setUserRole(null);
    setIsRoleSelected(false);
    toast.success('Wallet disconnected');
  };

  const selectRole = (role) => {
    if (account) {
      setUserRole(role);
      setIsRoleSelected(true);
      localStorage.setItem(`userRole_${account}`, role);
      toast.success(`Switched to ${role} mode`);
    }
  };

  const switchRole = () => {
    if (account) {
      localStorage.removeItem(`userRole_${account}`);
      setUserRole(null);
      setIsRoleSelected(false);
    }
  };

  const getNetworkNameById = (chainId) => {
    switch (chainId) {
      case 11155111:
        return 'Ethereum Sepolia';
      case 545:
        return 'Flow EVM Testnet';
      case 1:
        return 'Ethereum Mainnet';
      case 1001:
        return 'Klaytn Baobab';
      default:
        return `Network ${chainId}`;
    }
  };

  // Contract interaction functions
  const getContract = () => {
    if (!signer || !chainId) return null;
    const contractAddress = CONTRACT_ADDRESSES[chainId];
    if (!contractAddress) return null;
    return new ethers.Contract(contractAddress, RENTAL_ESCROW_ABI, signer);
  };

  const getTokenContract = (tokenAddress) => {
    if (!signer) return null;
    return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  };

  const createAgreement = async (tenantAddress, rentAmount, securityDeposit, leaseTerm) => {
    try {
      console.log('createAgreement called with:', { tenantAddress, rentAmount, securityDeposit, leaseTerm });
      console.log('Current state - account:', account, 'chainId:', chainId, 'signer:', !!signer);
      
      // Check if we're on a supported network
      if (chainId !== 11155111 && chainId !== 545) {
        throw new Error(`Unsupported network. Please switch to Ethereum Sepolia (chainId: 11155111) or Flow EVM Testnet (chainId: 545). Current chainId: ${chainId}`);
      }
      
      // Refresh provider/signer to ensure they're up to date
      const currentNetwork = await provider.getNetwork();
      if (Number(currentNetwork.chainId) !== chainId) {
        console.log('Network mismatch detected, refreshing connection...');
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner();
        setProvider(web3Provider);
        setSigner(web3Signer);
        
        // Use the fresh provider/signer
        const freshContract = new ethers.Contract(
          CONTRACT_ADDRESSES[chainId], 
          RENTAL_ESCROW_ABI, 
          web3Signer
        );
        
        return await createAgreementWithContract(freshContract, tenantAddress, rentAmount, securityDeposit, leaseTerm);
      }
      
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');
      
      return await createAgreementWithContract(contract, tenantAddress, rentAmount, securityDeposit, leaseTerm);
    } catch (error) {
      console.error('Error creating agreement:', error);
      
      if (error.code === 'NETWORK_ERROR' && error.message.includes('network changed')) {
        toast.error('Network changed during transaction. Please try again.');
      } else if (error.message.includes('user rejected')) {
        toast.error('Transaction rejected by user');
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds for transaction');
      } else {
        toast.error('Failed to create agreement. Please try again.');
      }
      
      throw error;
    }
  };

  const createAgreementWithContract = async (contract, tenantAddress, rentAmount, securityDeposit, leaseTerm) => {
    // Get token address based on current chain
    const tokenAddresses = TOKEN_ADDRESSES[chainId];
    if (!tokenAddresses) throw new Error('Tokens not supported on this network');
    
    const tokenAddress = chainId === 11155111 ? tokenAddresses.PYUSD : tokenAddresses.USDF;
    
    // Convert amounts to wei (assuming 18 decimals)
    const rentAmountWei = ethers.parseUnits(rentAmount.toString(), 18);
    const securityDepositWei = ethers.parseUnits(securityDeposit.toString(), 18);
    
    // Calculate dates
    const startDate = Math.floor(Date.now() / 1000); // Current timestamp
    const endDate = startDate + (leaseTerm * 30 * 24 * 60 * 60); // Lease term in months
    const paymentDay = 1; // Default to 1st of month

    const tx = await contract.createAgreement(
      tenantAddress,
      tokenAddress,
      rentAmountWei,
      securityDepositWei,
      startDate,
      endDate,
      paymentDay
    );

    await tx.wait();
    toast.success('Agreement created successfully!');
    return tx;
  };

  const signAgreementAndDeposit = async (agreementId, securityDeposit, tokenAddress) => {
    try {
      const contract = getContract();
      const tokenContract = getTokenContract(tokenAddress);
      if (!contract || !tokenContract) throw new Error('Contracts not available');

      const securityDepositWei = ethers.parseUnits(securityDeposit.toString(), 18);

      // First approve the contract to spend tokens
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES[chainId], securityDepositWei);
      await approveTx.wait();

      // Then sign and deposit
      const tx = await contract.signAgreementAndDeposit(agreementId);
      await tx.wait();
      
      toast.success('Agreement signed and deposit made!');
      return tx;
    } catch (error) {
      console.error('Error signing agreement:', error);
      toast.error('Failed to sign agreement');
      throw error;
    }
  };

  const confirmAgreement = async (agreementId) => {
    try {
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const tx = await contract.landlordConfirm(agreementId);
      await tx.wait();
      
      toast.success('Agreement confirmed!');
      return tx;
    } catch (error) {
      console.error('Error confirming agreement:', error);
      toast.error('Failed to confirm agreement');
      throw error;
    }
  };

  const payRent = async (agreementId, rentAmount, tokenAddress) => {
    try {
      const contract = getContract();
      const tokenContract = getTokenContract(tokenAddress);
      if (!contract || !tokenContract) throw new Error('Contracts not available');

      const rentAmountWei = ethers.parseUnits(rentAmount.toString(), 18);

      // First approve the contract to spend tokens
      const approveTx = await tokenContract.approve(CONTRACT_ADDRESSES[chainId], rentAmountWei);
      await approveTx.wait();

      // Then pay rent
      const tx = await contract.payRent(agreementId);
      await tx.wait();
      
      toast.success('Rent paid successfully!');
      return tx;
    } catch (error) {
      console.error('Error paying rent:', error);
      toast.error('Failed to pay rent');
      throw error;
    }
  };

  const getAgreement = async (agreementId) => {
    try {
      const contract = getContract();
      if (!contract) throw new Error('Contract not available');

      const agreement = await contract.agreements(agreementId);
      return {
        id: agreement.id,
        landlord: agreement.landlord,
        tenant: agreement.tenant,
        token: agreement.token,
        rentAmount: ethers.formatUnits(agreement.rentAmount, 18),
        securityDeposit: ethers.formatUnits(agreement.securityDeposit, 18),
        startDate: new Date(Number(agreement.startDate) * 1000),
        endDate: new Date(Number(agreement.endDate) * 1000),
        paymentDay: Number(agreement.paymentDay),
        status: Number(agreement.status),
        lastRentPayment: Number(agreement.lastRentPayment),
        totalYieldEarned: ethers.formatUnits(agreement.totalYieldEarned, 18)
      };
    } catch (error) {
      console.error('Error getting agreement:', error);
      throw error;
    }
  };

  const getTokenBalance = async (tokenAddress, userAddress = account) => {
    try {
      if (!userAddress) return '0';
      const tokenContract = getTokenContract(tokenAddress);
      if (!tokenContract) return '0';

      const balance = await tokenContract.balanceOf(userAddress);
      return ethers.formatUnits(balance, 18);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  };

  const switchNetwork = async (targetChainId) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error) {
      if (error.code === 4902) {
        // Network not added to wallet
        const networkConfig = NETWORK_CONFIGS[targetChainId];
        if (networkConfig) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkConfig],
          });
        }
      }
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          // Check role for new account
          const savedRole = localStorage.getItem(`userRole_${accounts[0]}`);
          if (savedRole) {
            setUserRole(savedRole);
            setIsRoleSelected(true);
          } else {
            setUserRole(null);
            setIsRoleSelected(false);
          }
        }
      });

      window.ethereum.on('chainChanged', async (chainId) => {
        const newChainId = parseInt(chainId, 16);
        setChainId(newChainId);
        
        // Refresh provider and signer when network changes
        try {
          if (account) {
            const web3Provider = new ethers.BrowserProvider(window.ethereum);
            const web3Signer = await web3Provider.getSigner();
            setProvider(web3Provider);
            setSigner(web3Signer);
            
            toast.info(`Switched to network: ${getNetworkNameById(newChainId)}`);
          }
        } catch (error) {
          console.error('Error refreshing provider after network change:', error);
          toast.error('Network changed. Please reconnect your wallet.');
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, [account]);

  const web3Value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    // Contract interactions
    createAgreement,
    signAgreementAndDeposit,
    confirmAgreement,
    payRent,
    getAgreement,
    getTokenBalance,
    // Contract addresses
    contractAddress: CONTRACT_ADDRESSES[chainId],
    tokenAddresses: TOKEN_ADDRESSES[chainId]
  };

  const roleValue = {
    userRole,
    isRoleSelected,
    selectRole,
    switchRole,
  };

  return (
    <Web3Context.Provider value={web3Value}>
      <RoleContext.Provider value={roleValue}>
        {children}
      </RoleContext.Provider>
    </Web3Context.Provider>
  );
};