import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useWeb3, useRole } from '../contexts/Web3Context';
import LandlordDashboard from '../components/LandlordDashboard';
import TenantDashboard from '../components/TenantDashboard';

const Dashboard = () => {
  const { account } = useWeb3();
  const { userRole } = useRole();

  if (!account) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h2>
        <p className="text-gray-600 mb-8">Please connect your wallet to view your dashboard.</p>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  if (userRole === 'landlord') {
    return <LandlordDashboard />;
  } else if (userRole === 'tenant') {
    return <TenantDashboard />;
  }

  // This shouldn't happen if role selection is working properly
  return (
    <div className="text-center py-20">
      <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Role Not Selected</h2>
      <p className="text-gray-600 mb-8">Please select your role to continue.</p>
    </div>
  );
};

export default Dashboard;