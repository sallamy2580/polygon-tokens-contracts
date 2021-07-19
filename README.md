# GhostMarket NFT ERC721 & ERC1155 Contracts
## Audit

Coming soon...
## Technical Information

Upgradable ERC721 & ERC1155 Contract.

Using OpenZeppelin contracts.
### Compiling contracts
```
hardhat compile
```
### Deploying Proxy

Using hardhat to deploy proxy contracts

Contracts can be deployed

#### locally

```
hardhat run scripts/deployERC721.js  

hardhat run scripts/deployERC1155.js
```

#### to network
```
hardhat --network <network_name> scripts/<deploy_script>.js
```
For local deployment ganache must be started and private keys saved into

```
.secrets.json
```

## Testing

tests can be run with:

```
./runGhostMarketERC721_tests.sh
```

default network is `test` or a network parameter can be added

```
./runGhostMarketERC721_tests.sh polygontestnet
```

## Verifying contracts

```
hardhat verify --network <network_name> <0x_contract_address>
```

Check if verification was a success:

[mumbai testnet](https://mumbai.polygonscan.com/)

[mainnet](https://polygonscan.com/)

### running individual tests

choose a test file
```
truffle test/<testname>.js
```

with the .only flag individual test can be run  
```
it.only("should run this test") async function () {
  ...
}
```



