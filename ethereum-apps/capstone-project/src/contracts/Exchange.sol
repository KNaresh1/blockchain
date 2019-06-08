pragma solidity ^0.5.0;

import "./Token.sol";

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
/**
* Exchange is responsible for:
* [X] Set the fee account
* [X] Deposit Ether
* [] Withdraw Ether
* [X] Deposit tokens
* [] Withdraw tokens
* [] Check balances
* [] Make order
* [] Cancel order
* [] Fill order
* [] Charge fees
*/

contract Exchange {
	using SafeMath for uint;

	// Varialbles
	address public feeAccount; // the account that receives exchange fees
	uint256 public feePercent; // the fee percentage
	address constant ETHER = address(0); // store ether in tokens mapping with blank address

	mapping(address => mapping(address => uint256)) public tokens;

	// Events
	event Deposit(address token, address user, uint256 amount, uint256 balance);

	constructor(address _feeAccount, uint256 _feePercent) public {
		feeAccount = _feeAccount;
		feePercent = _feePercent;
	}

	// Fallback: reverts if Ether is sent to this smart contract by mistake
	function () external {
		revert();
	}

	// payable - to accept ether from msg.value
	function depositEther() payable public { 
		// Manage balances - update balance
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);

		emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
	}

	/**
	* Which Token?
	* How much?
	*/
	function depositToken(address _token, uint _amount) public {
		// Dont allow ether deposits
		require(_token != ETHER);

		// Send tokens to this contract (exchange)
		require(Token(_token).transferFrom(msg.sender, address(this), _amount));

		// Manage balances - update balance
		tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);

		emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}
}