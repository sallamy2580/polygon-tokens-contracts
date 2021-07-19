require("@nomiclabs/hardhat-web3");
const { HardhatRuntimeEnvironment } = require('hardhat/types');
const { generatedWallets } = require('../test/generatedWallets');
const { JsonRpcProvider } = require('@ethersproject/providers');
const provider = new JsonRpcProvider("http://localhost:8545");
const accounts = generatedWallets(provider);

async function main() {
  const GhostMarketERC721 = await ethers.getContractFactory("GhostMarketERC721");
  const deployer = accounts[0].address
  console.log("Deploying GhostMarketERC721...");
  const GhostMarketERC721Proxy = await upgrades.deployProxy(
    GhostMarketERC721,
    ["GhostMarket ERC1155", "GHOST", "https://api.ghostmarket.io/metadata/polygon/"],
    { deployer, initializer: "initialize", unsafeAllowCustomTypes: true });
  //unsafeAllowCustomTypes Ignores struct mapping in AccessControl, which is fine because it's used in a mapping
  //See: https://solidity.readthedocs.io/en/v0.8.3/
  console.log("deployed to:", GhostMarketERC721Proxy.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

