// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "openzeppelin-contracts/token/ERC20/IERC20.sol";
import "chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./Badge.sol";

///@notice Contract for creating, searching and managing charities
///@author Aleksander Wojcik (aleksander.w1992)
contract CharityFactory {
    
    enum Currency {
        USDC, ETH
    }

    enum CharityStatus {
        ONGOING, CLOSED_GOAL_MET, CLOSED_GOAL_NOT_MET
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
    
    ///@notice events emitted after each action
    event Contribute(address indexed contributor, uint256 indexed charityId, Currency currency, uint256 amount);
    event CharityCreated(address indexed creator, uint256 indexed charityId, string description);
    event WithdrawContribution(address indexed contributor, uint256 indexed charityId, uint256 ethWithdrawn, uint256 usdcWithdrawn);
    event CloseCharity(uint256 indexed charityId, CharityStatus result);
    event ReceiveNtf(address indexed contributor, uint256 indexed charityId);
    
    ///@notice declaring chainlink's price aggregator
    AggregatorV3Interface internal priceFeed;
    
    ///@notice constants
    uint private constant CREATION_FEE = 0.01 ether;
    IERC20 private immutable USDC_ADDRESS;
    
    ///@notice list of all charities
    Charity[] public charities;
    ///@notice mappings
    mapping(address => mapping(uint256 => UserDonation)) private donations;
    mapping(address => mapping(uint256 => bool)) private nftAlreadyReceived;
    
    ///@notice nft contribution badge
    Badge badge = new Badge(address(this));
    
    ///@notice passing usdc address for testing purpose
    constructor(address _usdcAddress) {
        USDC_ADDRESS = IERC20(_usdcAddress);
//        IERC20 private constant USDC_ADDRESS = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);

    }
    
    function createCharity(Currency currency, uint256 goal, uint256 endPeriod, string memory description, address beneficiary) external payable {
        require(goal > 0, "Goal cannot be zero");
        require(block.timestamp < endPeriod, "Charity cannot end in the past");
        require(beneficiary != address(0x0), "Beneficiary cannot be set to address zero");
        require(msg.value >= CREATION_FEE, "You need to pay at least 0.01 ETH for a charity to start");
        uint256 ethPrice = getEthPrice();
        uint256 goalInUsdcInTimeOfCreation = currency == Currency.USDC? goal: goal * ethPrice;
        require(ethPrice * msg.value < goalInUsdcInTimeOfCreation, "Cannot create a charity with too low goal");

        uint256 newCharityId = charities.length;
        charities.push(
            Charity({
                id: newCharityId,
                currency: currency,
                goal: goal,
                endPeriod: endPeriod,
                description: description,
                beneficiary: beneficiary,
                status: CharityStatus.ONGOING,
                ethRaised: msg.value,
                usdcRaised: 0
            }));
        emit CharityCreated(msg.sender, newCharityId, description);
    }
    
    function donateEth(uint256 charityId) external payable {
        Charity memory charity = charities[charityId];
        
        require(charity.status == CharityStatus.ONGOING, "Cannot donate to closed charity");
        require(block.timestamp < charity.endPeriod, "Cannot donate to closed charity");
        require(msg.value > 0, "Cannot do zero amount contribution");

        UserDonation memory currentDonation = donations[msg.sender][charityId];
        // solidity does not support null structs
        if (currentDonation.ethRaised == 0 && currentDonation.usdcRaised == 0 ) {
            currentDonation = UserDonation({
                ethRaised: msg.value,
                usdcRaised: 0
            });
            donations[msg.sender][charityId] = currentDonation;
        } else {
            currentDonation.ethRaised += msg.value;
        }
        emit Contribute(msg.sender, charityId, Currency.ETH, msg.value);
    }
    
    function donateUsdc(uint256 charityId, uint256 amount) external {
        Charity memory charity = charities[charityId];
        
        require(charity.status == CharityStatus.ONGOING, "Cannot donate to closed charity");
        require(block.timestamp < charity.endPeriod, "Cannot donate to closed charity");
        require(amount > 0, "Cannot do zero amount contribution");
    
        USDC_ADDRESS.approve(address(this),  amount);
        USDC_ADDRESS.transferFrom(msg.sender, address(this), amount);
        
        UserDonation memory currentDonation = donations[msg.sender][charityId];
        // solidity does not support null structs
        if (currentDonation.ethRaised == 0 && currentDonation.usdcRaised == 0) {
            currentDonation = UserDonation({
                usdcRaised: amount,
                ethRaised: 0
            });
            donations[msg.sender][charityId] = currentDonation;
    
        } else {
            currentDonation.usdcRaised += amount;
        }
        emit Contribute(msg.sender, charityId, Currency.USDC, amount);
    }
    
    function withdrawContribution(uint256 charityId) external {
        Charity memory charity = charities[charityId];
        require(charity.status == CharityStatus.CLOSED_GOAL_NOT_MET,
            "The withdrawal of contribution is possible only for closed charities with goal not being met");
        UserDonation memory currentDonation = donations[msg.sender][charityId];
        
        // withdraw usdc
//        USDC_ADDRESS.approve(msg.sender, currentDonation.usdcRaised); //?
        USDC_ADDRESS.transferFrom(address(this), msg.sender, currentDonation.usdcRaised);
        
        // withdraw eth
        (bool success,) = payable(msg.sender).call{value: currentDonation.ethRaised}("");
        require(success, "Failed to transfer eth");
    
        
        donations[msg.sender][charityId] = UserDonation({
                ethRaised: 0,
                usdcRaised: 0
            });
        emit WithdrawContribution(msg.sender, charityId, currentDonation.ethRaised, currentDonation.usdcRaised);
    }
    
    function tryCloseCharity(uint256 charityId) external {
        Charity memory charity = charities[charityId];
        require(charity.status == CharityStatus.ONGOING, "Cannot close already closed charity");
        require(block.timestamp >= charity.endPeriod, "Cannot close charity until end period pass");
    
        uint256 ethPrice = getEthPrice();
        uint256 goalInUsdc = charity.currency == Currency.USDC? charity.goal: charity.goal * ethPrice;
        uint256 fundsRaised = charity.usdcRaised + charity.ethRaised * ethPrice;
        bool goalMet = goalInUsdc <= fundsRaised;
        
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
        Charity memory charity = charities[charityId];
        require(charity.status == CharityStatus.CLOSED_GOAL_MET, "Nft reception is possible only for closed charities with goal met");
        require(!nftAlreadyReceived[msg.sender][charityId], "Nft already received for user");
        UserDonation memory userDonation = donations[msg.sender][charityId];
        if(userDonation.ethRaised >0 || userDonation.usdcRaised > 0) {
            badge.mint(msg.sender, charityId, userDonation.ethRaised, userDonation.usdcRaised);
            nftAlreadyReceived[msg.sender][charityId] = true;
        }
        // solidity does not support null structs
        donations[msg.sender][charityId] = UserDonation({
                ethRaised: 0,
                usdcRaised: 0
            });
        emit ReceiveNtf(msg.sender, charityId);
    }
    
    ///@notice Get latest price of ETH in USDC. Note - assuming 1 USD = 1 USDC which might not always be the case
    ///@return ethPrice price of ETH in USDC
    function getEthPrice() private view returns(uint256 ethPrice){
        (,int256 price,,,) = priceFeed.latestRoundData();
        ethPrice = uint256(int256(price) / 10**8);
    }
}



