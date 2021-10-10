require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-ganache");
require("@nomiclabs/hardhat-web3");
require('hardhat-abi-exporter');
require("@nomiclabs/hardhat-etherscan");

const {
  POLYGON_TESTNET_PRIVATE_KEY,
  POLYGON_MAINNET_PRIVATE_KEY,
  POLYGONSCAN_API_KEY
} = require('./.secrets.json');

task("accounts", "Prints accounts", async (_, { web3 }) => {

  console.log(await web3.eth.getAccounts());

});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.4",    // Fetch exact version from solc-bin (default: truffle's version)
    settings: {          // See the solidity docs for advice about optimization and evmVersion
      optimizer: {
        enabled: true,
        runs: 1337
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  networks: {
    hardhat: {
    },
    polygontestnet: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: POLYGON_TESTNET_PRIVATE_KEY,
      gasPrice: 8000000000
    },
    polygonmainnet: {
      url: "https://rpc-mainnet.maticvigil.com/",
      accounts: POLYGON_MAINNET_PRIVATE_KEY,
      gasPrice: 8000000000
    },
  },
  etherscan: {
    apiKey: POLYGONSCAN_API_KEY
  },
  mocha: {
    timeout: 200000
  }
};