# web3js commands

#### Get web3 package from npm
node> var Web3 = require('web3')

#### Connect to remote ethereum blockchain through Infura
node> var web3 = new Web3('https://mainnet.infura.io/DkljaeElj232klj')

#### Connect to local blockchain through Ganache
node> var web3= new Web3('HTTP://127.0.0.1:7545')

#### Fetch accounts available on the connected network
node> web3.eth.accounts

#### To fetch balance for given account
node> web3.eth.getBalance(accountAddress, (err, bal) => {balance = bal})
node> web3.utils.fromWei(balance, 'ether')
node> web3.utils.fromWei(balance, 'Gewi')

#### Read contracts from ethereum blockchain
node> var contract = new web3.eth.Contract(abi, contractAddress)
#### Get contract name (contracts are Tokens)
node> contract.methods.name().call((err, result) => {console.log(result)})
#### Get contract symbol (Token)
node> contract.methods.symbol().call((err, result) => {console.log(result)})
#### Get contract/token holders account balance
node> contract.methods.balanceOf(accountAddress).call((err, result) => {console.log(result)})
