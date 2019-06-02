# capstone-project

## Description
This repo contains Capstone project implementation with Ethereum blockchain technology.

### Basic dependencies:
NodeJs 9.10.0, Python 2.7.16, Ganache, node-gyp@3.6.2, Truffle 5.0.5, Infura, Git 2.21.0, React JS, Visual Studio C++ 2015

### Setup:
1. Install NodeJs 9.10.0 (node -v)
2. Install Python 2.7.xx (python -V)
3. Download and install microsoft Visual Studio C++ 2015 (Community edition)
4. npm install -g node-gyp@3.6.2
5. npm config set python 2.7.16 --global (npm config get python)
6. Set Microsoft version - npm config set msvs_version 2015 --global (npm config get msvs_version)
7. Set VCTargetsPath=C:\Program Files (x86)\MSBuild\Microsoft.Cpp\v4.0\V140 (In Environment Variable - User)
8. npm install --save web3@1.0.0-beta.46 (in this project path)
9.  Add Metamask and redux-devtools extensions to chrome browser
10. Signup and create project in Infura (To connect to actual ethereum blockchain)
11. Signup for Heroku (Hosting provider allows us to deploy our project)
12. Sublime text 3 with Ethereum package in the editor

### Steps to setup project:
1. Copy below dependencies into package.json and do npm install
2. truflle init - Create truffle project inside current project
3. Create file babel.rc and add required presets from babel
4. Inside truffle-config.js add required babel config, as we use es2015 in truffle
5. Create empty .env file to manage environment variables 
6. Configure .env in truffle.config
7. Change truffle.config to tell the dir where contract will reside
8. Move existing contracts dir to src as configured in above step

#### package.json:
{
  "name": "capstone-project",
  "version": "0.1.0",
  "description": "Decentralized Ethereum Token Exchange",
  "author": "Naresh Kakumani",
  "private": true,
  "dependencies": {
    #### Build candle stick chart
    "apexcharts": "3.6.3",
    #### Babel to provide ES6 features
    "babel-polyfill": "6.26.0",
    "babel-preset-env": "1.7.0",
    "babel-preset-es2015": "6.24.1",
    "babel-preset-stage-2": "6.24.1",
    "babel-preset-stage-3": "6.24.1",
    "babel-register": "6.26.0",
    #### For themeing the project
    "bootstrap": "4.3.1",
    #### Testing smart contract
    "chai": "4.2.0",
    "chai-as-promised": "7.1.1",
    "chai-bignumber": "3.0.0",
    #### To read environment variables
    "dotenv": "6.2.0",
    #### Javascrip lib for working with datastructures
    "lodash": "4.17.11",
    #### To work with time in javascript
    "moment": "2.24.0",
    #### Solidity smart contract in doing math
    "openzeppelin-solidity": "2.1.3",
    #### Create react app, building ui
    "react": "16.8.4",
    "react-apexcharts": "1.3.0",
    "react-bootstrap": "1.0.0-beta.5",
    "react-dom": "16.8.4",
    "react-redux": "5.1.1",
    "react-scripts": "2.1.3",
    #### State management
    "redux": "3.7.2",
    #### To see what happens inside redux
    "redux-logger": "3.0.6",
    #### Redeaing information out of redux
    "reselect": "4.0.0",
    #### Ensure solidity is compiling etc.
    "solidity-coverage": "0.5.11",
    ####To build smart contracts 
    "truffle": "5.0.7",
    "truffle-flattener": "1.3.0",
    "truffle-hdwallet-provider": "1.0.4",
    "truffle-hdwallet-provider-privkey": "1.0.3",
    #### Client application talk to blockchain
    "web3": "1.0.0-beta.46"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": "react-app"
  },
  "browserslist": [
    ">0.2%",
    "not dead",
    "not ie <= 11",
    "not op_mini all"
  ]
}


# References
1. https://dappuniversity.teachable.com/