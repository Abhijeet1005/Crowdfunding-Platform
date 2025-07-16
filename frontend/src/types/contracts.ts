export interface Tier {
  name: string;
  amount: bigint;
  backers: bigint;
}

export interface Campaign {
  campaignAddress: string;
  owner: string;
  name: string;
  creationTime: bigint;
}

export interface CampaignDetails {
  name: string;
  description: string;
  goal: bigint;
  deadline: bigint;
  owner: string;
  balance: bigint;
  state: number;
  tiers: Tier[];
}

export interface CreateCampaignForm {
  name: string;
  description: string;
  goal: string;
  duration: string;
}

export interface TierForm {
  name: string;
  amount: string;
}