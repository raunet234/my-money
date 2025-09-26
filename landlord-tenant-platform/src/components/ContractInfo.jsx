import React from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { Copy, ExternalLink } from 'lucide-react';
import { toast } from 'react-toastify';

const ContractInfo = () => {
  const { chainId, contractAddress, tokenAddresses } = useWeb3();

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const getExplorerUrl = (address) => {
    if (chainId === 11155111) {
      return `https://sepolia.etherscan.io/address/${address}`;
    } else if (chainId === 545) {
      return `https://evm-testnet.flowscan.org/address/${address}`;
    }
    return '#';
  };

  const getNetworkName = () => {
    if (chainId === 11155111) return 'Ethereum Sepolia';
    if (chainId === 545) return 'Flow EVM Testnet';
    return 'Unknown Network';
  };

  if (!chainId || !contractAddress) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-gray-600">Please connect your wallet to view contract information.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-black mb-4">Contract Information</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm font-medium text-black">Network</p>
            <p className="text-gray-600">{getNetworkName()}</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-black">RentalEscrow Contract</p>
            <p className="text-gray-600 font-mono text-sm truncate">{contractAddress}</p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => copyToClipboard(contractAddress, 'Contract address')}
              className="p-2 text-gray-500 hover:text-black transition-colors"
              title="Copy address"
            >
              <Copy className="w-4 h-4" />
            </button>
            <a
              href={getExplorerUrl(contractAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-black transition-colors"
              title="View on explorer"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {tokenAddresses && Object.entries(tokenAddresses).map(([symbol, address]) => (
          <div key={symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black">{symbol} Token</p>
              <p className="text-gray-600 font-mono text-sm truncate">{address}</p>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => copyToClipboard(address, `${symbol} address`)}
                className="p-2 text-gray-500 hover:text-black transition-colors"
                title="Copy address"
              >
                <Copy className="w-4 h-4" />
              </button>
              <a
                href={getExplorerUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-black transition-colors"
                title="View on explorer"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Deployed Contracts:</strong>
        </p>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          <li>• Ethereum Sepolia: 0x283B98E2eEeFB32308674D932dBDF27a041f0DDa</li>
          <li>• Flow EVM Testnet: 0x727A2162c03F4D87165E1694A7Eb5A3fd6E21dd5</li>
        </ul>
      </div>
    </div>
  );
};

export default ContractInfo;