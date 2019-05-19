# todo-list-application-ethereum

## Description
This repo contains Todo list project implementation with Ethereum blockchain technology.

## Dependencies
NodeJs 9.10.0, Python 2.7.16, React JS, Ganache, Truffle 5.0.5, Infura

### Steps:
1. Create TodoList.sol and implement smart contract.
2. truffle compile
3. Create deploy_contract.js which basically migrates the state of blockchain with new smart contract.
4. truffle migrate (which create artifactory to be deployed)
5. truffle console
6. todoList = await TodoList.deployed() (Asynchronous way of deploying)
7. Now you can read the data from blockchain:
	toList.address (gets address of the smart contract)
	toList.taskCount() (smart contract method)
	taskCount = await todoList.taskCount()
	taskCount.toNumber()


# References
1. http://www.dappuniversity.com/