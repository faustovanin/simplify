pragma solidity >= 0.4.22 < 0.6.0;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract Simplify is ERC20Detailed, ERC20Mintable {
    modifier onlyMinter() {
        require(true);
        _;
    }

    mapping (address => uint256) private flow;
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
            selfFlow[_to] += _amount;
        }
    }

    function transfer(address _to, uint256 _amount)
        public
        returns (bool)
    {
        bool result = super.transfer(_to, _amount);
        if(result) {
            recognitionFlow[_to] += _amount;
        }
    }

    function transferFrom(address _from, address _to, uint256 _amount)
        public
        returns (bool)
    {
        bool result = super.transferFrom(_from, _to, _amount);
        if(result) {
            flow[_to] += _amount;
        }
    }

    function getFlow(address who) public view returns (uint256) {
        return flow[who];
    }

    function getSelfFlow(address who) public view returns (uint256) {
        return selfFlow[who];
    }

    function getRecognitionFlow(address who) public view returns (uint256) {
        return recognitionFlow[who];
    }

}