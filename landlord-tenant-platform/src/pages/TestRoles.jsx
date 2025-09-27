import React from 'react';
import { useWeb3, useRole } from '../contexts/Web3Context';
import LandlordDashboard from '../components/LandlordDashboard';
import TenantDashboard from '../components/TenantDashboard';

const TestRoles = () => {
  const { account } = useWeb3();
  const { userRole, isRoleSelected, selectRole } = useRole();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-blue-100 border border-blue-400 rounded-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-blue-800 mb-4">🧪 Role Testing Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-bold">Current State</h3>
            <p><strong>Account:</strong> {account || 'Not connected'}</p>
            <p><strong>Role:</strong> {userRole || 'None'}</p>
            <p><strong>Role Selected:</strong> {isRoleSelected ? 'Yes' : 'No'}</p>
          </div>
          
          <div className="bg-white p-4 rounded border">
            <h3 className="font-bold">Actions</h3>
            <div className="space-y-2">
              <button 
                onClick={() => selectRole('landlord')}
                className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Set as Landlord
              </button>
              <button 
                onClick={() => selectRole('tenant')}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Set as Tenant
              </button>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded border">
            <h3 className="font-bold">Expected Dashboard</h3>
            <p>
              {userRole === 'landlord' && '🏠 LandlordDashboard'}
              {userRole === 'tenant' && '🏘️ TenantDashboard'}
              {!userRole && '❓ No dashboard'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Show the actual dashboards */}
      {userRole === 'landlord' && (
        <div className="border-4 border-green-400 rounded-lg p-4">
          <h2 className="text-xl font-bold text-green-800 mb-4">🏠 LANDLORD DASHBOARD</h2>
          <LandlordDashboard />
        </div>
      )}
      
      {userRole === 'tenant' && (
        <div className="border-4 border-blue-400 rounded-lg p-4">
          <h2 className="text-xl font-bold text-blue-800 mb-4">🏘️ TENANT DASHBOARD</h2>
          <TenantDashboard />
        </div>
      )}
      
      {!userRole && (
        <div className="border-4 border-gray-400 rounded-lg p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">❓ NO ROLE SELECTED</h2>
          <p>Please select a role above to test the dashboards.</p>
        </div>
      )}
    </div>
  );
};

export default TestRoles;