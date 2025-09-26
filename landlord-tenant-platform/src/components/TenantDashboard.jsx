import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, DollarSign, Award, Clock, Calendar, TrendingUp, AlertCircle, CreditCard } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';

const TenantDashboard = () => {
  const { account } = useWeb3();
  const [agreements, setAgreements] = useState([]);
  const [stats, setStats] = useState({
    activeRentals: 0,
    totalRewards: 0,
    onTimePayments: 0,
    nextPaymentDue: null,
  });

  // Mock data for tenant-specific view
  useEffect(() => {
    if (account) {
      const mockAgreements = [
        {
          id: '1',
          propertyAddress: '123 Main St, Apt 4B',
          tenant: account,
          landlord: '0x8ba1f109551bD432803012645Hac136c98F71227',
          rentAmount: '1500',
          securityDeposit: '3000',
          currency: 'PYUSD',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          nextPaymentDue: '2024-02-01',
          rewardsEarned: '45.67',
          onTimePayments: 12,
          totalPayments: 12,
          lastPayment: '2024-01-01',
        },
        {
          id: '2',
          propertyAddress: '456 Oak Ave, Unit 2A',
          tenant: account,
          landlord: '0x1234567890123456789012345678901234567890',
          rentAmount: '1200',
          securityDeposit: '2400',
          currency: 'USDF',
          status: 'pending_tenant_signature',
          startDate: '2024-02-01',
          endDate: '2025-01-31',
          nextPaymentDue: null,
          rewardsEarned: '0',
          onTimePayments: 0,
          totalPayments: 0,
          lastPayment: null,
        },
      ];

      setAgreements(mockAgreements);
      
      const activeAgreements = mockAgreements.filter(a => a.status === 'active');
      const totalRewards = activeAgreements.reduce((sum, a) => sum + parseFloat(a.rewardsEarned || 0), 0);
      const totalOnTimePayments = activeAgreements.reduce((sum, a) => sum + a.onTimePayments, 0);
      const nextDue = activeAgreements.find(a => a.nextPaymentDue)?.nextPaymentDue;

      setStats({
        activeRentals: activeAgreements.length,
        totalRewards: totalRewards,
        onTimePayments: totalOnTimePayments,
        nextPaymentDue: nextDue,
      });
    }
  }, [account]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-gray-100 text-black';
      case 'pending_tenant_signature':
        return 'bg-gray-200 text-gray-800';
      case 'pending_payment':
        return 'bg-gray-200 text-gray-800';
      case 'expired':
        return 'bg-gray-300 text-gray-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const canPayRent = (agreement) => {
    return agreement.status === 'active' && agreement.nextPaymentDue;
  };

  const canSign = (agreement) => {
    return agreement.status === 'pending_tenant_signature';
  };

  if (!account) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
        <p className="text-gray-600 mb-8">Please connect your wallet to view your tenant dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tenant Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your rental agreements, payments, and rewards</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rentals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeRentals}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rewards</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRewards.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On-Time Payments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.onTimePayments}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Next Payment</p>
              <p className="text-lg font-bold text-gray-900">
                {stats.nextPaymentDue ? new Date(stats.nextPaymentDue).toLocaleDateString() : 'None'}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <CreditCard className="w-6 h-6 text-black" />
            <div className="text-left">
              <p className="font-medium text-black">Pay Rent</p>
              <p className="text-sm text-gray-600">Make your monthly payment</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <Award className="w-6 h-6 text-black" />
            <div className="text-left">
              <p className="font-medium text-black">View Rewards</p>
              <p className="text-sm text-gray-600">Check earned rewards</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <FileText className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-purple-900">View Agreements</p>
              <p className="text-sm text-purple-600">Manage your rentals</p>
            </div>
          </button>
        </div>
      </div>

      {/* Agreements List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Rental Agreements</h2>
        </div>
        
        {agreements.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agreements yet</h3>
            <p className="text-gray-600 mb-6">You haven't signed any rental agreements yet.</p>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Rent:</span>{' '}
                        {agreement.rentAmount} {agreement.currency}
                      </div>
                      <div>
                        <span className="font-medium">Security Deposit:</span>{' '}
                        {agreement.securityDeposit} {agreement.currency}
                      </div>
                      <div>
                        <span className="font-medium">Rewards Earned:</span>{' '}
                        ${agreement.rewardsEarned}
                      </div>
                      <div>
                        <span className="font-medium">Payment History:</span>{' '}
                        {agreement.onTimePayments}/{agreement.totalPayments} on-time
                      </div>
                    </div>
                    
                    {agreement.nextPaymentDue && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Next Payment Due:</span>{' '}
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
                    
                    {canSign(agreement) && (
                      <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors">
                        Sign & Deposit
                      </button>
                    )}
                    
                    {canPayRent(agreement) && (
                      <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                        Pay Rent
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
        </div>
        
        <div className="p-6">
          <div className="text-center py-8 text-gray-500">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p>No recent payments to display</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDashboard;