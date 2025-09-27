import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, DollarSign, Calendar, TrendingUp, Clock, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';

const MyAgreements = () => {
  const { account } = useWeb3();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for tenant agreements
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
          createdAt: '2024-01-01',
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
          createdAt: '2024-01-15',
        },
        {
          id: '3',
          propertyAddress: '789 Pine Street, Suite 101',
          tenant: account,
          landlord: '0x9876543210987654321098765432109876543210',
          rentAmount: '1800',
          securityDeposit: '3600',
          currency: 'PYUSD',
          status: 'expired',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          nextPaymentDue: null,
          rewardsEarned: '120.45',
          onTimePayments: 12,
          totalPayments: 12,
          lastPayment: '2023-12-01',
          createdAt: '2023-01-01',
        },
      ];

      setAgreements(mockAgreements);
      setLoading(false);
    }
  }, [account]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_tenant_signature':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending_payment':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return Check;
      case 'pending_tenant_signature':
        return Clock;
      case 'pending_payment':
        return DollarSign;
      case 'expired':
        return AlertCircle;
      default:
        return FileText;
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const canSign = (agreement) => {
    return agreement.status === 'pending_tenant_signature';
  };

  const canPayRent = (agreement) => {
    return agreement.status === 'active' && agreement.nextPaymentDue;
  };

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
        <p className="text-gray-600 mb-8">Please connect your wallet to view your agreements.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your agreements...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">My Rental Agreements</h1>
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                🏘️ Tenant View
              </span>
            </div>
            <p className="text-gray-600">Manage and track all your rental agreements</p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Agreements</p>
            <p className="text-2xl font-bold text-gray-900">{agreements.length}</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {agreements.filter(a => a.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {agreements.filter(a => a.status === 'pending_tenant_signature').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rewards</p>
              <p className="text-2xl font-bold text-blue-600">
                ${agreements.reduce((sum, a) => sum + parseFloat(a.rewardsEarned || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On-Time Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {agreements.length > 0 ? 
                  Math.round((agreements.reduce((sum, a) => sum + a.onTimePayments, 0) / 
                  Math.max(agreements.reduce((sum, a) => sum + a.totalPayments, 0), 1)) * 100) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Agreements List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Agreements</h2>
        </div>
        
        {agreements.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agreements found</h3>
            <p className="text-gray-600 mb-6">You haven't signed any rental agreements yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {agreements.map((agreement) => {
              const StatusIcon = getStatusIcon(agreement.status);
              return (
                <div key={agreement.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {agreement.propertyAddress}
                        </h3>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(agreement.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {formatStatus(agreement.status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium text-gray-900">Monthly Rent:</span>{" "}
                          <span className="text-green-600 font-semibold">
                            {agreement.rentAmount} {agreement.currency}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Security Deposit:</span>{" "}
                          {agreement.securityDeposit} {agreement.currency}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Rewards Earned:</span>{" "}
                          <span className="text-blue-600 font-semibold">
                            ${agreement.rewardsEarned}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Payment Record:</span>{" "}
                          {agreement.onTimePayments}/{agreement.totalPayments} on-time
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div>
                          <strong>Start:</strong> {new Date(agreement.startDate).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>End:</strong> {new Date(agreement.endDate).toLocaleDateString()}
                        </div>
                        {agreement.nextPaymentDue && (
                          <div>
                            <strong>Next Payment:</strong>{" "}
                            <span className="text-orange-600 font-medium">
                              {new Date(agreement.nextPaymentDue).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-6">
                      <Link
                        to={`/agreement/${agreement.id}`}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAgreements;