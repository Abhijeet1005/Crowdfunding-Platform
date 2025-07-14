import React from 'react';
import { formatEther } from 'ethers';
import { Calendar, Target, User, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { BorderBeam } from '../magicui/border-beam';
import NumberTicker from '../magicui/number-ticker';
import { Campaign, CampaignDetails } from '../../types/contracts';

interface CampaignCardProps {
  campaign: Campaign;
  details?: CampaignDetails;
  onViewDetails: (address: string) => void;
}

export function CampaignCard({ campaign, details, onViewDetails }: CampaignCardProps) {
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const getProgressPercentage = () => {
    if (!details) return 0;
    const progress = (Number(details.balance) / Number(details.goal)) * 100;
    return Math.min(progress, 100);
  };

  const isActive = () => {
    if (!details) return true;
    return Number(details.deadline) * 1000 > Date.now();
  };

  return (
    <Card className="relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
      <BorderBeam size={250} duration={12} delay={0} />
      
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-gray-900">{campaign.name}</CardTitle>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <User className="w-4 h-4" />
              <span>{campaign.owner.slice(0, 6)}...{campaign.owner.slice(-4)}</span>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive() 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isActive() ? 'Active' : 'Ended'}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {details && (
          <>
            <p className="text-gray-600 text-sm line-clamp-2">{details.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1 text-gray-500">
                  <TrendingUp className="w-4 h-4" />
                  <span>Progress</span>
                </div>
                <span className="font-medium">
                  <NumberTicker value={getProgressPercentage()} decimalPlaces={1} />%
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Target className="w-4 h-4" />
                    <span>Goal</span>
                  </div>
                  <p className="font-medium">
                    <NumberTicker value={parseFloat(formatEther(details.goal))} decimalPlaces={2} /> ETH
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <TrendingUp className="w-4 h-4" />
                    <span>Raised</span>
                  </div>
                  <p className="font-medium">
                    <NumberTicker value={parseFloat(formatEther(details.balance))} decimalPlaces={2} /> ETH
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Ends: {formatDate(details.deadline)}</span>
              </div>
            </div>
          </>
        )}

        <Button 
          onClick={() => onViewDetails(campaign.campaignAddress)}
          className="w-full"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}