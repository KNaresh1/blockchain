
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

contract('Exchange', ([deployer, feeAccount, user1]) => {
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
})
