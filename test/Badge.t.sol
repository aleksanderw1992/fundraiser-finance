// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/Badge.sol";

contract BadgeTest is Test {
    Badge contractUnderTests;
    address deployer = address(0x1223);
    address charityFactoryAddress = address(0x1889);
    address anotherAddress = address(0x18893);
    address contributorAddress = address(0x188931);
    
    function setUp() public {
        vm.startPrank(deployer);
        contractUnderTests = new Badge(charityFactoryAddress);
        vm.stopPrank();
    }
    
    function testCharityFactoryAddressCanMint() public {
        vm.prank(charityFactoryAddress);
        contractUnderTests.mint(contributorAddress, 1, 1, 1);
    }
    
    function testAnotherAddressCannotMint() public {
        vm.expectRevert("Only charity factory contract can mint Badge NFT");
        vm.prank(anotherAddress);
        contractUnderTests.mint(contributorAddress, 1, 1, 1);
    }
    
    function testVerifyMetadataAfterMinting() public {
        vm.startPrank(charityFactoryAddress);
        contractUnderTests.mint(contributorAddress, 1, 2, 3);
        contractUnderTests.mint(contributorAddress, 4, 5, 6);
    
        (
        uint256 firstNftTokenId,
        uint256 firstNftCharityId,
        uint256 firstNftEthRaised,
        uint256 firstNftUsdcRaised,
        address firstNftContributor
        )
        = contractUnderTests.metadata(contributorAddress, 1);
        (
        uint256 secondNftTokenId,
        uint256 secondNftCharityId,
        uint256 secondNftEthRaised,
        uint256 secondNftUsdcRaised,
        address secondNftContributor
        )
        = contractUnderTests.metadata(contributorAddress, 4);

        assertEq(firstNftTokenId, 1);
        assertEq(firstNftCharityId, 1);
        assertEq(firstNftEthRaised, 2);
        assertEq(firstNftUsdcRaised, 3);
        assertEq(firstNftContributor, contributorAddress);
        
        assertEq(secondNftTokenId, 2);
        assertEq(secondNftCharityId, 4);
        assertEq(secondNftEthRaised, 5);
        assertEq(secondNftUsdcRaised, 6);
        assertEq(secondNftContributor, contributorAddress);
    
    }
}
