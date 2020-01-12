# blockchain

## Description
This repo contains examples and actual projects related to Blockchain technology.

## Dependencies
Ethereum blockchain, Solidity, Mocha, Chai, ERC20 standard, NodeJs, Web3Js, React JS, Ganache, Truffle, Infura (API to connect to a remote ethereum Node in the blockchain), 
Geth (To Run an ethereum node on local machine), Git, Visual Studio C++ 2015


### Etherscan: Is a blockchain explorer that allows to read all kinds of data from ethereum blockchain 
#### Copy an account from etherscan and try to read some details of that acccount

### Basic connection to remote ethereum blockchain
npm install web3
Type node (For node console)
var Web3 = require('web3')

var url = '<Get a link from infura>
var web3 = new Web3(url)
type web3 (Displays all the functions and data from web3 lib)

var address = '<accountAddress from etherScan>'
web3.eth.getBalance(address, (error, bal) -> { balance = bal })
balance
web3.utils.fromWei(balance, 'ether')
or
web3.utils.fromWei(balance, 'Gwei')

### Basic onnection to local blockchain (with Geth or Ganache (Test RPC))
λ node
> var Web3 = require('web3')
undefined
> var localBlockchainAddr = '<localhost ganache address>'
undefined
> var web3 = new Web3(localBlockchainAddr)
undefined
> web3.eth.getBalance('<account address from ganache>', (err, bal) => { balance = web3.utils.fromWei(bal, 'ether') })
> balance
'100'

### Basics to talk to smart contract in blockchain using web3js
### ABI - Abstract binary interface json file that tells what a smart contract could do
