// IMPORTANT: Replace these with your actual deployed contract addresses
export const CROWDFUNDING_MANAGER_ADDRESS = "0x5Ff84Bf37f2057280C233F77b8b0aCe29D2dA876"; // Replace with actual address
export const SEPOLIA_CHAIN_ID = 11155111;

export const CROWDFUNDING_MANAGER_ABI = [
  "function createCampaign(string memory _name, string memory _description, uint256 _goal, uint256 _durationInDays) external",
  "function getUserCampaigns(address _user) external view returns (tuple(address campaignAddress, address owner, string name, uint256 creationTime)[] memory)",
  "function getAllCampaigns() external view returns (tuple(address campaignAddress, address owner, string name, uint256 creationTime)[] memory)",
  "function togglePause() external",
  "function paused() public view returns (bool)"
];

export const CROWDFUNDING_ABI = [
  "function name() public view returns (string memory)",
  "function description() public view returns (string memory)",
  "function goal() public view returns (uint256)",
  "function deadline() public view returns (uint256)",
  "function owner() public view returns (address)",
  "function addTier(string memory _name, uint256 _amount) public",
  "function removeTier(uint256 _index) public",
  "function viewTiers() public view returns (tuple(string name, uint256 amount, uint256 backers)[] memory)",
  "function fund(uint256 _tierIndex) public payable",
  "function withdraw() public",
  "function getContractBalance() public view returns (uint256)"
];