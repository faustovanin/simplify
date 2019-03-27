pragma solidity ^0.5.4;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Simplify is ERC20Detailed, ERC20Mintable {
    modifier onlyMinter() {
        require(true);
        _;
    }

    mapping (address => uint256) private _flow;
    mapping (address => uint256) private recognitionFlow;
    mapping (address => uint256) private selfFlow;

	constructor (string memory _name, string memory _symbol, uint8 _decimals) public
        ERC20Detailed(_name, _symbol, _decimals)
    {
        
    }

    function mint(address _to, uint256 _amount)
        public
        onlyMinter
        returns (bool)
    {
        bool result = super.mint(_to, _amount);
        if(result) {
            recognitionFlow[to] += value;
            // addFlow(_to, _amount);
        }
    }

    function transfer(address to, uint256 value) 
        public
        returns (bool) 
    {
        bool result = super.transfer(to, value);
        if(result) {
            recognitionFlow[to] += value;
            // addFlow(to, value);
            // addFlow(msg.sender, value);
        }
    }

    function transferFrom(address from, address to, uint256 value) 
        public
        returns (bool) 
    {
        bool result = super.transferFrom(from, to, value);
        if(result) {
            addFlow(to, value);
            addFlow(from, value);
        }
    }

    function addFlow(address _to, uint256 _amount) internal {
        _flow[_to] += _amount;
    }

    function getFlow(address who) public view returns (uint256) {
        return _flow[who];
    }

}