// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/CharityFactory.sol";
import "./mock/MockERC20.sol";
import "chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol";

contract CharityFactoryTest is Test {
    CharityFactory contractUnderTests;
    Badge badge;
    uint256 constant ETH_MIN_PRICE = 0.01 ether;
    uint256 constant ETH_NOT_SUFFICIENT_PRICE = 0.009 ether;
    uint256 constant CREATION_TIMESTAMP = 10e6;
    uint256 constant CHARITY_DEFAULT_END_TIMESTAMP = CREATION_TIMESTAMP + 1000;
    address deployer = address(0x1223);
    address anotherAddress = address(0x18893);
    address contributorAddress = address(0x188931);
    address beneficiary = address(0x1889311);
    MockERC20 musdc = new MockERC20();
    // 1 eth = 2000 USDC
    MockV3Aggregator mockChainlinkAggregator = new MockV3Aggregator(8, 2000*(10**8));
    
    function setUp() public {
        vm.deal(contributorAddress, 10.02 ether);
        musdc.mint(contributorAddress, 20000);
        vm.startPrank(deployer);
        contractUnderTests = new CharityFactory(address(musdc), address(mockChainlinkAggregator));
        badge = contractUnderTests.badge();
        vm.stopPrank();
        vm.warp(CREATION_TIMESTAMP);
    }

    // goal is either 10 ETH (0.01 already raised) or 20 000 USDC (20 USDC already raised)
    function createDefaultCharityTenEthGoal() public returns(uint256) {
        vm.warp(CREATION_TIMESTAMP);
        return contractUnderTests.createCharity{value : ETH_MIN_PRICE}
        (CharityFactory.Currency.ETH, 10, CHARITY_DEFAULT_END_TIMESTAMP, "successful fundraising", beneficiary);
    }
    
    function testCreateCharitySuccess() public {
        createDefaultCharityTenEthGoal();
    }
    
    function testCreateCharityFailTooLessEthFee() public {
        vm.expectRevert("You need to pay at least 0.01 ETH for a charity to start");
        contractUnderTests.createCharity{value : ETH_NOT_SUFFICIENT_PRICE}
        (CharityFactory.Currency.ETH, 10, CHARITY_DEFAULT_END_TIMESTAMP, "successful fundraising", beneficiary);
    }
    
    function testCreateCharityFailBeneficiaryZeroAddress() public {
        vm.expectRevert("Beneficiary cannot be set to address zero");
        contractUnderTests.createCharity{value : ETH_MIN_PRICE}
        (CharityFactory.Currency.ETH, 10, CHARITY_DEFAULT_END_TIMESTAMP, "successful fundraising", address(0x0));
    }
    
    function testCreateCharityFailGoalZero() public {
        vm.expectRevert("Goal cannot be zero");
        contractUnderTests.createCharity{value : ETH_MIN_PRICE}
        (CharityFactory.Currency.ETH, 0, CHARITY_DEFAULT_END_TIMESTAMP, "successful fundraising", beneficiary);
    }
    
    function testCreateCharityFailEndDateInPast() public {
        vm.expectRevert("Charity cannot end in the past");
        contractUnderTests.createCharity{value : ETH_MIN_PRICE}
        (CharityFactory.Currency.ETH, 10, CREATION_TIMESTAMP - 1000, "successful fundraising", beneficiary);
    }
    
    function testCreateCharityFailGoalTooLowInUsdc() public {
        vm.expectRevert("Cannot create a charity with too low goal");
        contractUnderTests.createCharity{value : ETH_MIN_PRICE}
        (CharityFactory.Currency.USDC, 1, CHARITY_DEFAULT_END_TIMESTAMP, "successful fundraising", beneficiary);
    }
    
    function testCannotDonateAfterTimePass() public {
        vm.startPrank(contributorAddress);
        uint256 charityId = createDefaultCharityTenEthGoal();
        vm.warp(CHARITY_DEFAULT_END_TIMESTAMP);
        vm.expectRevert("Cannot donate to closed charity");
        contractUnderTests.donateEth{value: 10 ether}(charityId);
        vm.stopPrank();
    }
    
    
    function createAndCloseCharityGoalMet() public returns(uint256 charityId) {
        vm.startPrank(contributorAddress);
        charityId = createDefaultCharityTenEthGoal();
        contractUnderTests.donateEth{value: 10 ether}(charityId);
        vm.warp(CHARITY_DEFAULT_END_TIMESTAMP);
        contractUnderTests.tryCloseCharity(charityId);
        vm.stopPrank();
    }
    
    function createAndCloseCharityGoalNotMet() public returns(uint256 charityId) {
        vm.startPrank(contributorAddress);
        charityId = createDefaultCharityTenEthGoal();
        contractUnderTests.donateEth{value: 1 ether}(charityId);
        vm.warp(CHARITY_DEFAULT_END_TIMESTAMP);
        contractUnderTests.tryCloseCharity(charityId);
        vm.stopPrank();
    }
    
    function testCreateAndCloseCharityGoalMet() public {
        uint256 charityId = createAndCloseCharityGoalMet();
        (,,,,,,CharityFactory.CharityStatus status,,) = contractUnderTests.charities(charityId);
        assertTrue(status == CharityFactory.CharityStatus.CLOSED_GOAL_MET);
    }
    
    function testCreateAndCloseCharityGoalNotMet() public {
        uint256 charityId = createAndCloseCharityGoalNotMet();
        vm.startPrank(contributorAddress);
        vm.expectRevert("Cannot donate to closed charity");
        contractUnderTests.donateEth{value: 1 ether}(charityId);
        vm.stopPrank();
    }
    
    function testCannotDonateToClosedCharity() public {
        uint256 charityId = createAndCloseCharityGoalNotMet();
        (,,,,,,CharityFactory.CharityStatus status,,) = contractUnderTests.charities(charityId);
        assertTrue(status == CharityFactory.CharityStatus.CLOSED_GOAL_NOT_MET);
    }
    
    function testDonateEthAndCheckEthRaisedValues() public {
        vm.startPrank(contributorAddress);
        uint256 charityId = createDefaultCharityTenEthGoal();
        (,,,,,,CharityFactory.CharityStatus status, uint256 ethRaised, uint256 usdcRaised) = contractUnderTests.charities(charityId);
        assertTrue(status == CharityFactory.CharityStatus.ONGOING);
        assertEq(ethRaised, 0.01 ether);
        assertEq(usdcRaised, 0);
    
        contractUnderTests.donateEth{value: 10 ether}(charityId);
    
        (,,,,,,, uint256 ethRaisedAfterChange, uint256 usdcRaisedAfterChange) = contractUnderTests.charities(charityId);
        console.log("ethRaisedAfterChange: %s", ethRaisedAfterChange);
        console.log("usdcRaisedAfterChange: %s", usdcRaisedAfterChange);

        assertEq(ethRaisedAfterChange, 10.01 ether);
        assertEq(usdcRaisedAfterChange, 0);
        vm.stopPrank();
    }
    
    function testDonateUsdcAndCheckUsdcRaisedValues() public {
        vm.startPrank(contributorAddress);
        uint256 charityId = createDefaultCharityTenEthGoal();
        (,,,,,,CharityFactory.CharityStatus status, uint256 ethRaised, uint256 usdcRaised) = contractUnderTests.charities(charityId);
        assertTrue(status == CharityFactory.CharityStatus.ONGOING);
        assertEq(ethRaised, 0.01 ether);
        assertEq(usdcRaised, 0);
    
        musdc.approve(address(contractUnderTests), 20000);
        contractUnderTests.donateUsdc(charityId, 20000);
    
        (,,,,,,, uint256 ethRaisedAfterChange, uint256 usdcRaisedAfterChange) = contractUnderTests.charities(charityId);
        console.log("ethRaisedAfterChange: %s", ethRaisedAfterChange);
        console.log("usdcRaisedAfterChange: %s", usdcRaisedAfterChange);

        assertEq(ethRaisedAfterChange, 0.01 ether);
        assertEq(usdcRaisedAfterChange, 20000);
        vm.stopPrank();
    }
    
    function testDonateEthAndCloseCharityWithGoalMet() public {
        vm.startPrank(contributorAddress);
        uint256 charityId = createDefaultCharityTenEthGoal();
        contractUnderTests.donateEth{value: 10 ether}(charityId);
        vm.warp(CHARITY_DEFAULT_END_TIMESTAMP);
        
        assertEq(contributorAddress.balance, 0.01 ether);
        assertEq(musdc.balanceOf(contributorAddress), 20000);
        
        contractUnderTests.tryCloseCharity(charityId);
        (,,,,,,CharityFactory.CharityStatus status, uint256 ethRaised, uint256 usdcRaised) = contractUnderTests.charities(charityId);
        assertTrue(status == CharityFactory.CharityStatus.CLOSED_GOAL_MET);
        assertEq(ethRaised, 10.01 ether);
        assertEq(usdcRaised, 0);

        console.log("status: %s", uint8(status));
        vm.stopPrank();
    }
    
    function testDonateUsdcAndCloseCharityWithGoalMet() public {
        vm.startPrank(contributorAddress);
        uint256 charityId = createDefaultCharityTenEthGoal();
        musdc.approve(address(contractUnderTests), 20000);
        contractUnderTests.donateUsdc(charityId, 20000);
        vm.warp(CHARITY_DEFAULT_END_TIMESTAMP);

        assertEq(contributorAddress.balance, 10.01 ether);
        assertEq(musdc.balanceOf(contributorAddress), 0);
    
        contractUnderTests.tryCloseCharity(charityId);
        (,,,,,,CharityFactory.CharityStatus status, uint256 ethRaised, uint256 usdcRaised) = contractUnderTests.charities(charityId);
        assertTrue(status == CharityFactory.CharityStatus.CLOSED_GOAL_MET);
        assertEq(ethRaised, 0.01 ether);
        assertEq(usdcRaised, 20000);
    
        console.log("status: %s", uint8(status));
        vm.stopPrank();
    }

    
    function testDonateAndCloseCharityWithGoalNotMetAndWithdrawContribution() public {
        vm.startPrank(contributorAddress);
        uint256 charityId = createDefaultCharityTenEthGoal();
        contractUnderTests.donateEth{value: 5 ether}(charityId);
        musdc.approve(address(contractUnderTests), 200);
        contractUnderTests.donateUsdc(charityId, 200);
        vm.warp(CHARITY_DEFAULT_END_TIMESTAMP);

        assertEq(contributorAddress.balance, 5.01 ether);
        assertEq(musdc.balanceOf(contributorAddress), 19800);
    
        contractUnderTests.tryCloseCharity(charityId);
        (,,,,,,CharityFactory.CharityStatus status, uint256 ethRaised, uint256 usdcRaised) = contractUnderTests.charities(charityId);
        assertTrue(status == CharityFactory.CharityStatus.CLOSED_GOAL_NOT_MET);
        assertEq(ethRaised, 5.01 ether);
        assertEq(usdcRaised, 200);
    
        console.log("status: %s", uint8(status));
        contractUnderTests.withdrawContribution(charityId);
    
        assertEq(contributorAddress.balance, 10.02 ether);
        assertEq(musdc.balanceOf(contributorAddress), 20000);
        
        vm.stopPrank();
    }
    
    
    function testCannotReceiveNftForGoalNotMet() public {
        uint256 charityId = createAndCloseCharityGoalNotMet();
        vm.prank(contributorAddress);
        vm.expectRevert("Nft reception is possible only for closed charities with goal met");
        contractUnderTests.receiveNtf(charityId);
    }
    
    
    function testCannotReceiveNftForNotDonatingUser() public {
        uint256 charityId = createAndCloseCharityGoalMet();
        vm.prank(anotherAddress);
        vm.expectRevert("User did not donate to charity");
        contractUnderTests.receiveNtf(charityId);
    }
    
    function testReceiveNftForGoalMet() public {
        uint256 charityId = createAndCloseCharityGoalMet();
        vm.prank(contributorAddress);
        contractUnderTests.receiveNtf(charityId);
        
        
        //verify badge is visible for everybody
        vm.prank(anotherAddress);
        (
        uint256 nftTokenId,
        uint256 nftCharityId,
        uint256 nftEthRaised,
        uint256 nftUsdcRaised,
        address nftContributor
        )
        = badge.metadata(contributorAddress, charityId);
    
        assertEq(nftTokenId, 1);
        assertEq(nftCharityId, charityId);
        assertEq(nftEthRaised, 10.01 ether);
        assertEq(nftUsdcRaised, 0);
        assertEq(nftContributor, contributorAddress);
    }
    
    function testCannotReceiveNftTwice() public {
        uint256 charityId = createAndCloseCharityGoalMet();
        vm.startPrank(contributorAddress);
        contractUnderTests.receiveNtf(charityId);
        vm.expectRevert("Nft already received for user");
        contractUnderTests.receiveNtf(charityId);
        vm.stopPrank();
    }
    
    function testCannotWithdrawFundsForGoalMet() public {
        uint256 charityId = createAndCloseCharityGoalMet();
        vm.prank(contributorAddress);
        vm.expectRevert("The withdrawal of contribution is possible only for closed charities with goal not being met");
        contractUnderTests.withdrawContribution(charityId);
    }
    

    function testFundsTransferredBeneficiary() public {
        vm.deal(beneficiary, 0);
        vm.startPrank(contributorAddress);
        uint256 charityId = createDefaultCharityTenEthGoal();
        contractUnderTests.donateEth{value: 10 ether}(charityId);
        musdc.approve(address(contractUnderTests), 200);
        contractUnderTests.donateUsdc(charityId, 200);
        vm.warp(CHARITY_DEFAULT_END_TIMESTAMP);
    
        assertEq(beneficiary.balance, 0);
        assertEq(musdc.balanceOf(beneficiary), 0);
        contractUnderTests.tryCloseCharity(charityId);
    
        assertEq(beneficiary.balance, 10.01 ether);
        assertEq(musdc.balanceOf(beneficiary), 200);
        vm.stopPrank();
    }
    
    function testGetAllCharities() public {
        vm.deal(contributorAddress, 100 ether);
        
        assertEq(contractUnderTests.getAllCharities().length, 0);
        uint256 firstCharityId = createDefaultCharityTenEthGoal();
        assertEq(contractUnderTests.getAllCharities().length, 1);
        uint256 secondCharityId = createAndCloseCharityGoalMet();
        assertEq(contractUnderTests.getAllCharities().length, 2);
        uint256 thirdCharityId = createAndCloseCharityGoalNotMet();
        assertEq(contractUnderTests.getAllCharities().length, 3);
    
        (,,,,,,CharityFactory.CharityStatus firstCharityStatus,,) = contractUnderTests.charities(firstCharityId);
        assertTrue(firstCharityStatus == CharityFactory.CharityStatus.ONGOING);
        (,,,,,,CharityFactory.CharityStatus secondCharityStatus,,) = contractUnderTests.charities(secondCharityId);
        assertTrue(secondCharityStatus == CharityFactory.CharityStatus.CLOSED_GOAL_MET);
        (,,,,,,CharityFactory.CharityStatus thirdCharityStatus,,) = contractUnderTests.charities(thirdCharityId);
        assertTrue(thirdCharityStatus == CharityFactory.CharityStatus.CLOSED_GOAL_NOT_MET);
    }
}
