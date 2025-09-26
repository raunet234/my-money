import { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { generateAgreementHash, signMessage } from '../utils/web3';
import { toast } from 'react-toastify';

export const useAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(false);
  const { account, signer } = useWeb3();

  // Load agreements for the current user
  const loadAgreements = async () => {
    if (!account) {
      setAgreements([]);
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, this would fetch from your backend API or blockchain
      // For now, we'll use mock data stored in localStorage
      const storedAgreements = localStorage.getItem(`agreements_${account}`);
      const userAgreements = storedAgreements ? JSON.parse(storedAgreements) : [];
      
      setAgreements(userAgreements);
    } catch (error) {
      console.error('Error loading agreements:', error);
      toast.error('Failed to load agreements');
    } finally {
      setLoading(false);
    }
  };

  // Create a new agreement
  const createAgreement = async (agreementData) => {
    if (!account || !signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const newAgreement = {
        ...agreementData,
        id: Date.now().toString(),
        landlord: account,
        status: 'pending_tenant_signature',
        createdAt: new Date().toISOString(),
        yieldEarned: '0',
        totalYieldEarned: '0',
        transactions: [],
        signatures: {
          landlord: null,
          tenant: null,
        },
      };

      // Generate agreement hash
      const agreementHash = generateAgreementHash(newAgreement);
      
      // Landlord signs the agreement hash
      const landlordSignature = await signMessage(agreementHash, signer);
      newAgreement.signatures.landlord = landlordSignature;
      newAgreement.agreementHash = agreementHash;

      // Save to localStorage (in real app, save to backend/blockchain)
      const existingAgreements = JSON.parse(localStorage.getItem(`agreements_${account}`) || '[]');
      const updatedAgreements = [...existingAgreements, newAgreement];
      localStorage.setItem(`agreements_${account}`, JSON.stringify(updatedAgreements));
      
      // Also save for tenant's view
      const tenantAgreements = JSON.parse(localStorage.getItem(`agreements_${agreementData.tenantAddress}`) || '[]');
      tenantAgreements.push(newAgreement);
      localStorage.setItem(`agreements_${agreementData.tenantAddress}`, JSON.stringify(tenantAgreements));

      setAgreements(updatedAgreements);
      
      return newAgreement;
    } catch (error) {
      console.error('Error creating agreement:', error);
      throw error;
    }
  };

  // Sign agreement (tenant)
  const signAgreement = async (agreementId) => {
    if (!account || !signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const agreement = agreements.find(a => a.id === agreementId);
      if (!agreement) {
        throw new Error('Agreement not found');
      }

      if (agreement.tenant.toLowerCase() !== account.toLowerCase()) {
        throw new Error('Only the tenant can sign this agreement');
      }

      // Sign the agreement hash
      const tenantSignature = await signMessage(agreement.agreementHash, signer);
      
      // Update agreement
      const updatedAgreement = {
        ...agreement,
        status: 'pending_landlord_signature',
        signatures: {
          ...agreement.signatures,
          tenant: tenantSignature,
        },
        tenantSignedAt: new Date().toISOString(),
      };

      // Update in localStorage for both parties
      await updateAgreementInStorage(updatedAgreement);
      
      return updatedAgreement;
    } catch (error) {
      console.error('Error signing agreement:', error);
      throw error;
    }
  };

  // Confirm agreement (landlord)
  const confirmAgreement = async (agreementId) => {
    if (!account || !signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const agreement = agreements.find(a => a.id === agreementId);
      if (!agreement) {
        throw new Error('Agreement not found');
      }

      if (agreement.landlord.toLowerCase() !== account.toLowerCase()) {
        throw new Error('Only the landlord can confirm this agreement');
      }

      // Update agreement to active status
      const updatedAgreement = {
        ...agreement,
        status: 'active',
        activatedAt: new Date().toISOString(),
      };

      // Update in localStorage for both parties
      await updateAgreementInStorage(updatedAgreement);
      
      return updatedAgreement;
    } catch (error) {
      console.error('Error confirming agreement:', error);
      throw error;
    }
  };

  // Pay rent
  const payRent = async (agreementId, amount) => {
    if (!account || !signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const agreement = agreements.find(a => a.id === agreementId);
      if (!agreement) {
        throw new Error('Agreement not found');
      }

      if (agreement.tenant.toLowerCase() !== account.toLowerCase()) {
        throw new Error('Only the tenant can pay rent');
      }

      // Create rent payment transaction record
      const rentPayment = {
        id: Date.now().toString(),
        type: 'rent_payment',
        amount: amount,
        currency: agreement.currency,
        from: account,
        to: agreement.landlord,
        timestamp: new Date().toISOString(),
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock transaction hash
      };

      // Update agreement with transaction
      const updatedAgreement = {
        ...agreement,
        transactions: [...agreement.transactions, rentPayment],
        lastRentPayment: new Date().toISOString(),
      };

      // Update in localStorage for both parties
      await updateAgreementInStorage(updatedAgreement);
      
      return { agreement: updatedAgreement, transaction: rentPayment };
    } catch (error) {
      console.error('Error paying rent:', error);
      throw error;
    }
  };

  // Withdraw yield (landlord)
  const withdrawYield = async (agreementId) => {
    if (!account || !signer) {
      throw new Error('Wallet not connected');
    }

    try {
      const agreement = agreements.find(a => a.id === agreementId);
      if (!agreement) {
        throw new Error('Agreement not found');
      }

      if (agreement.landlord.toLowerCase() !== account.toLowerCase()) {
        throw new Error('Only the landlord can withdraw yield');
      }

      const currentYield = parseFloat(agreement.yieldEarned || '0');
      if (currentYield <= 0) {
        throw new Error('No yield available to withdraw');
      }

      // Create yield withdrawal transaction record
      const yieldWithdrawal = {
        id: Date.now().toString(),
        type: 'yield_withdrawal',
        amount: currentYield.toString(),
        currency: agreement.currency,
        from: 'escrow',
        to: account,
        timestamp: new Date().toISOString(),
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Mock transaction hash
      };

      // Update agreement
      const updatedAgreement = {
        ...agreement,
        yieldEarned: '0',
        totalYieldEarned: (parseFloat(agreement.totalYieldEarned || '0') + currentYield).toString(),
        transactions: [...agreement.transactions, yieldWithdrawal],
        lastYieldWithdrawal: new Date().toISOString(),
      };

      // Update in localStorage for both parties
      await updateAgreementInStorage(updatedAgreement);
      
      return { agreement: updatedAgreement, transaction: yieldWithdrawal };
    } catch (error) {
      console.error('Error withdrawing yield:', error);
      throw error;
    }
  };

  // Helper function to update agreement in storage for both parties
  const updateAgreementInStorage = async (updatedAgreement) => {
    // Update landlord's storage
    const landlordAgreements = JSON.parse(localStorage.getItem(`agreements_${updatedAgreement.landlord}`) || '[]');
    const landlordIndex = landlordAgreements.findIndex(a => a.id === updatedAgreement.id);
    if (landlordIndex >= 0) {
      landlordAgreements[landlordIndex] = updatedAgreement;
      localStorage.setItem(`agreements_${updatedAgreement.landlord}`, JSON.stringify(landlordAgreements));
    }

    // Update tenant's storage
    const tenantAgreements = JSON.parse(localStorage.getItem(`agreements_${updatedAgreement.tenant}`) || '[]');
    const tenantIndex = tenantAgreements.findIndex(a => a.id === updatedAgreement.id);
    if (tenantIndex >= 0) {
      tenantAgreements[tenantIndex] = updatedAgreement;
      localStorage.setItem(`agreements_${updatedAgreement.tenant}`, JSON.stringify(tenantAgreements));
    }

    // Update local state
    setAgreements(prev => prev.map(a => a.id === updatedAgreement.id ? updatedAgreement : a));
  };

  // Get agreement by ID
  const getAgreement = (agreementId) => {
    return agreements.find(a => a.id === agreementId);
  };

  // Get user's role in agreement
  const getUserRole = (agreement) => {
    if (!account || !agreement) return null;
    
    if (agreement.landlord.toLowerCase() === account.toLowerCase()) {
      return 'landlord';
    } else if (agreement.tenant.toLowerCase() === account.toLowerCase()) {
      return 'tenant';
    }
    
    return null;
  };

  // Load agreements when account changes
  useEffect(() => {
    loadAgreements();
  }, [account]);

  return {
    agreements,
    loading,
    createAgreement,
    signAgreement,
    confirmAgreement,
    payRent,
    withdrawYield,
    getAgreement,
    getUserRole,
    loadAgreements,
  };
};