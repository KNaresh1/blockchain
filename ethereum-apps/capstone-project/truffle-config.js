require('babel-register');
require('babel-polyfill');
require('dotenv').config();

module.exports = {

  // Configure blockchain network to which app should connect
  networks: {
    development: {
      host: "127.0.0.1",
      port: "7545",
      network_id: "*" // Match any network id
    },
  },

  // Configure contracts and abis (Json version of Smart Contract) dir where truffle should look for
  contracts_directory: './src/contracts',
  contracts_build_directory: './src/abis',

  // Configure solidity compiler version. o Solidity is a compiled language, all contracts src will be 
  // compiled into byte code that can be executed on Ethereum VM running on Ethereum node. 
  // Truffle is responsible for this
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
