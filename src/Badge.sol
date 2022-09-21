// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "openzeppelin-contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/utils/Counters.sol";
import "./CharityFactory.sol";

///@notice Nft received for successful participation in charity
///@author Aleksander Wojcik (aleksander.w1992)
contract Badge is ERC721 {
    
    struct BadgeMetadata {
        uint256 tokenId;
        uint256 charityId;
        uint256 ethRaised;
        uint256 usdcRaised;
        address contributor;
    }

    address public immutable charityFactoryAddress;
    ///@notice mappings
    mapping(address=>mapping(uint256=>BadgeMetadata)) public metadata;
    
    ///@notice helpers
    using Counters for Counters.Counter;
    Counters.Counter private _counter;
    
    constructor(address _charityFactoryAddress) ERC721("FundraiserFinanceParticipationBadge", "FFPB") {
        charityFactoryAddress = _charityFactoryAddress;
    }

    ///@notice function to mint contribution nft. Only CharityFactory contract can issue nft
    function mint(address contributor, uint256 charityId, uint256 ethRaised, uint256 usdcRaised) public {
        require(msg.sender == address(charityFactoryAddress), "Only charity factory contract can mint Badge NFT");
        _counter.increment();
        _safeMint(contributor, _counter.current());
        metadata[contributor][charityId]= BadgeMetadata({
            tokenId: _counter.current(),
            charityId: charityId,
            ethRaised: ethRaised,
            usdcRaised: usdcRaised,
            contributor: contributor
        });
    }
}
