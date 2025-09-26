import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';

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
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setUserRole(null);
    setIsRoleSelected(false);
    toast.info('Wallet disconnected');
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
        const networkConfigs = {
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

        const networkConfig = networkConfigs[targetChainId];
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

      window.ethereum.on('chainChanged', (chainId) => {
        setChainId(parseInt(chainId, 16));
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const web3Value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
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