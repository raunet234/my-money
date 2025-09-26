import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, TrendingUp, Users, Lock, ArrowRight } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import ContractInfo from '../components/ContractInfo';

const Home = () => {
  const { account } = useWeb3();

  const features = [
    {
      icon: Shield,
      title: 'Secure Escrow',
      description: 'Security deposits are safely stored in smart contract escrows with transparent terms.',
    },
    {
      icon: TrendingUp,
      title: 'Yield Generation',
      description: 'Landlords earn yield on deposited funds through secure staking mechanisms.',
    },
    {
      icon: Users,
      title: 'Digital Agreements',
      description: 'Create, sign, and manage rental agreements digitally with blockchain verification.',
    },
    {
      icon: Lock,
      title: 'Multi-Currency Support',
      description: 'Support for PYUSD on Ethereum Sepolia and USDF on Flow EVM networks.',
    },
  ];

  return (
    <div className="max-w-screen mx-auto">
      {/* Hero Section */}
      <div className="text-center py-20">
        <h1 className="text-5xl font-bold text-black mb-6">
          The Future of Rental Agreements
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Secure, transparent, and profitable rental agreements powered by blockchain technology. 
          Protect deposits, earn yield, and streamline the rental process with cryptocurrency payments.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {account ? (
            <>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-8 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/create-agreement"
                className="inline-flex items-center px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
              >
                Create Agreement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Connect your wallet to get started</p>
              <div className="inline-flex items-center px-8 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed">
                Connect Wallet First
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white rounded-2xl shadow-sm">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-black mb-4">
            Why Choose CryptoRent?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform combines the security of blockchain with the practicality of traditional rental agreements.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 px-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow border border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
                <feature.icon className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple steps to secure your rental agreement with cryptocurrency
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-xl font-bold mb-6">
              1
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Create Agreement
            </h3>
            <p className="text-gray-600">
              Landlord creates a rental agreement with terms, rent amount, and security deposit requirements.
            </p>
          </div>

          <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 text-white rounded-full text-xl font-bold mb-6">
              2
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Tenant Signs & Deposits
            </h3>
            <p className="text-gray-600">
              Tenant reviews, signs the agreement, and deposits security amount in PYUSD or USDF to escrow.
            </p>
          </div>

          <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 text-white rounded-full text-xl font-bold mb-6">
              3
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Earn & Pay
            </h3>
            <p className="text-gray-600">
              Landlord earns yield on deposited funds while tenant pays monthly rent and receives rewards.
            </p>
          </div>
        </div>
      </div>

      {/* Supported Networks */}
      <div className="py-20 bg-gray-50 rounded-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Supported Networks & Currencies
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ethereum Sepolia
              </h3>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">PYUSD</span>
                </div>
              </div>
              <p className="text-gray-600">
                PayPal USD stablecoin for secure and familiar cryptocurrency transactions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Flow EVM Testnet
              </h3>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">USDF</span>
                </div>
              </div>
              <p className="text-gray-600">
                USD stablecoin on Flow's fast and developer-friendly blockchain.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Information Section */}
      <div className="py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-black mb-4">
            Live Smart Contracts
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform is powered by deployed smart contracts on both Ethereum Sepolia and Flow EVM testnets.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <ContractInfo />
        </div>
      </div>
    </div>
  );
};

export default Home;