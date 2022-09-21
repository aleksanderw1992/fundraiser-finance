// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/CharityFactory.sol";
import "./mock/MockERC20.sol";
import "chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol";

contract CharityFactoryTest is Test {
    CharityFactory contractUnderTests;
    uint256 ETH_MIN_PRICE = 0.01 ether;
    uint256 ETH_NOT_SUFFICIENT_PRICE = 0.009 ether;
    address deployer = address(0x1223);
    address anotherAddress = address(0x18893);
    address contributorAddress = address(0x188931);
    address beneficiary = address(0x1889311);
    MockERC20 musdc = new MockERC20();
    uint256 creationTimestamp = 1000000;
    // 1 eth = 2000 USDC
    MockV3Aggregator mockChainlinkAggregator = new MockV3Aggregator(18, 2000*(10**18));
    
    function setUp() public {
        vm.startPrank(deployer);
        contractUnderTests = new CharityFactory(address(musdc), address(mockChainlinkAggregator));
        vm.stopPrank();
        vm.warp(creationTimestamp);
    }
    
    function testCreateCharitySuccess() public {
        contractUnderTests.createCharity{value : ETH_MIN_PRICE}
        (CharityFactory.Currency.ETH, 10, creationTimestamp + 1000, "successful fundraising", beneficiary);
    }
    
    function testCreateCharityFailTooLessEthFee() public {
        vm.expectRevert("You need to pay at least 0.01 ETH for a charity to start");
        contractUnderTests.createCharity{value : ETH_NOT_SUFFICIENT_PRICE}
        (CharityFactory.Currency.ETH, 10, creationTimestamp + 1000, "successful fundraising", beneficiary);
    }
    
    function testCreateCharityFailBeneficiaryZeroAddress() public {
        vm.expectRevert("Beneficiary cannot be set to address zero");
        contractUnderTests.createCharity{value : ETH_MIN_PRICE}
        (CharityFactory.Currency.ETH, 10, creationTimestamp + 1000, "successful fundraising", address(0x0));
    }
    
    function testCreateCharityFailGoalZero() public {
        vm.expectRevert("Goal cannot be zero");
        contractUnderTests.createCharity{value : ETH_MIN_PRICE}
        (CharityFactory.Currency.ETH, 0, creationTimestamp + 1000, "successful fundraising", beneficiary);
    }
    
    function testCreateCharityFailEndDateInPast() public {
        vm.expectRevert("Charity cannot end in the past");
        contractUnderTests.createCharity{value : ETH_MIN_PRICE}
        (CharityFactory.Currency.ETH, 10, creationTimestamp - 1000, "successful fundraising", beneficiary);
    }
    
    function testCreateCharityFailGoalTooLowInUSDC() public {
        vm.expectRevert("Cannot create a charity with too low goal");
        contractUnderTests.createCharity{value : ETH_MIN_PRICE}
        (CharityFactory.Currency.USDC, 1, creationTimestamp + 1000, "successful fundraising", beneficiary);
    }
}
