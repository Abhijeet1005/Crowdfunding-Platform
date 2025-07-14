import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/layout/Header';
import { CampaignsList } from './components/campaigns/CampaignsList';
import { CreateCampaign } from './components/campaigns/CreateCampaign';
import { CampaignDetails } from './components/campaigns/CampaignDetails';
import { Dashboard } from './components/dashboard/Dashboard';
import { useWallet } from './hooks/useWallet';

declare global {
  interface Window {
    ethereum?: any;
  }
}

function App() {
  const { isConnected } = useWallet();
  const [currentView, setCurrentView] = useState('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const handleViewCampaignDetails = (address: string) => {
    setSelectedCampaign(address);
    setCurrentView('details');
  };

  const handleBackToCampaigns = () => {
    setSelectedCampaign(null);
    setCurrentView('campaigns');
  };

  const handleCampaignCreated = () => {
    setCurrentView('campaigns');
  };

  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-white">CF</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to CrowdFund
            </h1>
            <p className="text-gray-600 max-w-md">
              Connect your wallet to start creating campaigns or supporting innovative projects on the blockchain.
            </p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'campaigns':
        return <CampaignsList onViewDetails={handleViewCampaignDetails} />;
      case 'create':
        return <CreateCampaign onCampaignCreated={handleCampaignCreated} />;
      case 'dashboard':
        return (
          <Dashboard
            onViewDetails={handleViewCampaignDetails}
            onCreateCampaign={() => setCurrentView('create')}
          />
        );
      case 'details':
        return selectedCampaign ? (
          <CampaignDetails
            campaignAddress={selectedCampaign}
            onBack={handleBackToCampaigns}
          />
        ) : null;
      default:
        return <CampaignsList onViewDetails={handleViewCampaignDetails} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
}

export default App;