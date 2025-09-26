import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, DollarSign, TrendingUp, Clock, Check, AlertCircle, Building } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';

const LandlordDashboard = () => {
  const { account } = useWeb3();
  const [agreements, setAgreements] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeRentals: 0,
    totalYieldEarned: 0,
    pendingActions: 0,
    monthlyRentIncome: 0,
  });

  // Mock data for landlord-specific view
  useEffect(() => {
    if (account) {
      const mockAgreements = [
        {
          id: '1',
          propertyAddress: '123 Main St, Apt 4B',
          tenant: '0x742d35Cc6074C4532895c05b22629ce5b3c28da4',
          landlord: account,
          rentAmount: '1500',
          securityDeposit: '3000',
          currency: 'PYUSD',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          yieldEarned: '45.67',
          totalYieldEarned: '145.67',
          nextPaymentDue: '2024-02-01',
          lastRentReceived: '2024-01-01',
        },
        {
          id: '2',
          propertyAddress: '456 Oak Ave, Unit 2A',
          tenant: '0x1234567890123456789012345678901234567890',
          landlord: account,
          rentAmount: '1200',
          securityDeposit: '2400',
          currency: 'USDF',
          status: 'pending_tenant_signature',
          startDate: '2024-02-01',
          endDate: '2025-01-31',
          yieldEarned: '0',
          totalYieldEarned: '0',
          nextPaymentDue: null,
          lastRentReceived: null,
        },
        {
          id: '3',
          propertyAddress: '789 Pine Rd, House',
          tenant: '0x9876543210123456789012345678901234567890',
          landlord: account,
          rentAmount: '2000',
          securityDeposit: '4000',
          currency: 'PYUSD',
          status: 'active',
          startDate: '2023-12-01',
          endDate: '2024-11-30',
          yieldEarned: '78.90',
          totalYieldEarned: '234.56',
          nextPaymentDue: '2024-02-01',
          lastRentReceived: '2024-01-01',
        },
      ];

      setAgreements(mockAgreements);
      
      const activeAgreements = mockAgreements.filter(a => a.status === 'active');
      const pendingAgreements = mockAgreements.filter(a => a.status.includes('pending'));
      const totalYield = mockAgreements.reduce((sum, a) => sum + parseFloat(a.totalYieldEarned || 0), 0);
      const monthlyIncome = activeAgreements.reduce((sum, a) => sum + parseFloat(a.rentAmount || 0), 0);

      setStats({
        totalProperties: mockAgreements.length,
        activeRentals: activeAgreements.length,
        totalYieldEarned: totalYield,
        pendingActions: pendingAgreements.length,
        monthlyRentIncome: monthlyIncome,
      });
    }
  }, [account]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending_tenant_signature':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending_landlord_signature':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const canConfirm = (agreement) => {
    return agreement.status === 'pending_landlord_signature';
  };

  const canWithdrawYield = (agreement) => {
    return agreement.status === 'active' && parseFloat(agreement.yieldEarned || 0) > 0;
  };

  if (!account) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
        <p className="text-gray-600 mb-8">Please connect your wallet to view your landlord dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Landlord Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your properties, tenants, and earnings</p>
        </div>
        <Link
          to="/create-agreement"
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Agreement
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rentals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeRentals}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Income</p>
              <p className="text-2xl font-bold text-gray-900">${stats.monthlyRentIncome}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Yield Earned</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalYieldEarned.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Actions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingActions}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/create-agreement"
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Plus className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-blue-900">Create Agreement</p>
              <p className="text-sm text-blue-600">Add new rental property</p>
            </div>
          </Link>
          
          <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-green-900">Withdraw Yield</p>
              <p className="text-sm text-green-600">Collect earned interest</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <FileText className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-purple-900">View Reports</p>
              <p className="text-sm text-purple-600">Analyze performance</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <Building className="w-6 h-6 text-orange-600" />
            <div className="text-left">
              <p className="font-medium text-orange-900">Property Manager</p>
              <p className="text-sm text-orange-600">Manage all properties</p>
            </div>
          </button>
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Properties</h2>
        </div>
        
        {agreements.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties yet</h3>
            <p className="text-gray-600 mb-6">Create your first rental agreement to get started.</p>
            <Link
              to="/create-agreement"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Agreement
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {agreements.map((agreement) => (
              <div key={agreement.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {agreement.propertyAddress}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(agreement.status)}`}>
                        {formatStatus(agreement.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Monthly Rent:</span>{' '}
                        {agreement.rentAmount} {agreement.currency}
                      </div>
                      <div>
                        <span className="font-medium">Security Deposit:</span>{' '}
                        {agreement.securityDeposit} {agreement.currency}
                      </div>
                      <div>
                        <span className="font-medium">Current Yield:</span>{' '}
                        ${agreement.yieldEarned}
                      </div>
                      <div>
                        <span className="font-medium">Total Earned:</span>{' '}
                        ${agreement.totalYieldEarned}
                      </div>
                      <div>
                        <span className="font-medium">Tenant:</span>{' '}
                        {agreement.tenant.slice(0, 6)}...{agreement.tenant.slice(-4)}
                      </div>
                    </div>
                    
                    {agreement.nextPaymentDue && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Next Rent Due:</span>{' '}
                        {new Date(agreement.nextPaymentDue).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <Link
                      to={`/agreement/${agreement.id}`}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      View Details
                    </Link>
                    
                    {canConfirm(agreement) && (
                      <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                        Confirm & Sign
                      </button>
                    )}
                    
                    {canWithdrawYield(agreement) && (
                      <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                        Withdraw ${agreement.yieldEarned}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandlordDashboard;