// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/CharityFactory.sol";
import "./mock/MockERC20.sol";
import "chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol";

contract CharityFactoryTest is Test {
    ///@notice foundry requires events to be copied to test contract; might change after framework improvement
    event CloseCharity(uint256 indexed charityId, CharityFactory.CharityStatus result);
    
    
    
    CharityFactory contractUnderTests;
    uint256 ETH_MIN_PRICE = 0.01 ether;
    uint256 ETH_NOT_SUFFICIENT_PRICE = 0.009 ether;
    address deployer = address(0x1223);
    address anotherAddress = address(0x18893);
    address contributorAddress = address(0x188931);
    address beneficiary = address(0x1889311);
    MockERC20 musdc = new MockERC20();
    uint256 creationTimestamp = 1000000;
    uint256 charityDefaultEndTimestamp = creationTimestamp + 1000;
    // 1 eth = 2000 USDC
    MockV3Aggregator mockChainlinkAggregator = new MockV3Aggregator(8, 2000*(10**8));
    
    function setUp() public {
        vm.deal(contributorAddress, 10.02 ether);
        musdc.mint(contributorAddress, 20000);
        vm.startPrank(deployer);
        contractUnderTests = new CharityFactory(address(musdc), address(mockChainlinkAggregator));
        vm.stopPrank();
        vm.warp(creationTimestamp);
    }

    // goal is either 10 ETH (0.01 already raised) or 20 000 USDC (20 USDC already raised)
    function createDefaultCharityTenEthGoal() public returns(uint256){
        return contractUnderTests.createCharity{value : ETH_MIN_PRICE}
        (CharityFactory.Currency.ETH, 10, charityDefaultEndTimestamp, "successful fundraising", beneficiary);
    }
    
    function testCreateCharitySuccess() public {
        createDefaultCharityTenEthGoal();
    }
    
    function testCreateCharityFailTooLessEthFee() public {
        vm.expectRevert("You need to pay at least 0.01 ETH for a charity to start");
        contractUnderTests.createCharity{value : ETH_NOT_SUFFICIENT_PRICE}
        (CharityFactory.Currency.ETH, 10, charityDefaultEndTimestamp, "successful fundraising", beneficiary);
    }
    
    function testCreateCharityFailBeneficiaryZeroAddress() public {
        vm.expectRevert("Beneficiary cannot be set to address zero");
        contractUnderTests.createCharity{value : ETH_MIN_PRICE}
        (CharityFactory.Currency.ETH, 10, charityDefaultEndTimestamp, "successful fundraising", address(0x0));
    }
    
    function testCreateCharityFailGoalZero() public {
        vm.expectRevert("Goal cannot be zero");
        contractUnderTests.createCharity{value : ETH_MIN_PRICE}
        (CharityFactory.Currency.ETH, 0, charityDefaultEndTimestamp, "successful fundraising", beneficiary);
    }
    
    function testCreateCharityFailEndDateInPast() public {
        vm.expectRevert("Charity cannot end in the past");
        contractUnderTests.createCharity{value : ETH_MIN_PRICE}
        (CharityFactory.Currency.ETH, 10, creationTimestamp - 1000, "successful fundraising", beneficiary);
    }
    
    function testCreateCharityFailGoalTooLowInUSDC() public {
        vm.expectRevert("Cannot create a charity with too low goal");
        contractUnderTests.createCharity{value : ETH_MIN_PRICE}
        (CharityFactory.Currency.USDC, 1, charityDefaultEndTimestamp, "successful fundraising", beneficiary);
    }
    
    function testDonateEthAndCloseCharityWithGoalMet() public {
        vm.startPrank(contributorAddress);
        uint256 charityId = createDefaultCharityTenEthGoal();
        contractUnderTests.donateEth{value: 10 ether}(charityId);
        vm.warp(charityDefaultEndTimestamp);
        vm.expectEmit(true, true, false, false);
        emit CloseCharity(charityId, CharityFactory.CharityStatus.CLOSED_GOAL_MET);
        
        assertEq(contributorAddress.balance, 0.01 ether);
        assertEq(musdc.balanceOf(contributorAddress), 20000);
        
        contractUnderTests.tryCloseCharity(charityId);
        (,,,,,,CharityFactory.CharityStatus status, uint256 memory ethRaised, uint256 memory usdcRaised) = contractUnderTests.charities(charityId);
        assertTrue(status == CharityFactory.CharityStatus.CLOSED_GOAL_MET);

        console.log("status: %s", uint8(status));
        vm.stopPrank();
    }
    
    function testDonateUsdcAndCloseCharityWithGoalMet() public {
        vm.startPrank(contributorAddress);
        uint256 charityId = createDefaultCharityTenEthGoal();
        musdc.approve(address(contractUnderTests), 20000);
        contractUnderTests.donateUsdc(charityId, 20000);

        assertEq(contributorAddress.balance, 10.01 ether);
        assertEq(musdc.balanceOf(contributorAddress), 0);
    
        vm.warp(charityDefaultEndTimestamp);
        vm.expectEmit(true, true, false, false);
        emit CloseCharity(charityId, CharityFactory.CharityStatus.CLOSED_GOAL_MET);
        contractUnderTests.tryCloseCharity(charityId);
        vm.stopPrank();
    }
    
    function testDonateAndCloseCharityWithGoalMetAndReceiveNft() public {
    }
    
    function testDonateAndCloseCharityWithGoalNotMetAndWithdrawContribution() public {
        vm.startPrank(contributorAddress);
        uint256 charityId = createDefaultCharityTenEthGoal();
        contractUnderTests.donateEth{value: 5 ether}(charityId);
        musdc.approve(address(contractUnderTests), 200);
        contractUnderTests.donateUsdc(charityId, 200);

        assertEq(contributorAddress.balance, 5.01 ether);
        assertEq(musdc.balanceOf(contributorAddress), 19800);
        
        vm.warp(charityDefaultEndTimestamp);
        vm.expectEmit(true, true, false, false);
        emit CloseCharity(charityId, CharityFactory.CharityStatus.CLOSED_GOAL_NOT_MET);
        contractUnderTests.tryCloseCharity(charityId);
//        contractUnderTests.withdrawContribution(charityId);
    
//        assertEq(contributorAddress.balance, 10.01 ether);
//        assertEq(musdc.balanceOf(contributorAddress), 20000);
        
        vm.stopPrank();
    }
    
}
