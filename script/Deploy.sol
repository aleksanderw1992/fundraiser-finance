// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/CharityFactory.sol";

///@notice Script to deploy contracts to blockchain (WIP - foundry probably can deploy only one contract at the time). Use script:
/// forge script script/Deploy.s.sol:Deploy --rpc-url $GOERLI_RPC_URL  --private-key $PRIVATE_KEY --broadcast --verify --etherscan-api-key $ETHERSCAN_KEY -vvvv
contract Deploy is Script {
    ///@notice USDC address. Source:
    address private constant USDC_ADDRESS = address(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    ///@notice feed USDC / ETH. Source: https://docs.chain.link/docs/data-feeds/price-feeds/addresses/?network=ethereum
    address private constant USDC_ETH_FEED_ADDRESS = address(0x986b5E1e1755e3C2440e960477f25201B0a8bbD4);
    
    function run() external {
        vm.startBroadcast();
        CharityFactory charityFactory = new CharityFactory(USDC_ADDRESS, USDC_ETH_FEED_ADDRESS);
        // Badge contract is created along with CharityFactory
        vm.stopBroadcast();
    }
}