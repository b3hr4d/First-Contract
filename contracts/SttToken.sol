pragma solidity ^0.5.16;

contract SttToken {
    string public name = "Smart World Token";
    string public symbol = "STT";
    string public standard = "STT Token v1.0";
    uint public totalSupply;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint _value
    );

    mapping(address => uint) public balanceOf;

    constructor(uint _initialSupply) public {
        balanceOf[msg.sender] = _initialSupply;
        totalSupply = _initialSupply;
    }

    function transfer(address _to, uint _value) public returns(bool seccess) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        emit Transfer(msg.sender, _to, _value);

        return true;
    }

}