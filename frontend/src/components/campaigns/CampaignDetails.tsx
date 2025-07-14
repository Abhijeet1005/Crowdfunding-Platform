import React, { useState, useEffect } from 'react';
import { formatEther } from 'ethers';
import { ArrowLeft, Calendar, Target, User, TrendingUp, Plus, Trash2, Wallet } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useContracts } from '../../hooks/useContracts';
import { useWallet } from '../../hooks/useWallet';
import { CampaignDetails as CampaignDetailsType, Tier } from '../../types/contracts';

interface CampaignDetailsProps {
  campaignAddress: string;
  onBack: () => void;
}

export function CampaignDetails({ campaignAddress, onBack }: CampaignDetailsProps) {
  const { getCampaignDetails, addTier, removeTier, fundCampaign, withdrawFunds, isLoading } = useContracts();
  const { address } = useWallet();
  const [details, setDetails] = useState<CampaignDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTier, setNewTier] = useState({ name: '', amount: '' });
  const [showAddTier, setShowAddTier] = useState(false);

  useEffect(() => {
    loadCampaignDetails();
  }, [campaignAddress]);

  const loadCampaignDetails = async () => {
    try {
      setLoading(true);
      const campaignDetails = await getCampaignDetails(campaignAddress);
      setDetails(campaignDetails);
    } catch (error) {
      console.error('Error loading campaign details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTier = async () => {
    if (!newTier.name.trim() || !newTier.amount || parseFloat(newTier.amount) <= 0) return;

    const success = await addTier(campaignAddress, newTier.name, newTier.amount);
    if (success) {
      setNewTier({ name: '', amount: '' });
      setShowAddTier(false);
      loadCampaignDetails();
    }
  };

  const handleRemoveTier = async (index: number) => {
    const success = await removeTier(campaignAddress, index);
    if (success) {
      loadCampaignDetails();
    }
  };

  const handleFund = async (tierIndex: number, amount: bigint) => {
    const success = await fundCampaign(campaignAddress, tierIndex, amount);
    if (success) {
      loadCampaignDetails();
    }
  };

  const handleWithdraw = async () => {
    const success = await withdrawFunds(campaignAddress);
    if (success) {
      loadCampaignDetails();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Campaign not found</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const isOwner = address?.toLowerCase() === details.owner.toLowerCase();
  const progressPercentage = (Number(details.balance) / Number(details.goal)) * 100;
  const isActive = Number(details.deadline) * 1000 > Date.now();
  const canWithdraw = Number(details.balance) >= Number(details.goal);

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        onClick={onBack}
        variant="ghost"
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campaigns</span>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{details.name}</h1>
                  <div className="flex items-center space-x-1 text-gray-500 mt-2">
                    <User className="w-4 h-4" />
                    <span>by {details.owner.slice(0, 6)}...{details.owner.slice(-4)}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {isActive ? 'Active' : 'Ended'}
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">{details.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium">Progress</span>
                  <span className="text-lg font-bold">{progressPercentage.toFixed(1)}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Raised</span>
                    </div>
                    <p className="text-xl font-bold">{formatEther(details.balance)} ETH</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">Goal</span>
                    </div>
                    <p className="text-xl font-bold">{formatEther(details.goal)} ETH</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-gray-500 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Deadline</span>
                    </div>
                    <p className="text-sm font-medium">{formatDate(details.deadline)}</p>
                  </div>
                </div>
              </div>

              {isOwner && canWithdraw && (
                <Button
                  onClick={handleWithdraw}
                  isLoading={isLoading}
                  variant="secondary"
                  className="w-full"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Withdraw Funds
                </Button>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Funding Tiers</h3>
              {isOwner && (
                <Button
                  onClick={() => setShowAddTier(!showAddTier)}
                  variant="ghost"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>

            {showAddTier && (
              <div className="space-y-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <Input
                  placeholder="Tier name"
                  value={newTier.name}
                  onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Amount (ETH)"
                  value={newTier.amount}
                  onChange={(e) => setNewTier({ ...newTier, amount: e.target.value })}
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleAddTier}
                    isLoading={isLoading}
                    size="sm"
                    className="flex-1"
                  >
                    Add Tier
                  </Button>
                  <Button
                    onClick={() => setShowAddTier(false)}
                    variant="ghost"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {details.tiers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tiers available</p>
              ) : (
                details.tiers.map((tier, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{tier.name}</h4>
                        <p className="text-lg font-bold text-blue-600">{formatEther(tier.amount)} ETH</p>
                        <p className="text-sm text-gray-500">{Number(tier.backers)} backers</p>
                      </div>
                      {isOwner && (
                        <Button
                          onClick={() => handleRemoveTier(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    {!isOwner && isActive && (
                      <Button
                        onClick={() => handleFund(index, tier.amount)}
                        isLoading={isLoading}
                        size="sm"
                        className="w-full"
                      >
                        Fund This Tier
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}