pragma solidity ^0.4.24;

contract RealEstate {
    address public seller;
    address public buyer;
    string public streetAddress;
    string title;
    uint256 public price;
    
    function RealEstate() {
        // Who is the seller?
        seller = msg.sender;
        // What is the street address?
        streetAddress = "350 5th Ave, New York, NY 10119";
        // What is the title?
        title = "titleId";
        // What is the price?
        price = 99000000000000000000; // 99 Ether converted to wei.
    }
    
    function buyHouse() payable public {
        require(seller != 0x0);
        require(buyer == 0x0);
        require(msg.sender != seller);
        require(msg.value == price);
        buyer = msg.sender;
        seller.transfer(msg.value);
    }
    
}
