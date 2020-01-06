pragma solidity ^0.5.0;

import "./Token.sol";

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
/**
* Exchange is responsible for:
* [X] Set the fee account
* [X] Deposit Ether
* [X] Withdraw Ether
* [X] Deposit tokens
* [X] Withdraw tokens
* [X] Check balances
* [X] Make order
* [X] Cancel order
* [X] Fill order
* [X] Charge fees
*/

contract Exchange {
	using SafeMath for uint;

	// Varialbles
	address public feeAccount; // the account that receives exchange fees
	uint256 public feePercent; // the fee percentage
	address constant ETHER = address(0); // store ether in tokens mapping with blank address
	uint256 public orderCount;

	mapping(address => mapping(address => uint256)) public tokens;
	// Store the orders
	mapping(uint256 => _Order) public orders;
	mapping(uint256 => bool) public orderFilled;
	mapping(uint256 => bool) public orderCancelled;

	// Events
	event Deposit(address token, address user, uint256 amount, uint256 balance);
	event Withdraw(address token, address user, uint256 amount, uint256 balance);
	event Order(uint256 id, address user, address tokenGet, uint256 amountGet, 
				address tokenGive, uint256 amountGive, uint256 timestamp);
	event Cancel(uint256 id, address user, address tokenGet, uint256 amountGet, 
				address tokenGive, uint256 amountGive, uint256 timestamp);
	event Trade(uint256 id, address user, address tokenGet, uint256 amountGet, 
				address tokenGive, uint256 amountGive, address userFill, uint256 timestamp);

	// Model the Order
	struct _Order {
		uint256 id;
		address user;
		address tokenGet;
		uint256 amountGet;
		address tokenGive;
		uint256 amountGive;
		uint256 timestamp;
	}

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

	function withdrawEther(uint _amount) public {
		require(tokens[ETHER][msg.sender] >= _amount);
		tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);

		// Transfer Ether back to the user
		msg.sender.transfer(_amount);	

		emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
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

	function withdrawToken(address _token, uint _amount) public {
		// Dont allow ether deposits
		require(_token != ETHER);
		require(tokens[_token][msg.sender] >= _amount);

		// Manage balances - update balance
		tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);

		// Transfer Token back to the user
		require(Token(_token).transfer(msg.sender, _amount));

		emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
	}

	// Checking balances
	function balanceOf(address _token, address _user) public view returns (uint256 balance) {
		return tokens[_token][_user];
	}

	// Add the order to storage
	function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
		orderCount = orderCount.add(1);
		orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
		emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
	}

	function cancelOrder(uint256 _id) public {
		_Order storage _order = orders[_id];

		// Must be "my" order
		require(address(_order.user) == msg.sender);

		// Must be a valid order
		require(_order.id == _id); // Must exist

		orderCancelled[_id] = true;
		emit Cancel(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive,
							_order.amountGive, now);
	}

	function fillOrder(uint256 _id) public {
		require(_id > 0 && _id <= orderCount);
		require(!orderFilled[_id]);
		require(!orderCancelled[_id]);

		// Fetch the order from storage
		_Order storage _order = orders[_id];

		// Handle trade
		_trade(_order);

		// Mark order as filled
		orderFilled[_id] = true;
	}

	function _trade(_Order storage _order) internal {
		// Charge fees: Fee paid by the user that fills the order, a.k.a msg.sender
		uint256 _feeAmount = _order.amountGet.mul(feePercent).div(100);

		// Execute trade
		tokens[_order.tokenGet][msg.sender] = tokens[_order.tokenGet][msg.sender].sub(_order.amountGet.add(_feeAmount));
		tokens[_order.tokenGet][_order.user] = tokens[_order.tokenGet][_order.user].add(_order.amountGet);

		// Add to feeAccount
		tokens[_order.tokenGet][feeAccount] = tokens[_order.tokenGet][feeAccount].add(_feeAmount);

		tokens[_order.tokenGive][_order.user] = tokens[_order.tokenGive][_order.user].sub(_order.amountGive);
		tokens[_order.tokenGive][msg.sender] = tokens[_order.tokenGive][msg.sender].add(_order.amountGive);
		
		// Emit trade event
		emit Trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive,
							_order.amountGive, msg.sender, now);
	}
}