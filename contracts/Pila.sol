pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";
import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/access/Whitelist.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Pila is Destructible, Whitelist, DetailedERC20, MintableToken {

    event ActionStarted(uint256 id, address creator, uint256 people);
    event ActionFinished(uint256 id, address creator, uint256 people, uint256 numberOfVolunteers);
    event NewSubscriber(uint256 id, address subscriber);
    event SubscriberApproved(uint256 id, address subscriber);
    event SubscriberReproved(uint256 id, address subscriber);

    using SafeMath for uint256;

    struct Volunteer {
        address addr;
        uint256 contribution;
    }

	struct Action {
		address creator; // The creator of the action
		uint256 people; // The number of people impacted by the action
		bool active; // Flag to define whenever the token distribution will run
        mapping(address => uint256) volunteers;
        address[] volunteersAccs;
        uint256 totalContribution;
        bytes32 url;
	}

    modifier onlyActionCreator (address _sender, uint256 _actionId) {
        require(actions[_actionId].creator == _sender);
        _;
    }

    modifier actionOpen(uint256 actionId) {
        require(actions[actionId].active);
        _;
    }

    Action[] actions;
    uint256 target;
    uint256 impact;
    uint256 reductionFactor;

	constructor (string _name, string _symbol, uint8 _decimals, uint256 _target) public
        DetailedERC20(_name, _symbol, _decimals)
        Ownable()
    {
        require(_target > 0);
    	target = _target;
        reductionFactor = 0;
        impact = 0;
    }

    function addAction(uint256 _people, bytes32 _url) public 
    	onlyIfWhitelisted(msg.sender)
        returns(uint256)
    {

    	actions.length++;
        actions[actions.length-1].creator = msg.sender;
        actions[actions.length-1].people  = _people;
        actions[actions.length-1].url = _url;
        actions[actions.length-1].active  = true;
        actions[actions.length-1].totalContribution  = 0;

        emit ActionStarted(actions.length, msg.sender, _people);
    }

    function addVolunteer(uint256 _actionId, address _volunteer, uint256 _contribution) public 
        actionOpen(_actionId)
        onlyActionCreator(msg.sender, _actionId)
    {
        _addVolunteer(_actionId, _volunteer, _contribution);
    }

    function _addVolunteer(uint256 _actionId, address _volunteer, uint256 _contribution) internal {
        require(actions[_actionId].creator != address(0));

        // actions[_actionId].volunteers.length++;
        // uint256 index = actions[_actionId].volunteers.length-1;
        // actions[_actionId].volunteers[index] = Volunteer(_volunteer, _contribution);
        uint256 currentContribution = actions[_actionId].volunteers[_volunteer];
        actions[_actionId].volunteers[_volunteer] = _contribution;
        if(currentContribution == 0 && _contribution > 0) {
            actions[_actionId].volunteersAccs.push(_volunteer);
            actions[_actionId].totalContribution -= currentContribution;
        }
        
        actions[_actionId].totalContribution += _contribution;
    }

    function subscribe(uint256 _actionId) public 
        actionOpen(_actionId)
    {
        _addVolunteer(_actionId, msg.sender, 0);
        emit NewSubscriber(_actionId, msg.sender);
    }

    function approveVolunteer(uint256 _actionId, address _volunteer, uint256 _contribution) public 
        actionOpen(_actionId)
        onlyActionCreator(msg.sender, _actionId)
    {
        require(_contribution > 0);

        _addVolunteer(_actionId, _volunteer, _contribution);
        emit SubscriberApproved(_actionId, _volunteer);
    }
    
    function reprove(uint256 _actionId, address _volunteer) public
        actionOpen(_actionId)
        onlyActionCreator(msg.sender, _actionId)
    {
        delete actions[_actionId].volunteers[_volunteer];
        Action storage action = actions[_actionId];
        for(uint256 i=0; i<action.volunteersAccs.length; i++) {
            if(action.volunteersAccs[i] == _volunteer) {
                delete action.volunteersAccs[i];
                break;
            }
        }
        emit SubscriberReproved(_actionId, _volunteer);
    }

    function actionFinished(uint256 _actionId) public view returns(bool) {
        return !actions[_actionId].active;
    }

    function finishAction(uint256 _actionId) public 
        actionOpen(_actionId)
        onlyActionCreator(msg.sender, _actionId)
    {
        require(actions[_actionId].creator != 0);
        Action storage action = actions[_actionId];

        for(uint256 i=0; i<action.volunteersAccs.length; i++) {
            address addr = action.volunteersAccs[i];
            uint256 weightedContribution = action.volunteers[addr].mul(100).div(actions[_actionId].totalContribution);
            uint256 tokensToMint = weightedContribution.mul(this.getActionTokenAmount(_actionId)).div(100).mul(10**uint256(decimals));
            // Volunteer storage volunteer = action.volunteers[addr];

            mint(addr, tokensToMint);
        }

        actions[_actionId].active = false;
        impact += actions[_actionId].people;
        reductionFactor = impact.mul(1000).div(target); //999 == 99.9
        
        emit ActionFinished(_actionId, action.creator, action.people, action.volunteersAccs.length);
    }

    function getActionCount() external view returns(uint256) {
        return actions.length;
    }

    function getAction(uint256 _actionId) external view returns(address, bytes32, bool, uint256, uint256) {
        return (actions[_actionId].creator, actions[_actionId].url, actions[_actionId].active, actions[_actionId].people, actions[_actionId].volunteersAccs.length);
    }

    function getActionVolunteerCount(uint256 _actionId) external view returns(uint256) {
        return actions[_actionId].volunteersAccs.length;
    }

    function getActionVolunteer(uint256 _actionId, uint256 _volunteerNumber) external view returns(address, uint256) {
        return (actions[_actionId].volunteersAccs[_volunteerNumber], actions[_actionId].volunteers[actions[_actionId].volunteersAccs[_volunteerNumber]]);
    }

    function getActionTotalContribution(uint256 _actionId) external view returns(uint256) {
        return actions[_actionId].totalContribution;
    }

    function getActionTokenAmount(uint256 _actionId) external view returns(uint256)
    {
        uint256 reduction = actions[_actionId].people.mul(1000-reductionFactor);
        return reduction.mul(actions[_actionId].volunteersAccs.length).div(1000);
    }
}