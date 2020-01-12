
// Load the data into exchange with some deposits, orders etc
// So that when UI loads there is some ready made data
// command: truffle exec ./scripts/seed-exchange.js

const Token = artifacts.require("Token")
const Exchange = artifacts.require("Exchange")

// Ether token deposit address
const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000' 

const ether = (n) => {
	return new web3.utils.BN(
		web3.utils.toWei(n.toString(), 'ether')
	)
}

const tokens = (n) => ether(n)

const wait = (seconds) => {
	const milliseconds = seconds * 1000
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}

module.exports = async function(callback) {
	try {
		// Fetch accounts from wallet - These are unlocked
		const accounts = await web3.eth.getAccounts()

		// Fetch deployed Token
		const token = await Token.deployed()
		console.log("Token fetched...:", token.address)

		// Fetch deployed Exchange
		const exchange = await Exchange.deployed()
		console.log("Exchange fetched...:", exchange.address)

		// Give tokens to accounts[1] to participate in trade
		const sender = accounts[0]
		const receiver = accounts[1]
		let amount

		amount = web3.utils.toWei('10000', 'ether') // 10,000 tokens
		await token.transfer(receiver, amount, { from: sender })
		console.log(`Transferred ${amount} token from ${sender} to ${receiver}`)

		// Setup exchange users
		const user1 = accounts[0]
		const user2 = accounts[1]

		// User1 Eeposits ether to the exchange
		amount = 1
		await exchange.depositEther({ from: user1, value: ether(amount) })
		console.log(`Deposited ${amount} Ether by ${user1}`)

		// User2 approves tokens
		amount = 10000
		await token.approve(exchange.address, tokens(amount), { from: user2 })
		console.log(`Approved ${amount} tokens by ${user2}`)

		// User2 deposits tokes to exchange
		await exchange.depositToken(token.address, tokens(amount), { from: user2 })
		console.log(`Deposited ${amount} tokes by ${user2}`)

		// --- Send a cancelled order ----
		//

		// User1 makes order to get tokens
		let result
		let orderId
		result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), { from: user1 })
		console.log(`Made order by ${user1}`)

		// User1 cancells the order
		orderId = result.logs[0].args.id
		await exchange.cancelOrder(orderId, { from: user1 })
		console.log(`Cancelled order by ${user1}`)

		// --- Send a filled orders ----
		//

		// User1 makes order
		result = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS, ether(0.1), { from: user1 })
		console.log(`Made order by ${user1}`)

		// User2 fills order
		orderId = result.logs[0].args.id
		await exchange.fillOrder(orderId, { from: user2 })
		console.log(`Filled order by ${user2}`)

		// Wait for 1 sec to avoid timestamp collisions
		await wait(1)

		// User1 makes another order
		result = await exchange.makeOrder(token.address, tokens(50), ETHER_ADDRESS, ether(0.01), { from: user1 })
		console.log(`Made order by ${user1}`)

		// User2 fills another order
		orderId = result.logs[0].args.id
		await exchange.fillOrder(orderId, { from: user2 })
		console.log(`Filled order by ${user2}`)

		// Wait for 1 sec to avoid timestamp collisions
		await wait(1)

		// User1 make final order
		result = await exchange.makeOrder(token.address, tokens(200), ETHER_ADDRESS, ether(0.15), { from: user1 })
		console.log(`Made order by ${user1}`)

		// User2 fills final order
		orderId = result.logs[0].args.id
		await exchange.fillOrder(orderId, { from: user2 })
		console.log(`Filled order by ${user2}`)

		// Wait for 1 sec to avoid timestamp collisions
		await wait(1)

		// --- Send a Open orders ----
		//

		// User1 make 10 orders
		for(let i = 1; i <= 10; i++) {
			result = await exchange.makeOrder(token.address, tokens(10 * i), ETHER_ADDRESS, ether(0.01), { from: user1 })
			console.log(`Made order by ${user1}`)
			// Wait for 1 sec to avoid timestamp collisions
			await wait(1)
		}

		// User2 makes 10 order
		for(let i = 1; i <= 10; i++) {
			result = await exchange.makeOrder(ETHER_ADDRESS, ether(0.01), token.address, tokens(10 * i), { from: user2 })
			console.log(`Made order by ${user1}`)
			// Wait for 1 sec to avoid timestamp collisions
			await wait(1)
		}

	} catch(error) {
		console.log(error)
	}
	
	// call the callback function once the scrip execution reach the end
	callback()
}