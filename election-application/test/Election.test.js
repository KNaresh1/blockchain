const Election = artifacts.require('./Election.sol')

contract('Election', (accounts) => {
	before(async() => {
		this.election = await Election.deployed()
	})

	it('deploys successfully', async() => {
		const address = await this.election.address
		assert.notEqual(address, '0x0')
		assert.notEqual(address, '')
		assert.notEqual(address, null)
		assert.notEqual(address, undefined)
	})

	it('initializes with two candidates', async() => {
		const candidatesCount = await this.election.candidatesCount()
		assert.equal(candidatesCount, 2)
	})

	it('initializes the candidates with correct values', async() => {
		const candidate1 = await this.election.candidates(1)
		assert.equal(candidate1[0], 1, 'contains the correct id')
		assert.equal(candidate1[1], 'Candidate 1', 'contains the correct name')
		assert.equal(candidate1[2], 0, 'contains the correct votes count')

		const candidate2 = await this.election.candidates(2)
		assert.equal(candidate2[0], 2, 'contains the correct id')
		assert.equal(candidate2[1], 'Candidate 2', 'contains the correct name')
		assert.equal(candidate2[2], 0, 'contains the correct votes count')
	})

})