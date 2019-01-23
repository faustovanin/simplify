pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Simplify is Destructible, DetailedERC20, MintableToken {
    modifier hasMintPermission() {
        require(true);
        _;
    }

	constructor (string _name, string _symbol, uint8 _decimals) public
        DetailedERC20(_name, _symbol, _decimals)
        Ownable()
    {
        
    }

    function mint(
        address _to,
        uint256 _amount
    )
        public
        hasMintPermission
        canMint
        returns (bool)
    {
        return super.mint(_to, _amount);
    }

}