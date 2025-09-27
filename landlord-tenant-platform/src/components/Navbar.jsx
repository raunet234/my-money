import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Home, FileText, BarChart3, Users, RefreshCw } from 'lucide-react';
import { useWeb3, useRole } from '../contexts/Web3Context';

const Navbar = () => {
  const { account, connectWallet, disconnectWallet, chainId, isConnecting, switchNetwork } = useWeb3();
  const { userRole, switchRole } = useRole();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const getChainName = (chainId) => {
    const numericChainId = Number(chainId);
    
    switch (numericChainId) {
      case 11155111:
        return 'Ethereum Sepolia ✅';
      case 545:
        return 'Flow EVM Testnet ✅';   
      case 1:
        return 'Ethereum Mainnet';
      case 5:
        return 'Ethereum Goerli';
      case 137:
        return 'Polygon Mainnet';
      case 80001:
        return 'Polygon Mumbai';
      case 1001:
        return 'Klaytn Baobab ⚠️';
      default:
        return `Network ${chainId} ⚠️`;
    }
  };

  const isUnsupportedNetwork = () => {
    return chainId && chainId !== 11155111 && chainId !== 545;
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-black mr-6">CryptoRent</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-black bg-gray-100' 
                  : 'text-gray-700 hover:text-black hover:bg-gray-50'
              }`}
            >
              <Home className="w-4  h-4 text-black" />
              <span className='text-black'>Home</span>
            </Link>
            
            {account && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard') 
                      ? 'text-black bg-gray-100' 
                      : 'text-gray-700 hover:text-black hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-black" />
                  <span className='text-black'>Dashboard</span>
                </Link>
                
                {userRole === 'landlord' && (
                  <Link
                    to="/create-agreement"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/create-agreement') 
                        ? 'text-black bg-gray-100' 
                        : 'text-gray-700 hover:text-black hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-black" />
                    <span className='text-black'>Create Agreement</span>
                  </Link>
                )}

                {userRole === 'tenant' && (
                  <Link
                    to="/my-agreements"
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive('/my-agreements') 
                        ? 'text-black bg-gray-100' 
                        : 'text-gray-700 hover:text-black hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-black" />
                    <span className='text-black'>My Agreements</span>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {userRole && (
              <div className="hidden sm:flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg text-xs font-medium text-black">
                <Users className="w-3 h-3 mr-1 text-sm font-medium text-black" />
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </div>
            )}
            
            {chainId && (
              <div className="flex items-center space-x-2">
                <div className={`hidden sm:flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  isUnsupportedNetwork() 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {getChainName(chainId)}
                </div>
                
                {isUnsupportedNetwork() && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => switchNetwork(11155111)}
                      className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      title="Switch to Ethereum Sepolia"
                    >
                      Sepolia
                    </button>
                    <button
                      onClick={() => switchNetwork(545)}
                      className="px-2 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                      title="Switch to Flow EVM Testnet"
                    >
                      Flow
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {account ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                  <span className="text-sm font-medium text-black">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
                
                {userRole && (
                  <button
                    onClick={switchRole}
                    className="flex text-white items-center space-x-1 px-3 py-2 text-sm font-medium text-black bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    title="Switch Role"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden text-white sm:inline">Role</span>
                  </button>
                )}
                
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 text-white text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center space-x-2 px-4 py-2 bg-black hover:bg-gray-800 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;