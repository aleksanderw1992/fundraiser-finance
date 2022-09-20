// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "openzeppelin-contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts/utils/Counters.sol";

///@notice Contract for creating, searching and managing charities
///@author Aleksander Wojcik (aleksander.w1992)
contract CharityFactory {
    ///@notice events emitted after each action
    event Contribute(address indexed contributor, uint256 indexed charityId, Currency currency, uint256 amount);
    event CharityCreated(address indexed creator, uint256 indexed charityId, string description);
    event WithdrawContribution(address indexed contributor, uint256 indexed charityId, uint256 ethWithdrawn, uint256 usdcWithdrawn);
    event CloseCharity(uint256 indexed charityId, CharityStatus result);
    event ReceiveNtf(address indexed contributor, uint256 indexed charityId);
    
    ///@notice constants
    uint private constant CREATION_FEE = 0.01 ether;
    IERC20 private constant USDC_ADDRESS = IERC20(0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48);
    
    ///@notice mappings
    mapping(uint256 => Charity) private charities;
    mapping(address => mapping(uint256 => UserDonation)) private donations;
    mapping(address => mapping(uint256 => bool)) private nftAlreadyReceived;
    
    ///@notice ids for iteration
    uint256[] private charityIds;
    
    ///@notice helpers
    using Counters for Counters.Counter;
    Counters.Counter private _counter;
    
    constructor() {
    
    }
    
    function createCharity(Currency currency, uint256 goal, uint256 endPeriod, string description, address beneficiary) external payable {
        require(goal > 0, "Goal cannot be zero");
        require(block.timestamp < endPeriod, "Charity cannot end in the past");
        require(beneficiary != address(0x0), "Beneficiary cannot be set to address zero");
        require(msg.value >= CREATION_FEE, "You need to pay at least 0.01 ETH for a charity to start");
        // todo require goal to be more than CREATION_FEE

        _counter.increment();
        charities.push(
            Charity({
                id: _counter.current(),
                currency: currency,
                goal: goal,
                endPeriod: endPeriod,
                description: description,
                beneficiary: beneficiary,
                status: CharityStatus.ONGOING,
                ethRaised: msg.value
            }));
        charityIds.push(_counter.current());
        emit CharityCreated(msg.sender, _counter.current(), description);
    }
    
    function donateEth(uint256 charityId) external payable {
        Charity charity = charities[charityId];
        
        require(charity.status == CharityStatus.ONGOING, "Cannot donate to closed charity");
        require(block.timestamp < charity.endPeriod, "Cannot donate to closed charity");
        require(msg.value > 0, "Cannot do zero amount contribution");

        UserDonation currentDonation = donations[msg.sender][charityId];
        if (currentDonation == null) {
            currentDonation = UserDonation({
                ethRaised: msg.value
            });
            donations[msg.sender][charityId] = currentDonation;
        } else {
            currentDonation.ethRaised += msg.value;
        }
        emit Contribute(msg.sender, charityId, Currency.ETH, amount);
    }
    
    function donateUsdc(uint256 charityId, uint256 amount) external {
        Charity charity = charities[charityId];
        
        require(charity.status == CharityStatus.ONGOING, "Cannot donate to closed charity");
        require(block.timestamp < charity.endPeriod, "Cannot donate to closed charity");
        require(amount > 0, "Cannot do zero amount contribution");
    
        USDC_ADDRESS.approve(address(this),  amount);
        USDC_ADDRESS.transferFrom(msg.sender, address(this), amount);
        
        UserDonation currentDonation = donations[msg.sender][charityId];
        if (currentDonation == null) {
            currentDonation = UserDonation({
                usdcRaised: amount
            });
            donations[msg.sender][charityId] = currentDonation;
    
        } else {
            currentDonation.usdcRaised += msg.value;
        }
        emit Contribute(msg.sender, charityId, Currency.USDC, amount);
    }
    
    function withdrawContribution(uint256 charityId) external {
        Charity charity = charities[charityId];
        require(charity.status == CharityStatus.CLOSED_GOAL_NOT_MET,
            "The withdrawal of contribution is possible only for closed charities with goal not being met");
        UserDonation currentDonation = donations[msg.sender][charityId];
        
        // withdraw usdc
//        USDC_ADDRESS.approve(msg.sender, currentDonation.usdcRaised); //?
        USDC_ADDRESS.transferFrom(address(this), msg.sender, currentDonation.usdcRaised);
        
        // withdraw eth
        (bool success,) = payable(msg.sender).call{value: currentDonation.ethRaised}("");
        require(success, "Failed to transfet eth");
        
        donations[msg.sender][charityId] = null; // TODO - how to remove from mapping
        emit WithdrawContribution(msg.sender, charityId, currentDonation.ethRaised, currentDonation.usdcRaised);
    }
    
    function tryCloseCharity(uint256 charityId) external {
        Charity charity = charities[charityId];
        require(charity.status == CharityStatus.ONGOING, "Cannot close already closed charity");
        require(block.timestamp >= charity.endPeriod, "Cannot close charity until end period pass");

        bool goalMet = true;
        // todo - use the following variables and oracle to evaluate if goal is met:
//        charity.ethRaised
//        charity.usdcRaised
        
        if(goalMet) {
            charity.status = CharityStatus.CLOSED_GOAL_MET;
            // transfer to beneficiary
            // usdc
//            USDC_ADDRESS.approve(address(this),  currentDonation.usdcRaised); // ?
            USDC_ADDRESS.transferFrom(address(this), charity.beneficiary, charity.usdcRaised);
    
            // eth
            (bool success,) = payable(charity.beneficiary).call{value: charity.ethRaised}("");
            require(success, "Failed to transfet eth");
        } else {
            charity.status = CharityStatus.CLOSED_GOAL_NOT_MET;
        }
        emit CloseCharity(charityId, charity.status);
    }
    
    function receiveNtf(uint256 charityId) external {
        require(charity.status == CharityStatus.CLOSED_GOAL_MET, "Nft reception is possible only for closed charities with goal met");
        require(!nftAlreadyReceived[msg.sender][charityId], "Nft already received for user");
        UserDonation userDonation = donations[msg.sender][charityId];
        if(userDonation.ethRaised >0 || userDonation.usdcRaised > 0) {
            Badge.mint(msg.sender, charityId, userDonation.ethRaised, userDonation.usdcRaised);
            nftAlreadyReceived[msg.sender][charityId] = true;
        }
        donations[msg.sender][charityId] = null; // TODO - how to remove from mapping
        emit ReceiveNtf(msg.sender, charityId);
    }
    
    function findCharities(FilterParams params) external returns(Charity[]) {
        Charity[] result = new Charity[];
        if (charityIds.length == 0 ) {
            return result;
        }
        for(uint256 i=0; i<charityIds.length; i++) {
            Charity temp = charities[charityIds[i]];
            bool statusOk = temp.status == params.status;
            bool userContributedOk = params.msgSenderContributedTrue? donations[msg.sender][temp.id] !=null: true;
            if (statusOk && userContributedOk) {
                result.push(temp);
            }
        }
        return result;
    }
}

enum Currency {
    USDC, ETH;
}

enum CharityStatus {
    ONGOING, CLOSED_GOAL_MET, CLOSED_GOAL_NOT_MET;
}

struct Charity {
    uint256 id;
    Currency currency;
    uint256 goal;
    uint256 endPeriod;
    string description;
    address beneficiary;
    CharityStatus status;
    uint256 ethRaised;
    uint256 usdcRaised;
}

struct UserDonation {
    uint256 ethRaised;
    uint256 usdcRaised;
}

struct FilterParams {
    CharityStatus status;
    bool msgSenderContributedTrue;
}


