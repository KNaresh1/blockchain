const Token = artifacts.require("Token");
const Exchange = artifacts.require('Exchange')

module.exports = async function(deployer) {
	const accounts = await web3.eth.getAccounts()

	// Deploy Token
	await deployer.deploy(Token);

	const feeAccount = accounts[0]
	const feePercent = 10

	// Deploy Exchange
	await deployer.deploy(Exchange, feeAccount, feePercent)
};
