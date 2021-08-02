const {
  BN,           // Big Number support
} = require('@openzeppelin/test-helpers');

//const GHOSTMARKET_ERC721_ARTIFACT = artifacts.require("GhostMarketERC721");
//const GHOSTMARKET_ERC1155 = artifacts.require("GhostMarketERC1155");
const TOKEN_NAME = "GhostMarket"
const TOKEN_SYMBOL = "GHOST"
const BASE_URI = "https://ghostmarket.io/"
const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6"
const PAUSER_ROLE = "0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a"
const POLYNETWORK_ROLE = "0x8a9d57248f1015d5cac20111fe2512477434cf493627e5e959ca751e593d8079"
const METADATA_JSON = '{"name":"My NFT Name","description":"My NFT Name","image":"ipfs://QmWpUHUKjcYbhqGtxHnH39F5tLepfztGQAcYtsnHtWfgjD","external_url":"extURI","attributes":[{"type":"AttrT1","value":"AttrV1","display":""},{"type":"AttrT2","value":"AttrV2","display":""}],"properties":{"has_locked":true,"creator":"0x9e1bd73820a607b06086b5b5173765a61ceee7dc","royalties":0,"type":2}}'

/**
 * returns the last minted token
 * interacts with the blockchain and needs to be async
 * 
 * @param {proxy contract} token 
 * @returns {BN} last minted token ID as Big Number
 */
async function getLastTokenID(token) {
  let counter = await token.getCurrentCounter()
  if ( counter == 0) {
    return new BN(parseInt(counter));
  } else return new BN(parseInt(counter - 1));
}

const toTxHash = (value) => {
  if (typeof value === "string") {
    // this is probably a tx hash already
    return value;
  } else if (typeof value.receipt === "object") {
    // this is probably a tx object
    return value.receipt.transactionHash;
  } else {
    throw "Unsupported tx type: " + value;
  }
}

const mineTx = (promiseOrTx, interval) => {
  return Promise.resolve(promiseOrTx)
    .then(tx => {
      const txHash = toTxHash(tx);

      return new Promise((resolve, reject) => {
        const getReceipt = () => {
          web3.eth.getTransactionReceipt(txHash, (error, receipt) => {
            if (error) {
              reject(error);
            } else if (receipt) {
              resolve(receipt);
            } else {
              setTimeout(getReceipt, interval || 500);
            }
          })
        }

        getReceipt();
      })
    });
}

async function getCurrentBlockTime() {
  blockNum = await web3.eth.getBlockNumber()
  block = await web3.eth.getBlock(blockNum)
  const date = new Date(block['timestamp'] * 1000);
  //console.log("currentBlockTime: ", date.toLocaleString());
  return date
}

module.exports = {
  //GHOSTMARKET_ERC721_ARTIFACT,
  //GHOSTMARKET_ERC1155,
  TOKEN_NAME,
  TOKEN_SYMBOL,
  BASE_URI,
  METADATA_JSON,
  POLYNETWORK_ROLE,
  getLastTokenID,
  mineTx,
  getCurrentBlockTime
}
