// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "openzeppelin-contracts/token/ERC20/ERC20.sol";


///@notice Mock of ERC20 contract - will be used instead of USDC for testing
contract MockERC20 is ERC20 {

    constructor() ERC20("Mock USDC ERC20 Token", "MUSDC") {
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}