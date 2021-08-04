require("@nomiclabs/hardhat-web3");
const { HardhatRuntimeEnvironment } = require('hardhat/types');
const { generatedWallets } = require('../test/generatedWallets');
const { JsonRpcProvider } = require('@ethersproject/providers');
const provider = new JsonRpcProvider("http://localhost:8545");
const accounts = generatedWallets(provider);

async function main() {
  const GhostMarketERC1155 = await ethers.getContractFactory("GhostMarketERC1155");
  const deployer = accounts[0].address
  console.log("Deploying GhostMarketERC1155...");
  const GhostMarketER1155Proxy = await upgrades.deployProxy(
    GhostMarketERC1155,
    ["GhostMarket ERC1155", "GHOST", "https://api.ghostmarket.io/metadata/polygon/"],
    { deployer, initializer: "initialize", unsafeAllowCustomTypes: true });
  //unsafeAllowCustomTypes Ignores struct mapping in AccessControl, which is fine because it's used in a mapping
  //See: https://solidity.readthedocs.io/en/v0.8.3/
  console.log("proxy deployed to:", GhostMarketER1155Proxy.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

