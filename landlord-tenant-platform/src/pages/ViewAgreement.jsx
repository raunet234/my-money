import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  MapPin, 
  User, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Shield, 
  Check, 
  Clock,
  AlertCircle,
  ArrowLeft 
} from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';

const ViewAgreement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, signer } = useWeb3();
  
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOrDepositing, setIsSigningOrDepositing] = useState(false);

  useEffect(() => {
    // Mock loading agreement data
    // In real app, this would fetch from blockchain/API
    const loadAgreement = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockAgreement = {
          id: id,
          propertyAddress: '123 Main St, Apt 4B, New York, NY 10001',
          tenant: '0x742d35Cc6074C4532895c05b22629ce5b3c28da4',
          landlord: '0x8ba1f109551bD432803012645Hac136c98F71227',
          rentAmount: '1500',
          securityDeposit: '3000',
          currency: 'PYUSD',
          status: 'pending_tenant_signature',
          startDate: '2024-02-01',
          endDate: '2025-01-31',
          paymentDay: '1',
          description: '2 bedroom, 2 bathroom apartment with balcony and parking space. Modern appliances included.',
          specialTerms: 'No pets allowed. No smoking. Tenant responsible for utilities except water and garbage.',
          yieldEarned: '0',
          totalYieldEarned: '0',
          createdAt: '2024-01-15',
          signedAt: null,
          transactions: [],
        };
        
        setAgreement(mockAgreement);
      } catch (error) {
        console.error('Error loading agreement:', error);
        toast.error('Failed to load agreement');
      } finally {
        setLoading(false);
      }
    };

    loadAgreement();
  }, [id]);

  const isLandlord = () => {
    return agreement?.landlord.toLowerCase() === account?.toLowerCase();
  };

  const isTenant = () => {
    return agreement?.tenant.toLowerCase() === account?.toLowerCase();
  };

  const canSign = () => {
    if (!agreement || !account) return false;
    
    if (agreement.status === 'pending_tenant_signature' && isTenant()) {
      return true;
    }
    
    if (agreement.status === 'pending_landlord_signature' && isLandlord()) {
      return true;
    }
    
    return false;
  };

  const handleSignAndDeposit = async () => {
    if (!agreement || !account || !signer) {
      toast.error('Please ensure your wallet is connected');
      return;
    }

    setIsSigningOrDepositing(true);
    
    try {
      if (isTenant() && agreement.status === 'pending_tenant_signature') {
        // Tenant signing and depositing security deposit
        toast.info('Please confirm the transaction in your wallet...');
        
        // Here you would:
        // 1. Sign the agreement hash
        // 2. Approve token spending
        // 3. Deposit security deposit to escrow contract
        
        // Simulate the process
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Update agreement status
        setAgreement(prev => ({
          ...prev,
          status: 'pending_landlord_signature',
          signedAt: new Date().toISOString(),
        }));
        
        toast.success('Agreement signed and security deposit transferred successfully!');
        
      } else if (isLandlord() && agreement.status === 'pending_landlord_signature') {
        // Landlord confirming and signing
        toast.info('Confirming agreement...');
        
        // Here you would:
        // 1. Verify the tenant's signature
        // 2. Sign the agreement
        // 3. Activate the rental agreement
        
        // Simulate the process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update agreement status
        setAgreement(prev => ({
          ...prev,
          status: 'active',
        }));
        
        toast.success('Agreement confirmed and activated successfully!');
      }
      
    } catch (error) {
      console.error('Error signing agreement:', error);
      toast.error('Failed to sign agreement. Please try again.');
    } finally {
      setIsSigningOrDepositing(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending_tenant_signature':
        return {
          text: 'Pending Tenant Signature',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
        };
      case 'pending_landlord_signature':
        return {
          text: 'Pending Landlord Confirmation',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
        };
      case 'active':
        return {
          text: 'Active',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: Check,
        };
      case 'expired':
        return {
          text: 'Expired',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: AlertCircle,
        };
      default:
        return {
          text: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: AlertCircle,
        };
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Agreement Not Found</h2>
        <p className="text-gray-600 mb-8">The agreement you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(agreement.status);
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rental Agreement</h1>
          <p className="text-gray-600 mt-1">Agreement ID: {agreement.id}</p>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`border-2 rounded-xl p-4 mb-8 ${statusDisplay.color}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <StatusIcon className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">{statusDisplay.text}</h3>
              <p className="text-sm opacity-75">
                {agreement.status === 'pending_tenant_signature' && isTenant() && 
                  'Please review and sign this agreement, then deposit the security amount.'}
                {agreement.status === 'pending_landlord_signature' && isLandlord() && 
                  'The tenant has signed and deposited. Please review and confirm the agreement.'}
                {agreement.status === 'active' && 
                  'This rental agreement is currently active.'}
              </p>
            </div>
          </div>
          
          {canSign() && (
            <button
              onClick={handleSignAndDeposit}
              disabled={isSigningOrDepositing}
              className="px-6 py-2 bg-white hover:bg-gray-50 disabled:bg-gray-100 text-gray-800 font-semibold rounded-lg border-2 border-current transition-colors"
            >
              {isSigningOrDepositing ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>Processing...</span>
                </div>
              ) : isTenant() ? (
                'Sign & Deposit'
              ) : (
                'Confirm & Sign'
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Agreement Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Property Information */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Property Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                <p className="text-gray-900">{agreement.propertyAddress}</p>
              </div>
              
              {agreement.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                  <p className="text-gray-900">{agreement.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Parties */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Parties
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Landlord</label>
                <p className="text-gray-900 font-mono text-sm break-all">{agreement.landlord}</p>
                {isLandlord() && (
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    You
                  </span>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Tenant</label>
                <p className="text-gray-900 font-mono text-sm break-all">{agreement.tenant}</p>
                {isTenant() && (
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    You
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Terms & Conditions
            </h2>
            
            <div className="prose text-gray-700">
              <h3 className="text-lg font-semibold mb-2">Standard Terms</h3>
              <ul className="list-disc ml-5 space-y-1 mb-4">
                <li>Tenant agrees to pay rent on time each month</li>
                <li>Security deposit will be held in escrow during the lease term</li>
                <li>Landlord will earn yield on the deposited security amount</li>
                <li>Tenant will receive rewards for timely rent payments</li>
                <li>All payments to be made in {agreement.currency}</li>
                <li>Any damages will be deducted from the security deposit</li>
              </ul>
              
              {agreement.specialTerms && (
                <>
                  <h3 className="text-lg font-semibold mb-2">Special Terms</h3>
                  <p className="whitespace-pre-wrap">{agreement.specialTerms}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="space-y-6">
          {/* Financial Details */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Financial Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Monthly Rent</span>
                <span className="font-semibold">{agreement.rentAmount} {agreement.currency}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Security Deposit</span>
                <span className="font-semibold">{agreement.securityDeposit} {agreement.currency}</span>
              </div>
              
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">Payment Due</span>
                <span className="font-semibold">{agreement.paymentDay}{agreement.paymentDay === '1' ? 'st' : agreement.paymentDay === '2' ? 'nd' : agreement.paymentDay === '3' ? 'rd' : 'th'} of each month</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Currency</span>
                <span className="font-semibold">{agreement.currency}</span>
              </div>
            </div>
          </div>

          {/* Lease Period */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Lease Period
            </h2>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Start Date</span>
                <p className="font-semibold">{new Date(agreement.startDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">End Date</span>
                <p className="font-semibold">{new Date(agreement.endDate).toLocaleDateString()}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Duration</span>
                <p className="font-semibold">
                  {Math.ceil((new Date(agreement.endDate) - new Date(agreement.startDate)) / (1000 * 60 * 60 * 24 * 30))} months
                </p>
              </div>
            </div>
          </div>

          {/* Yield Information */}
          {agreement.status === 'active' && (
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Yield Information
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Yield</span>
                  <span className="font-semibold text-green-600">${agreement.yieldEarned}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Earned</span>
                  <span className="font-semibold text-green-600">${agreement.totalYieldEarned}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Est. APY</span>
                  <span className="font-semibold text-blue-600">4.5%</span>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security
            </h2>
            
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Escrow Smart Contract</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Blockchain Verified</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Automated Execution</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAgreement;