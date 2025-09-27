import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, DollarSign, Calendar, MapPin, User, Send } from 'lucide-react';
import { useWeb3 } from '../contexts/Web3Context';
import { toast } from 'react-toastify';

const CreateAgreement = () => {
  const { account, chainId, createAgreement } = useWeb3();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    propertyAddress: '',
    tenantAddress: '',
    rentAmount: '',
    securityDeposit: '',
    currency: 'PYUSD',
    startDate: '',
    endDate: '',
    paymentDay: '1',
    description: '',
    specialTerms: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Validate form
    if (!formData.propertyAddress || !formData.tenantAddress || !formData.rentAmount || !formData.securityDeposit) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate addresses
    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.tenantAddress)) {
      toast.error('Please enter a valid tenant wallet address');
      return;
    }

    if (formData.tenantAddress.toLowerCase() === account.toLowerCase()) {
      toast.error('Tenant address cannot be the same as your address');
      return;
    }

    // Validate currency based on network
    if (chainId === 11155111 && formData.currency !== 'PYUSD') {
      toast.error('Please select PYUSD for Ethereum Sepolia network');
      return;
    }
    
    if (chainId === 545 && formData.currency !== 'USDF') {
      toast.error('Please select USDF for Flow EVM network');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate lease duration from dates
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const diffInMs = endDate - startDate;
      const leaseTerm = Math.ceil(diffInMs / (1000 * 60 * 60 * 24 * 30)); // Convert to months
      
      // Create agreement using smart contract
      await createAgreement(
        formData.tenantAddress,
        formData.rentAmount,
        formData.securityDeposit,
        leaseTerm
      );
      
      toast.success('Agreement created successfully! Sending to tenant for signature.');
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error creating agreement:', error);
      toast.error('Failed to create agreement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSupportedCurrencies = () => {
    switch (chainId) {
      case 11155111: // Ethereum Sepolia
        return [{ value: 'PYUSD', label: 'PYUSD (PayPal USD)' }];
      case 545: // Flow EVM
        return [{ value: 'USDF', label: 'USDF (USD Stablecoin)' }];
      default:
        return [
          { value: 'PYUSD', label: 'PYUSD (PayPal USD)' },
          { value: 'USDF', label: 'USDF (USD Stablecoin)' },
        ];
    }
  };

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
        <p className="text-gray-600 mb-8">Please connect your wallet to create a rental agreement.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Rental Agreement</h1>
        <p className="text-gray-600 mt-2">
          Create a new rental agreement with cryptocurrency payments and security deposit escrow.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-8">
        {/* Property Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Property Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Address *
              </label>
              <input
                type="text"
                name="propertyAddress"
                value={formData.propertyAddress}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="123 Main Street, Apt 4B, City, State, ZIP"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the property (bedrooms, bathrooms, amenities, etc.)"
              />
            </div>
          </div>
        </div>

        {/* Tenant Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Tenant Information
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenant Wallet Address *
            </label>
            <input
              type="text"
              name="tenantAddress"
              value={formData.tenantAddress}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              placeholder="0x742d35Cc6074C4532895c05b22629ce5b3c28da4"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              The tenant's Ethereum wallet address that will be used for payments and signatures.
            </p>
          </div>
        </div>

        {/* Financial Terms */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Financial Terms
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Rent Amount *
              </label>
              <input
                type="number"
                name="rentAmount"
                value={formData.rentAmount}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1500"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Deposit *
              </label>
              <input
                type="number"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="3000"
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency *
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {getSupportedCurrencies().map(currency => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </select>
              {chainId && (
                <p className="text-sm text-gray-500 mt-1">
                  {chainId === 11155111 ? 'Ethereum Sepolia network detected' : 
                   chainId === 545 ? 'Flow EVM network detected' : 
                   'Please switch to a supported network'}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Due Day
              </label>
              <select
                name="paymentDay"
                value={formData.paymentDay}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day.toString()}>
                    {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of each month
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lease Terms */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Lease Terms
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lease Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lease End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        </div>

        {/* Special Terms */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Terms & Conditions
          </label>
          <textarea
            name="specialTerms"
            value={formData.specialTerms}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any additional terms, conditions, or rules specific to this rental agreement..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Agreement...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Create & Send to Tenant
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAgreement;