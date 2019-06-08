
const Exchange = artifacts.require('./Exchange')
const Token = artifacts.require('./Token')

require('chai')
		.use(require('chai-as-promised'))
		.should()

// Below helper code should be moved to helpers.js
// import { tokens, EVM_REVERT } from './helpers'
const EVM_REVERT = 'VM Exception while processing transaction: revert'

const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000'

const tokens = (n) => {
	return new web3.utils.BN(
		web3.utils.toWei(n.toString(), 'ether')
	)
}

contract('Exchange', ([deployer, feeAccount, user1, user2]) => {
	let token 
	let exchange 
	const feePercent = 10

	beforeEach(async () => {
		// Deploy token
		token = await Token.new()

		// Transfer tokens to user1
		token.transfer(user1, tokens(100), { from: deployer })

		// Deploy exchange
		exchange = await Exchange.new(feeAccount, feePercent)
	})

	describe('deployment', () => {

		it('tracks the fee account', async () => {
			const result = await exchange.feeAccount()
			result.should.equal(feeAccount)
		})

		it('tracks fee percent', async () => {
			const result = await exchange.feePercent()
			result.toString().should.equal(feePercent.toString())
		})
	})

	describe('fallback', () => {
		it('reverts when Ether is sent directly to this smart contract', async () => {
			await exchange.sendTransaction({ from: user1, value: 1 })
			.should.be.rejectedWith(EVM_REVERT)
		})
	})

	describe('depositing ether', () => {
		let result
		let amount 

		beforeEach(async () => {
			amount = tokens(1) // This utility method is same for ether too
			result = await exchange.depositEther({ from: user1, value: amount })
		})

		it('tracks ether deposit', async () => {
			let balance = await exchange.tokens(ETHER_ADDRESS, user1)
			balance.toString().should.equal(amount.toString())
		})

		it('emits deposit event', async () => {
			const log = result.logs[0]
			log.event.should.equal('Deposit', 'emitted event is correct')

			const event = log.args
			event.token.should.equal(ETHER_ADDRESS, 'ether address is correct')
			event.user.should.equal(user1, 'user address is correct')
			event.amount.toString().should.equal(amount.toString(), 'transfer amount is correct')
			event.balance.toString().should.equal(amount.toString(), 'balance is correct')
		})
	})

	describe('withdraw ether', () => {
		let result
		let amount

		beforeEach(async () => {
			// Deposit Ether first
			amount = tokens(1)
			result = await exchange.depositEther({ from: user1, value: amount })
		})

		describe('success', () => {

			beforeEach(async () => {
				result = await exchange.withdrawEther(amount, { from: user1 })
			})

			it('withdraws Ether funds', async () => {
				const balance = await exchange.tokens(ETHER_ADDRESS, user1)
				balance.toString().should.equal('0')
			})

			it('emits a "Withdraw" event', async () => {
				const log = result.logs[0]
				log.event.should.eq('Withdraw')

				const event = log.args
				event.token.should.equal(ETHER_ADDRESS)
				event.user.should.equal(user1)
				event.amount.toString().should.equal(amount.toString())
				event.balance.toString().should.equal('0')
			})
		})

		describe('failure', () => {

			it('rejects withdraws for insufficient balances', async () => {
				await exchange.withdrawEther(tokens(100), { from: user1 })
				.should.be.rejectedWith(EVM_REVERT)
			})
		})

	})

	describe('depositing tokens', () => {
		let result
		let amount = tokens(10)

		describe('success', () => {

			beforeEach(async () => {
				await token.approve(exchange.address, amount, { from: user1 })
				result = await exchange.depositToken(token.address, amount, { from: user1 })
			})

			it('tracks token deposits', async () => {
				// Check exchange token balance
				let balance
				balance = await token.balanceOf(exchange.address)
				balance.toString().should.equal(amount.toString())

				// Check tokens on exchange
				balance = await exchange.tokens(token.address, user1)
				balance.toString().should.equal(amount.toString())
			})

			it('emits deposit event', async () => {
				const log = result.logs[0]
				log.event.should.equal('Deposit', 'emitted event is correct')

				const event = log.args
				event.token.should.equal(token.address, 'token address is correct')
				event.user.should.equal(user1, 'user address is correct')
				event.amount.toString().should.equal(amount.toString(), 'transfer amount is correct')
				event.balance.toString().should.equal(amount.toString(), 'balance is correct')
			})
		})

		describe('failure', () => {
			it('fails when no tokens are approved', async () => {
				await exchange.depositToken(token.address, amount, { from: user1 })
				.should.be.rejectedWith(EVM_REVERT)
			})

			it('rejects ether deposits', async () => {
				await exchange.depositToken(ETHER_ADDRESS, amount, { from: user1 })
				.should.be.rejectedWith(EVM_REVERT)
			})
		})
	})

	describe('withdraw tokens', () => {
		let result
		let amount

		describe('success', () => {

			beforeEach(async () => {
				// Deposit token first
				amount = tokens(10)
				await token.approve(exchange.address, amount, { from: user1 })
				await exchange.depositToken(token.address, amount, { from: user1 })

				// Withdraw token
				result = await exchange.withdrawToken(token.address, amount, { from: user1 })
			})

			it('withdraws token funds', async () => {
				const balance = await exchange.tokens(token.address, user1)
				balance.toString().should.equal('0')
			})

			it('emits a "Withdraw" event', async () => {
				const log = result.logs[0]
				log.event.should.eq('Withdraw')

				const event = log.args
				event.token.should.equal(token.address)
				event.user.should.equal(user1)
				event.amount.toString().should.equal(amount.toString())
				event.balance.toString().should.equal('0')
			})
		})

		describe('failure', () => {

			it('rejects Ether withdraws', async () => {
				await exchange.withdrawToken(ETHER_ADDRESS, tokens(10), { from: user1 })
				.should.be.rejectedWith(EVM_REVERT)
			})

			it('fails on insufficient balances', async () => {
				// Attempt to withdraw tokens without depositing any first
				await exchange.withdrawToken(token.address, tokens(10), { from: user1 })
				.should.be.rejectedWith(EVM_REVERT)
			})
		})
	})

	describe('checking balances', () => {
		let amount

		beforeEach(async () => {
			amount = tokens(1)
			await exchange.depositEther({ from: user1, value: amount })
		})

		it('returns user balances', async () => {
			const balance = await exchange.balanceOf(ETHER_ADDRESS, user1)
			balance.toString().should.equal(amount.toString())
		})
	})

	describe('making orders', () => {
		let result
		let amount

		beforeEach(async () => {
			amount = tokens(1)
			result = await exchange.makeOrder(token.address, amount, ETHER_ADDRESS, amount, { from: user1 })
		})

		it('tracks newly created order', async () => {
			const orderCount = await exchange.orderCount()
			orderCount.toString().should.equal('1')

			const order = await exchange.orders(1)
			order.id.toString().should.equal('1', 'id is correct')
			order.user.should.equal(user1, 'user is correct')
			order.tokenGet.should.equal(token.address, 'tokenGet is correct')
			order.amountGet.toString().should.equal(amount.toString(), 'amountGet is correct')
			order.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
			order.amountGive.toString().should.equal(amount.toString(), 'amountGive is correct')
			order.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
		})

		it('emits an "Order" event', async () => {
			const log = result.logs[0]
			log.event.should.eq('Order')

			const event = log.args
			event.id.toString().should.equal('1', 'id is correct')
			event.user.should.equal(user1, 'user is correct')
			event.tokenGet.should.equal(token.address, 'tokenGet is correct')
			event.amountGet.toString().should.equal(amount.toString(), 'amountGet is correct')
			event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
			event.amountGive.toString().should.equal(amount.toString(), 'amountGive is correct')
			event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
		})
	})

	describe('order actions', () => {
		let amount

		beforeEach(async () => {
			amount = tokens(1)
			// user1 deposits Ether
			await exchange.depositEther({ from: user1, value: amount})

			// user1 makes an order to buy tokens with Ether
			await exchange.makeOrder(token.address, amount, ETHER_ADDRESS, amount, { from: user1 })
		})

		describe('cancelling orders', () => {
			let result

			describe('success', () => {

				beforeEach(async () => {
					result = await exchange.cancelOrder('1', { from: user1 })
				})

				it('updates cancelled orders', async () => {
					const orderCancelled = await exchange.orderCancelled(1)
					orderCancelled.should.equal(true)
				})

				it('emits a "Cancel" event', async () => {
					const log = result.logs[0]
					log.event.should.eq('Cancel')

					const event = log.args
					event.id.toString().should.equal('1', 'id is correct')
					event.user.should.equal(user1, 'user is correct')
					event.tokenGet.should.equal(token.address, 'tokenGet is correct')
					event.amountGet.toString().should.equal(amount.toString(), 'amountGet is correct')
					event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
					event.amountGive.toString().should.equal(amount.toString(), 'amountGive is correct')
					event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
				})
			})

			describe('failure', () => {

				it('rejects invalid order ids', async () => {
					const invalidOrderId = 999999
					await exchange.cancelOrder(invalidOrderId)
					.should.be.rejectedWith(EVM_REVERT)
				})

				it('rejects unauthorized cancellations', async () => {
					// Try to cancel the order from another user
					await exchange.cancelOrder('1', { from: user2 })
					.should.be.rejectedWith(EVM_REVERT)
				})
			})
		})
	})

})
