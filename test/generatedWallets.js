const ethers = require('ethers')


const { JsonRpcProvider } = require('@ethersproject/providers');
const provider = new JsonRpcProvider("http://localhost:8545");

const { LOCAL_PRIVATE_KEYS } = require('../.secrets.json');
/**
 * 
 * @param {ethers.providers.BaseProvider} provider 
 * @returns 
 */
function generatedWallets(provider) {
  return LOCAL_PRIVATE_KEYS.map((key) => {
    return new ethers.Wallet(key, provider);
  });
}
/**
 * 
 * @param {*} message 
 * @param {ethers.Wallet} wallet 
 * @returns 
 */
async function signMessage(message, wallet) {
  const messageHash = ethers.utils.id(message);
  const messageHashBytes = ethers.utils.arrayify(messageHash);
  const flatSig = await wallet.signMessage(messageHashBytes);
  return ethers.utils.arrayify(flatSig);
}

function getAccountAddresses() {
  const walletAccounts = generatedWallets(provider);
  let accounts = []
  for (i = 0; i < walletAccounts.length; i++) {
    console.log("account address: ", walletAccounts[i].address)
    accounts.push(walletAccounts[i].address)
  }
  return accounts
}

module.exports = { generatedWallets, signMessage, getAccountAddresses }

