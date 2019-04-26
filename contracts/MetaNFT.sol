pragma solidity ^0.5.0;

import "openzeppelin-eth/contracts/token/ERC721/StandaloneERC721.sol";
import "zos-lib/contracts/Initializable.sol";
import "tabookey-gasless/contracts/RelayRecipient.sol";


contract MetaNFT is RelayRecipient, Initializable, StandaloneERC721 {
    
    bool public isReady;

    function initialize(string memory name, string memory symbol, address[] memory minters, address[] memory pausers) public initializer {
    StandaloneERC721.initialize(name, symbol, minters, pausers);
    isReady = true;
    }

    function isTokenReady() public view returns(bool){
        return isReady;
    }

    //This allows anyone to mint
    function metaMint(uint256 tokenId, string calldata tokenURI) external returns(bool){
        //require(_mint(get_sender(), tokenId), "_Mint failed for some reason");
        _mint(get_sender(), tokenId);
        //require(_setTokenURI(tokenId, tokenURI),"Set token ID failed for some reason");
        _setTokenURI(tokenId, tokenURI);
        return true;
    }

    function metaTransfer(address to, uint256 tokenId) external returns(bool){
        //require(_transferFrom(get_sender(),to,tokenId), "Transfer failed for some reason");
        _transferFrom(get_sender(),to,tokenId);
        return true;
    }
    

  function accept_relayed_call(address /*relay*/, address from,
    bytes memory /*encoded_function*/, uint /*gas_price*/, 
    uint /*transaction_fee*/ ) public view returns(uint32) {
      // We'll invert this to control access to the relayer.
      //require(!whiteList[from]);
      return 0;
  }

  function post_relayed_call(address /*relay*/, address /*from*/,
    bytes memory /*encoded_function*/, bool /*success*/,
    uint /*used_gas*/, uint /*transaction_fee*/ ) public {
  }

  function init_hub(RelayHub hub_addr) public {
    init_relay_hub(hub_addr);
  }


}
