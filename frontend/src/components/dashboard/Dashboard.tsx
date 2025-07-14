import React, { useState, useEffect } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { CampaignCard } from '../campaigns/CampaignCard';
import { Button } from '../ui/Button';
import { useContracts } from '../../hooks/useContracts';
import { useWallet } from '../../hooks/useWallet';
import { Campaign, CampaignDetails } from '../../types/contracts';

interface DashboardProps {
  onViewDetails: (address: string) => void;
  onCreateCampaign: () => void;
}

export function Dashboard({ onViewDetails, onCreateCampaign }: DashboardProps) {
  const { getUserCampaigns, getCampaignDetails } = useContracts();
  const { address } = useWallet();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignDetails, setCampaignDetails] = useState<Record<string, CampaignDetails>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadUserCampaigns();
    }
  }, [address]);

  const loadUserCampaigns = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      const userCampaigns = await getUserCampaigns(address);
      setCampaigns(userCampaigns);
      
      // Load details for each campaign
      const detailsPromises = userCampaigns.map(async (campaign) => {
        const details = await getCampaignDetails(campaign.campaignAddress);
        return { address: campaign.campaignAddress, details };
      });
      
      const detailsResults = await Promise.all(detailsPromises);
      const detailsMap: Record<string, CampaignDetails> = {};
      
      detailsResults.forEach(({ address, details }) => {
        if (details) {
          detailsMap[address] = details;
        }
      });
      
      setCampaignDetails(detailsMap);
    } catch (error) {
      console.error('Error loading user campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Campaigns</h2>
          <p className="text-gray-600">Manage your crowdfunding campaigns</p>
        </div>
        <Button
          onClick={onCreateCampaign}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Campaign</span>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-500 mb-4">Start your first crowdfunding campaign today</p>
            <Button onClick={onCreateCampaign}>
              Create Your First Campaign
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.campaignAddress}
              campaign={campaign}
              details={campaignDetails[campaign.campaignAddress]}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}