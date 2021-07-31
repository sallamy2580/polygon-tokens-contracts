require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require("@nomiclabs/hardhat-ganache");
require("@nomiclabs/hardhat-web3");
require('hardhat-abi-exporter');
require("@nomiclabs/hardhat-etherscan");

const {
  ALCHEMY_PROJECT_ID,
  INFURA_PROJECT_ID_CYX,
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
    rinkeby: {
      url: 'https://eth-rinkeby.alchemyapi.io/v2/' + ALCHEMY_PROJECT_ID,
      //url: "https://rinkeby.infura.io/v3/" + INFURA_PROJECT_ID_CYX,
      accounts: BSC_TESTNET_PRIVATE_KEY
    },
    polygontestnet: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: POLYGON_TESTNET_PRIVATE_KEY
    },
    mainnet: {
      url: "https://rpc-mainnet.matic.network",
      //url: "https://polygon-mumbai.infura.io/v3/" + INFURA_PROJECT_ID,
      // url: " https://polygon-mumbai.g.alchemy.com/v2/" + ALCHEMY_PROJECT_ID,
      accounts: POLYGON_MAINNET_PRIVATE_KEY
    },
  },
  etherscan: {
    apiKey: POLYGONSCAN_API_KEY
  },
  mocha: {
    timeout: 200000
  }
};