pragma solidity ^0.5.0;

import "openzeppelin-eth/contracts/token/ERC721/StandaloneERC721.sol";
import "zos-lib/contracts/Initializable.sol";
import "tabookey-gasless/contracts/RelayRecipient.sol";


contract MetaNFT is RelayRecipient, Initializable, StandaloneERC721 {
    
    bool public isReady = false;

    function initialize(string memory name, string memory symbol, address[] memory minters, address[] memory pausers) public initializer {
    StandaloneERC721.initialize(name, symbol, minters, pausers);
    isReady = true;
    }

    function isTokenReady() public view returns(bool){
        return isReady;
    }

    function metaMint(address to, uint256 tokenId, string memory tokenURI) public view returns(bool){
        mintWithTokenURI()
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
