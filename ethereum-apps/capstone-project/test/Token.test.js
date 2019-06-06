const Token = artifacts.require('./Token')

require('chai')
		.use(require('chai-as-promised'))
		.should()

// Below helper code should be moved to helpers.js
// import { tokens, EVM_REVERT } from './helpers'
const EVM_REVERT = 'VM Exception while processing transaction: revert'
const INVALID_ADDRESS = 'invalid address (arg="_to", coderType="address", value=0)';

const tokens = (n) => {
	return new web3.utils.BN(
		web3.utils.toWei(n.toString(), 'ether')
	)
}

// contract('Token', (accounts) {}  is written in ES6 syntax belos
contract('Token', ([deployer, receiver, exchange]) => {
	let token

	beforeEach(async () => {
		// Fetch token from blockchain
		token = await Token.new()
	})

	describe('deployment', async () => {
		const name = 'DApp Token'
		const symbol = 'DAPP'
		const decimals = '18'
		const totalSupply = tokens(1000000).toString()

		it('tracks the name' , async () => {
				const result = await token.name()
				result.should.equal(name)
		})
		it('tracks the symbol', async () => {
			const result = await token.symbol()
			result.should.equal(symbol)
		})
		it('tracks the decimals', async () => {
			const result = await token.decimals()
			result.toString().should.equal(decimals)
		})
		it('tracks the totalSuppy', async () => {
			const result = await token.totalSupply()
			result.toString().should.equal(totalSupply)
		})
		it('assigns the totalSupply to the deployer', async () => {
			const result = await token.balanceOf(deployer)
			result.toString().should.equal(totalSupply)
		})
	})

	describe('sending tokens', () => {
		let result
		let amount

		describe('success', () => {

			beforeEach(async () => {
				amount = tokens(100)
				result = await token.transfer(receiver, amount, { from: deployer })
			})

			it('transfers token balances', async () => {
				let balanceOf

				balanceOf = await token.balanceOf(deployer)
				balanceOf.toString().should.equal(tokens(999900).toString())
				balanceOf = await token.balanceOf(receiver)
				balanceOf.toString().should.equal(tokens(100).toString())
			})

			it('emits a Transfer event', async () => {
				const log = result.logs[0]
				log.event.should.equal('Transfer', 'emitted event is correct')

				const event = log.args
				event.from.toString().should.equal(deployer, 'sender is correct')
				event.to.toString().should.equal(receiver, 'receiver is correct')
				event.value.toString().should.equal(amount.toString(), 'transfer amount is correct')
			})
		})

		describe('failure', async () => {
			it('rejects insufficient balances', async () => {

				// 100 million > totalSuplly (1 million)
				await token.transfer(receiver, tokens(100000000), { from: deployer }) 
				.should.be.rejectedWith(EVM_REVERT)

				// Attempt to transfer when sender have no tokens (deployer = receiver, receiver = sender)
				await token.transfer(deployer, tokens(100), { from: receiver })
				.should.be.rejectedWith(EVM_REVERT)
			})

			it('rejects invalid receipient', async () => {
				await token.transfer(0x0, tokens(100), { from: deployer })
				.should.be.rejectedWith(INVALID_ADDRESS)
			})
		})
	})

	describe('approving tokens', () => {
		let amount
		let result

		beforeEach(async () =>{
			amount = tokens(100)
			result = await token.approve(exchange, amount, { from: deployer })
		})

		describe('success', () => {
			it('allocates an allowance for delegated token spending on exchange', async () => {
				const allowance = await token.allowance(deployer, exchange)
				allowance.toString().should.equal(amount.toString())
			})

			it('emits Approval event', async () => {
				const log = result.logs[0]
				log.event.should.equal('Approval', 'emitted event is correct')

				const event = log.args
				event.owner.toString().should.equal(deployer, 'owner is correct')
				event.spender.toString().should.equal(exchange, 'spender is correct')
				event.value.toString().should.equal(amount.toString(), 'approval amount is correct')
			})
		})

		describe('failure', () => {
			it('rejects invalid spenders', async () => {
				await token.approve(0x0, amount, { from: deployer })
				.should.be.rejectedWith('invalid address (arg="_spender", coderType="address", value=0)')
			})
		})
	})

	describe('delegated token transfers', () => {
		let result
		let amount

		beforeEach(async () => {
			amount = tokens(100)
			await token.approve(exchange, amount, { from: deployer })
		})

		describe('success', () => {

			beforeEach(async () => {
				result = await token.transferFrom(deployer, receiver, amount, { from: exchange })
			})

			it('transfers token balances', async () => {
				let balanceOf

				balanceOf = await token.balanceOf(deployer)
				balanceOf.toString().should.equal(tokens(999900).toString())
				balanceOf = await token.balanceOf(receiver)
				balanceOf.toString().should.equal(tokens(100).toString())
			})

			it('emits a Transfer event', async () => {
				const log = result.logs[0]
				log.event.should.equal('Transfer', 'emitted event is correct')

				const event = log.args
				event.from.toString().should.equal(deployer, 'sender is correct')
				event.to.toString().should.equal(receiver, 'receiver is correct')
				event.value.toString().should.equal(amount.toString(), 'transfer amount is correct')
			})
		})

		describe('failure', async () => {
			it('rejects insufficient amounts', async () => {
				await token.transferFrom(deployer, receiver, tokens(100000000), { from: exchange })
				.should.be.rejectedWith(EVM_REVERT)
			})

			it('rejects invalid recipients', async () => {
				await token.transferFrom(deployer, 0x0, amount, { from: exchange })
				.should.be.rejectedWith(INVALID_ADDRESS)
			})
		})
	})
})