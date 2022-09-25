// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/CharityFactory.sol";
import "../test/mock/MockERC20.sol";
import "../lib/chainlink/contracts/src/v0.8/tests/MockV3Aggregator.sol";

///@notice Script to deploy contracts to local blockchain
/*
For local deployment use commands:
anvil
pick from there private key and public key
forge script /Users/macbook/work/fundraiser-finance/script/DeployLocal.sol:DeployLocal --fork-url http://localhost:8545 --private-key $pk —broadcast

*/
contract DeployLocal is Script {
    function run() external {
        vm.startBroadcast();
        MockERC20 musdc = new MockERC20();
        MockV3Aggregator mockChainlinkAggregator = new MockV3Aggregator(8, 2000*(10**8));
        CharityFactory charityFactory = new CharityFactory(address(musdc), address(mockChainlinkAggregator));
        // Badge contract is created along with CharityFactory
        vm.stopBroadcast();
    }
}