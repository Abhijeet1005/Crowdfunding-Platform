// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract CrowdFunding {
    string public name;
    string public description;
    uint256 public goal;
    uint256 public deadline;
    address public owner;

    struct Tier{
        string name;
        uint256 amount;
        uint256 backers;
    }

    Tier[] public tiers;

    modifier onlyOwner(){
        require(msg.sender == owner,"Only owner is allowed to perform this action");
        _;
    }

    constructor(
        string memory _name,
        string memory _description,
        uint256 _goal,
        uint256 _durationInDays
    ){
        name = _name;
        description = _description;
        goal = _goal;
        deadline = block.timestamp + (_durationInDays * 1 days);
        owner = msg.sender;
    }

    function addTier(
        string memory _name,
        uint256 _amount
    ) public onlyOwner {
        require(_amount > 0, "Amount for the tier should be greater than 0");
        tiers.push(Tier(_name, _amount, 0));
    }

    function removeTier(
        uint256 _index
    ) public onlyOwner {
        require(_index < tiers.length, "Tier doesn't exist");
        tiers[_index] = tiers[tiers.length-1];
        tiers.pop();
    }

    function viewTiers(
    ) public view returns(Tier[] memory) {
        return tiers;
    }

    function fund(uint256 _tierIndex) public payable {
        require(block.timestamp < deadline, "Campaign has ended");

        require(_tierIndex < tiers.length, "Invalid tier");
        require(msg.value == tiers[_tierIndex].amount, "Invalid amount for the tier");

        tiers[_tierIndex].backers++;
    }

    function withdraw() public onlyOwner {
        require(address(this).balance >= goal,"Goal is not completed");

        uint256 balance = address(this).balance;
        require(balance > 0, "Balance insufficient to withdraw");

        payable(owner).transfer(balance);
    }

    function getContractBalance() public view returns (uint256){
        return address(this).balance;
    }
}
