pragma solidity ^0.5.16;

import "./SttToken.sol";

contract SttTokenSale {
    address payable admin;
    SttToken public tokenContract;
    uint public tokenPrice;
    uint public tokenSold;

    event Sell(address _buyer, uint _amount);

    constructor(SttToken _tokenContract, uint _tokenPrice) public {
        admin = msg.sender;
        tokenContract =  _tokenContract;
        tokenPrice = _tokenPrice;
    }
    
    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x, "ds-math-mul-overflow");
    }

    function buyTokens(uint _numberOfTokens) public payable {
        require(msg.value == mul(_numberOfTokens ,tokenPrice));
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        tokenSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        
        selfdestruct(admin);
    }
}