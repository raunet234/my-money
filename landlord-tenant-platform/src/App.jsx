import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Web3Provider, useWeb3, useRole } from './contexts/Web3Context';
import Navbar from './components/Navbar';
import RoleSelection from './components/RoleSelection';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CreateAgreement from './pages/CreateAgreement';
import ViewAgreement from './pages/ViewAgreement';
import TestRoles from './pages/TestRoles';
import MyAgreements from './pages/MyAgreements';
import 'react-toastify/dist/ReactToastify.css';

const AppContent = () => {
  const { account } = useWeb3();
  const { isRoleSelected } = useRole();

  // Show role selection if user is connected but hasn't selected a role
  if (account && !isRoleSelected) {
    return <RoleSelection />;
  }

  return (
    <div className="min-h-screen w-screen bg-white">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-agreement" element={<CreateAgreement />} />
          <Route path="/agreement/:id" element={<ViewAgreement />} />
          <Route path="/my-agreements" element={<MyAgreements />} />
          <Route path="/test-roles" element={<TestRoles />} />
        </Routes>
      </main>
      <ToastContainer position="top-right" />
    </div>
  );
};

function App() {
  return (
    <Web3Provider>
      <Router>
        <AppContent />
      </Router>
    </Web3Provider>
  );
}

export default App;
