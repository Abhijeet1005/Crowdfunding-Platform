import React, { useState, useEffect } from 'react';
import { Loader2, Search } from 'lucide-react';
import { CampaignCard } from './CampaignCard';
import { Input } from '../ui/Input';
import { useContracts } from '../../hooks/useContracts';
import { useWallet } from '../../hooks/useWallet';
import { Campaign, CampaignDetails } from '../../types/contracts';

interface CampaignsListProps {
  onViewDetails: (address: string) => void;
}

export function CampaignsList({ onViewDetails }: CampaignsListProps) {
  const { getAllCampaigns, getCampaignDetails } = useContracts();
  const { isConnected } = useWallet();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignDetails, setCampaignDetails] = useState<Record<string, CampaignDetails>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isConnected) {
      loadCampaigns();
    } else {
      setLoading(false);
    }
  }, [isConnected]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const campaignList = await getAllCampaigns();
      setCampaigns(campaignList);
      
      // Load details for each campaign
      const detailsPromises = campaignList.map(async (campaign) => {
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
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Please connect your wallet to view campaigns.</p>
      </div>
    );
  }

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
        <h2 className="text-2xl font-bold text-gray-900">All Campaigns</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No campaigns found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
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