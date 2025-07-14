import { useState, useEffect } from 'react';
import { Contract, formatEther, parseEther } from 'ethers';
import toast from 'react-hot-toast';
import { useWallet } from './useWallet';
import { 
  CROWDFUNDING_MANAGER_ADDRESS, 
  CROWDFUNDING_MANAGER_ABI, 
  CROWDFUNDING_ABI 
} from '../constants/contracts';
import { Campaign, CampaignDetails, Tier } from '../types/contracts';

export function useContracts() {
  const { signer, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const getManagerContract = () => {
    if (!signer) throw new Error('Wallet not connected');
    return new Contract(CROWDFUNDING_MANAGER_ADDRESS, CROWDFUNDING_MANAGER_ABI, signer);
  };

  const getCampaignContract = (address: string) => {
    if (!signer) throw new Error('Wallet not connected');
    return new Contract(address, CROWDFUNDING_ABI, signer);
  };

  const createCampaign = async (
    name: string,
    description: string,
    goal: string,
    duration: string
  ) => {
    try {
      setIsLoading(true);
      const contract = getManagerContract();
      const goalInWei = parseEther(goal);
      const durationInDays = parseInt(duration);

      const tx = await contract.createCampaign(name, description, goalInWei, durationInDays);
      await tx.wait();
      
      toast.success('Campaign created successfully!');
      return true;
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign: ' + (error.reason || error.message));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllCampaigns = async (): Promise<Campaign[]> => {
    try {
      const contract = getManagerContract();
      const campaigns = await contract.getAllCampaigns();
      return campaigns.map((campaign: any) => ({
        campaignAddress: campaign.campaignAddress,
        owner: campaign.owner,
        name: campaign.name,
        creationTime: campaign.creationTime,
      }));
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch campaigns');
      return [];
    }
  };

  const getUserCampaigns = async (userAddress: string): Promise<Campaign[]> => {
    try {
      const contract = getManagerContract();
      const campaigns = await contract.getUserCampaigns(userAddress);
      return campaigns.map((campaign: any) => ({
        campaignAddress: campaign.campaignAddress,
        owner: campaign.owner,
        name: campaign.name,
        creationTime: campaign.creationTime,
      }));
    } catch (error) {
      console.error('Error fetching user campaigns:', error);
      toast.error('Failed to fetch user campaigns');
      return [];
    }
  };

  const getCampaignDetails = async (address: string): Promise<CampaignDetails | null> => {
    try {
      const contract = getCampaignContract(address);
      
      const [name, description, goal, deadline, owner, balance, tiers] = await Promise.all([
        contract.name(),
        contract.description(),
        contract.goal(),
        contract.deadline(),
        contract.owner(),
        contract.getContractBalance(),
        contract.viewTiers(),
      ]);

      return {
        name,
        description,
        goal,
        deadline,
        owner,
        balance,
        tiers: tiers.map((tier: any) => ({
          name: tier.name,
          amount: tier.amount,
          backers: tier.backers,
        })),
      };
    } catch (error) {
      console.error('Error fetching campaign details:', error);
      toast.error('Failed to fetch campaign details');
      return null;
    }
  };

  const addTier = async (campaignAddress: string, name: string, amount: string) => {
    try {
      setIsLoading(true);
      const contract = getCampaignContract(campaignAddress);
      const amountInWei = parseEther(amount);

      const tx = await contract.addTier(name, amountInWei);
      await tx.wait();
      
      toast.success('Tier added successfully!');
      return true;
    } catch (error: any) {
      console.error('Error adding tier:', error);
      toast.error('Failed to add tier: ' + (error.reason || error.message));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeTier = async (campaignAddress: string, index: number) => {
    try {
      setIsLoading(true);
      const contract = getCampaignContract(campaignAddress);

      const tx = await contract.removeTier(index);
      await tx.wait();
      
      toast.success('Tier removed successfully!');
      return true;
    } catch (error: any) {
      console.error('Error removing tier:', error);
      toast.error('Failed to remove tier: ' + (error.reason || error.message));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const fundCampaign = async (campaignAddress: string, tierIndex: number, amount: bigint) => {
    try {
      setIsLoading(true);
      const contract = getCampaignContract(campaignAddress);

      const tx = await contract.fund(tierIndex, { value: amount });
      await tx.wait();
      
      toast.success('Campaign funded successfully!');
      return true;
    } catch (error: any) {
      console.error('Error funding campaign:', error);
      toast.error('Failed to fund campaign: ' + (error.reason || error.message));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawFunds = async (campaignAddress: string) => {
    try {
      setIsLoading(true);
      const contract = getCampaignContract(campaignAddress);

      const tx = await contract.withdraw();
      await tx.wait();
      
      toast.success('Funds withdrawn successfully!');
      return true;
    } catch (error: any) {
      console.error('Error withdrawing funds:', error);
      toast.error('Failed to withdraw funds: ' + (error.reason || error.message));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createCampaign,
    getAllCampaigns,
    getUserCampaigns,
    getCampaignDetails,
    addTier,
    removeTier,
    fundCampaign,
    withdrawFunds,
  };
}