import { useState } from 'react';
import { Contract, parseEther } from 'ethers';
import toast from 'react-hot-toast';
import { useWallet } from './useWallet';
import { 
  CROWDFUNDING_MANAGER_ADDRESS, 
  CROWDFUNDING_MANAGER_ABI, 
  CROWDFUNDING_ABI 
} from '../constants/contracts';
import { Campaign, CampaignDetails } from '../types/contracts';

export function useContracts() {
  const { signer } = useWallet();
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
    } catch (error: unknown) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign: ' + ((error as { reason?: string; message?: string })?.reason || (error as { message?: string })?.message));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllCampaigns = async (): Promise<Campaign[]> => {
    try {
      const contract = getManagerContract();
      const campaigns = await contract.getAllCampaigns();
      return campaigns.map((campaign: unknown) => {
        const c = campaign as { campaignAddress: string; owner: string; name: string; creationTime: string };
        return {
          campaignAddress: c.campaignAddress,
          owner: c.owner,
          name: c.name,
          creationTime: c.creationTime,
        };
      });
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
      return campaigns.map((campaign: unknown) => {
        const c = campaign as { campaignAddress: string; owner: string; name: string; creationTime: string };
        return {
          campaignAddress: c.campaignAddress,
          owner: c.owner,
          name: c.name,
          creationTime: c.creationTime,
        };
      });
    } catch (error) {
      console.error('Error fetching user campaigns:', error);
      toast.error('Failed to fetch user campaigns');
      return [];
    }
  };

  const getCampaignDetails = async (address: string): Promise<CampaignDetails | null> => {
    try {
      const contract = getCampaignContract(address);
      const [name, description, goal, deadline, owner, balance, tiers, state] = await Promise.all([
        contract.name(),
        contract.description(),
        contract.goal(),
        contract.deadline(),
        contract.owner(),
        contract.getContractBalance(),
        contract.getTiers(),
        contract.getCampaignStatus(),
      ]);

      return {
        name,
        description,
        goal,
        deadline,
        owner,
        balance,
        state: Number(state),
        tiers: (tiers as unknown[]).map((tier: unknown) => {
          const t = tier as { name: string; amount: string; backers: string };
          return {
            name: t.name,
            amount: BigInt(t.amount),
            backers: BigInt(t.backers),
          };
        }),
      };
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.error('Error adding tier:', error);
      toast.error('Failed to add tier: ' + ((error as { reason?: string; message?: string })?.reason || (error as { message?: string })?.message));
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
    } catch (error: unknown) {
      console.error('Error removing tier:', error);
      toast.error('Failed to remove tier: ' + ((error as { reason?: string; message?: string })?.reason || (error as { message?: string })?.message));
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
    } catch (error: unknown) {
      console.error('Error funding campaign:', error);
      toast.error('Failed to fund campaign: ' + ((error as { reason?: string; message?: string })?.reason || (error as { message?: string })?.message));
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
    } catch (error: unknown) {
      console.error('Error withdrawing funds:', error);
      toast.error('Failed to withdraw funds: ' + ((error as { reason?: string; message?: string })?.reason || (error as { message?: string })?.message));
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