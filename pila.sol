pragma solidity ^0.4.10;

contract owned {
    function owned() { owner = msg.sender; }
    address owner;

    // This means that if the owner calls this function, the
    // function is executed and otherwise, an exception is
    // thrown.
    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }
}

contract PilaToken is owned {
/* Public variables of the token */
    string public standard = 'Token 0.1';
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    /* This creates an array with all balances */
    mapping (address => uint256) public balanceOf;
    mapping (address => mapping (address => uint256)) public allowance;

    /* This generates a public event on the blockchain that will notify clients */
    event EtherTransfer(address indexed from, address indexed to, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);

    /* This notifies clients about the amount burnt */
    event Burn(address indexed from, uint256 value);

    function burn(uint256 _value) returns (bool success) {
        if (balanceOf[msg.sender] < _value) throw;                 // Check if the sender has enough
        balanceOf[msg.sender] -= _value;                          // Subtract from the sender
        Burn(msg.sender, _value);
        return true;
    }

    /* Notifies when funds were added */

    event MintEvent(address participant, uint256 indexed value);

    address[] public participants;
    address[] public validators;

    function PilaToken(
        uint256 initialSupply,
        string tokenName,
        uint8 decimalUnits,
        string tokenSymbol
        ) {
        balanceOf[msg.sender] = initialSupply;
        participants.push(msg.sender);

        totalSupply = initialSupply;
        name = tokenName;
        symbol = tokenSymbol;
        decimals = decimalUnits;
    }

    /* Send coins */
    function transfer(address _to, uint256 _value) {
        if (_to == 0x0) throw;                               // Prevent transfer to 0x0 address
        if (balanceOf[msg.sender] < _value) throw;           // Check if the sender has enough
        if (balanceOf[_to] + _value < balanceOf[_to]) throw; // Check for overflows
        balanceOf[msg.sender] -= _value;                     // Subtract from the sender

        participants.push(_to);

        balanceOf[_to] += _value;                            // Add the same to the recipient
        Transfer(msg.sender, _to, _value);                   // Notify anyone listening that this transfer took place
    }

    function addValidator(address _validator) onlyOwner returns (bool added) {
        validators.push(_validator);
        
        return true;
    }

    function mint (address _target, address _validator, uint256 _amount) onlyOwner returns (bool success)  {
        bool validated = false;
        for(uint256 i = 0; i < validators.length; i = i + 1){
            if(validators[i] == _validator)
                validated = true;
        }
        if(validated) {
            totalSupply += _amount;
            balanceOf[_target] += _amount;
        }
        return validated;
    }
    
    function close() onlyOwner {
        selfdestruct(owner);
    }
}
