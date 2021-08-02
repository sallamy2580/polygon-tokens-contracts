// Load dependencies
const { expect, use } = require('chai');
const { solidity } = require("ethereum-waffle");

use(solidity);

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  ether
} = require('@openzeppelin/test-helpers');
const { BigNumber } = require('ethers');
const { generatedWallets } = require('./generatedWallets');


const { ZERO_ADDRESS } = constants;

const { TOKEN_NAME, TOKEN_SYMBOL, BASE_URI, METADATA_JSON, POLYNETWORK_ROLE, mineTx, getCurrentBlockTime } = require('./include_in_tesfiles.js')


const { JsonRpcProvider } = require('@ethersproject/providers');
const provider = new JsonRpcProvider("http://localhost:8545");
const accounts = generatedWallets(provider);

// Start test block
describe('GhostMarketERC721', async function () {

  const minter = accounts[0].address
  const minterWallet = accounts[0]
  const transferToAccount = accounts[1].address
  const transferToWallet = accounts[1]
  const royaltiesAccount = accounts[2].address
  const royaltiesToWallet = accounts[2]
  const mintingFeeAccount = accounts[3].address
  const tokenOwner = accounts[4].address
  const tokenOwnerWallet = accounts[4]
  const signer = accounts[5].address
  console.log('minter: ', minter);
  console.log('transferToAccount: ', transferToAccount);
  console.log('royaltiesAccount: ', royaltiesAccount);
  console.log('mintingFeeAccount: ', mintingFeeAccount);

  beforeEach(async function () {
    const ghostMarketERC721ContractFactory = await ethers.getContractFactory("GhostMarketERC721");
    // Deploy a new contract before the tests
    this.GhostMarketERC721 = await upgrades.deployProxy(
      ghostMarketERC721ContractFactory,
      [TOKEN_NAME, TOKEN_SYMBOL, BASE_URI],
      { initializer: "initialize", unsafeAllowCustomTypes: true });
    console.log('Deployed test contract', this.GhostMarketERC721.address);
  });

  it("name should be " + TOKEN_NAME, async function () {
    expect((await this.GhostMarketERC721.name()).toString()).to.equal(TOKEN_NAME);
  });

  it("symbol should be " + TOKEN_SYMBOL, async function () {
    expect((await this.GhostMarketERC721.symbol()).toString()).to.equal(TOKEN_SYMBOL);
  });

  it("should support interface _INTERFACE_ID_ERC721_GHOSTMARKET", async function () {
    expect((await this.GhostMarketERC721.supportsInterface("0xee40ffc1")).toString()).to.equal('true');
  });

  it("should support interface _GHOSTMARKET_NFT_ROYALTIES", async function () {
    expect((await this.GhostMarketERC721.supportsInterface("0xe42093a6")).toString()).to.equal('true');
  });

  it("should upgrade contract", async function () {
    GhostMarketERC721_ContractFactory = await ethers.getContractFactory("GhostMarketERC721");
    GhostMarketERC721_V2_ContractFactory = await ethers.getContractFactory("TestGhostMarketERC721_V2");

    const ghostMarketERC721 = await upgrades.deployProxy(GhostMarketERC721_ContractFactory,
      [TOKEN_NAME, TOKEN_SYMBOL, BASE_URI],
      { initializer: "initialize", unsafeAllowCustomTypes: true });

    let mintingFee = 1000
    await ghostMarketERC721.setGhostmarketMintFee(mintingFee)

    //upgrade
    const ghostMarketERC721_V2 = await upgrades.upgradeProxy(ghostMarketERC721.address, GhostMarketERC721_V2_ContractFactory);

    //test new function
    expect((await ghostMarketERC721_V2.getSomething()).toString()).to.equal("10");

    //name and symbol should be the same
    expect((await ghostMarketERC721_V2.name()).toString()).to.equal(TOKEN_NAME);
    expect((await ghostMarketERC721_V2.symbol()).toString()).to.equal(TOKEN_SYMBOL);

    // increment already set _ghostmarketMintFees value
    result = await ghostMarketERC721_V2.incrementMintingFee()

    const { events } = await (
      tx = await ghostMarketERC721_V2.incrementMintingFee()
    ).wait()

    const [eventObject] = events;
    expect(eventObject.event).eq('NewMintFeeIncremented');
    expect(eventObject.args.newValue.toNumber()).eq(mintingFee + 1);

  })

  it("should transfer ownership of contract", async function () {
    await this.GhostMarketERC721.transferOwnership(transferToAccount);
    expect(await this.GhostMarketERC721.owner()).to.equal(transferToAccount)
  });

  it("should have base uri + token uri", async function () {
    await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "")
    const tokenId = await this.GhostMarketERC721.getLastTokenID()
    expect(await this.GhostMarketERC721.tokenURI(tokenId)).to.equal(BASE_URI + tokenId);
  });

  it("should have tokenId = 1", async function () {
    await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "")
    const tokenId = await this.GhostMarketERC721.getLastTokenID()
    expectEqualStringValues(tokenId, 1)
  });

  /*   it("should transfer to another account", async function () {
      await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "")
      const tokenId = await this.GhostMarketERC721.getLastTokenID()
      this.GhostMarketERC721.safeTransferFrom(minter, transferToAccount, tokenId);
      expect(await this.GhostMarketERC721.balanceOf(transferToAccount)).to.be.bignumber.equal('1')
      expect(await this.GhostMarketERC721.balanceOf(minter)).to.be.bignumber.equal('0')
    }); */


  describe('mintWithURI', function () {
    it("should revert if minter using mintWithURI function has not the POLYNETWORK_ROLE", async function () {
      const tokenId = await this.GhostMarketERC721.getLastTokenID()
      this.GhostMarketERC721.revokeRole(POLYNETWORK_ROLE, transferToAccount)
      let transferToWalletSigner = await this.GhostMarketERC721.connect(transferToWallet)
      await expectRevert(
        transferToWalletSigner.mintWithURI(minter, tokenId, tokenId, { from: transferToAccount }),
        "mintWithURI: must have POLYNETWORK_ROLE role to mint"
      );
    });

    it("should grant POLYNETWORK_ROLE to address", async function () {
      this.GhostMarketERC721.grantRole(POLYNETWORK_ROLE, transferToAccount);
      const hasPolyRole = (await this.GhostMarketERC721.hasRole(POLYNETWORK_ROLE, transferToAccount)).toString();
      expect(hasPolyRole).to.equal("true");
      this.GhostMarketERC721.mintWithURI(minter, 1, "testuri", { from: transferToAccount })
    });

    it("should mintWithURI and have given tokenURI", async function () {
      const tokenId = await this.GhostMarketERC721.getLastTokenID()
      const specialuri = "special-uri"
      await this.GhostMarketERC721.mintWithURI(minter, tokenId, specialuri)
      expect(await this.GhostMarketERC721.tokenURI(tokenId)).to.equal(BASE_URI + specialuri);
    });


  });

  it("should revert if externalURI is empty", async function () {
    await expectRevert(
      this.GhostMarketERC721.mintGhost(minter, [], "", "", ""),
      "externalURI can't be empty"
    );
  });

  it("should mintGhost with new URI", async function () {
    const newURI = "new.app/"
    await this.GhostMarketERC721.setBaseTokenURI(newURI);
    await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "")
    const tokenId = await this.GhostMarketERC721.getLastTokenID()
    expect(await this.GhostMarketERC721.tokenURI(tokenId)).to.equal(newURI + tokenId);
  });

  it("should mintGhost with URI", async function () {
    await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "")
    const tokenId = await this.GhostMarketERC721.getLastTokenID()
    expect(await this.GhostMarketERC721.tokenURI(tokenId)).to.equal(BASE_URI + tokenId);
  });

  describe('burn NFT', function () {
    it('should burn a single NFT', async function () {
      await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "")
      //confirm its minted
      const tokenId = await this.GhostMarketERC721.getLastTokenID()
      expectEqualStringValues(await this.GhostMarketERC721.balanceOf(minter), 1)
      expect(await this.GhostMarketERC721.ownerOf(tokenId)).to.equal(minter)

      let minterWalletSigner = await this.GhostMarketERC721.connect(minterWallet)
      await minterWalletSigner.burn(tokenId)
      //token should not exists anymore
      await expectRevert(
        this.GhostMarketERC721.ownerOf(tokenId),
        "revert ERC721: owner query for nonexistent token"
      );
    });

    it('should burn multiple NFTs', async function () {
      const tokenIDs = [1, 2, 3, 4, 5]
      for (const i of tokenIDs) {
        await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "")
      }

      //confirm minted tokens
      expectEqualStringValues(await this.GhostMarketERC721.balanceOf(minter), tokenIDs.length)
      for (const i of tokenIDs) {
        expect(await this.GhostMarketERC721.ownerOf(i)).to.equal(minter)
      }
      let minterWalletSigner = await this.GhostMarketERC721.connect(minterWallet)

      await minterWalletSigner.burnBatch(tokenIDs)
      for (const i of tokenIDs) {
        await expectRevert(
          this.GhostMarketERC721.ownerOf(i),
          "revert ERC721: owner query for nonexistent token"
        );
      }
    });

    it('should revert if not-owner tries to burn a NFTs', async function () {
      const tokenIDs = [1, 2]
      for (const i of tokenIDs) {
        await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "")
      }

      //confirm minted tokens
      expectEqualStringValues(await this.GhostMarketERC721.balanceOf(minter), tokenIDs.length)
      for (const i of tokenIDs) {
        expect(await this.GhostMarketERC721.ownerOf(i)).to.equal(minter)
      }

      await expectRevert(
        this.GhostMarketERC721.burnBatch(tokenIDs, { from: transferToAccount }),
        "ERC721Burnable: caller is not owner nor approved"
      );
    });
  });

  describe('mint NFT', function () {
    it('should mint tokens, nft owner = contract deployer', async function () {
      await expect(await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", ""))
        .to.emit(this.GhostMarketERC721, 'Minted')
        .withArgs(minter, 1, "ext_uri");

      expectEqualStringValues(await this.GhostMarketERC721.balanceOf(minter), 1)
      const tokenId = await this.GhostMarketERC721.getLastTokenID()
      expect(await this.GhostMarketERC721.ownerOf(tokenId)).to.equal(minter)
      const tokenURI = await this.GhostMarketERC721.tokenURI(tokenId)
      //expectEvent(result, 'Minted', { toAddress: minter, tokenId: tokenId, externalURI: "ext_uri" })

    });

    it('should mint tokens, nft owner = transferToAccount', async function () {
      await this.GhostMarketERC721.mintGhost(transferToAccount, [], "ext_uri", "", "")
      expectEqualStringValues(await this.GhostMarketERC721.balanceOf(transferToAccount), 1)
      const tokenId = await this.GhostMarketERC721.getLastTokenID()
      expect(await this.GhostMarketERC721.ownerOf(tokenId)).to.equal(transferToAccount)
    });

    it('should set royalties', async function () {
      const royaltyValue = 100
      await this.GhostMarketERC721.mintGhost(minter, [{ recipient: royaltiesAccount, value: royaltyValue }], "ext_uri", "", "");
      const tokenId = await this.GhostMarketERC721.getLastTokenID()
      const royalties = await this.GhostMarketERC721.getRoyalties(tokenId)
      expect(royalties.length).to.equal(1);
      expectEqualStringValues(royalties[0].recipient, royaltiesAccount)
      expectEqualStringValues(royalties[0].value, royaltyValue)
    });

    it('should mint tokens with royalty fees', async function () {
      const royaltyValue = 100
      const minterAccountNFTbalance = parseInt((await this.GhostMarketERC721.balanceOf(minter)).toString())

      const { events } = await (
        tx = await this.GhostMarketERC721.mintGhost(minter, [{ recipient: royaltiesAccount, value: royaltyValue }], "ext_uri", "", "")
      ).wait()
      const tokenId = await this.GhostMarketERC721.getLastTokenID()


      const [eventObject] = events;
      expect(eventObject.event).eq('Transfer');
      expect(eventObject.args.from).eq(ZERO_ADDRESS);
      expect(eventObject.args.to).eq(minter);
      expect((eventObject.args.tokenId).toString()).to.equal((tokenId).toString());

      //expectEvent(receipt, 'Transfer', { from: ZERO_ADDRESS, to: minter, tokenId });
      expect(parseInt((await this.GhostMarketERC721.balanceOf(minter)).toString())).to.equal(minterAccountNFTbalance + 1);
      expect(await this.GhostMarketERC721.ownerOf(tokenId)).to.equal(minter);
      const royaltyValues = await this.GhostMarketERC721.getRoyaltiesBps(tokenId);
      const royaltyRecepient = await this.GhostMarketERC721.getRoyaltiesRecipients(tokenId);
      expect(royaltyValues.length).to.equal(1);
      expect(royaltyRecepient[0]).to.be.bignumber.equal(royaltiesAccount.toString());
      expect(royaltyValues[0].toString()).to.be.bignumber.equal(royaltyValue.toString());
    });

    it('should revert if royalty is more then 50%', async function () {
      const royaltyValue = 5001
      await expectRevert(this.GhostMarketERC721.mintGhost(minter, [{ recipient: royaltiesAccount, value: royaltyValue }], "ext_uri", "", ""),
        "Royalties value should not be more than 50%"
      );
    });

    it('should mint tokens WITHOUT royalty fees', async function () {
      const minterAccountNFTbalance = parseInt((await this.GhostMarketERC721.balanceOf(minter)).toString())

      const { events } = await (
        tx = await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "")
      ).wait()
      const tokenId = await this.GhostMarketERC721.getLastTokenID()

      const [eventObject] = events;
      expect(eventObject.event).eq('Transfer');
      expect(eventObject.args.from).eq(ZERO_ADDRESS);
      expect(eventObject.args.to).eq(minter);
      expect((eventObject.args.tokenId).toString()).to.equal((tokenId).toString());

      expect(parseInt((await this.GhostMarketERC721.balanceOf(minter)).toString())).to.equal(minterAccountNFTbalance + 1);
      expect(await this.GhostMarketERC721.ownerOf(tokenId)).to.equal(minter);
      const values = await this.GhostMarketERC721.getRoyaltiesBps(tokenId);
      expect(values).to.be.empty;
    });

    it('should mint with json string', async function () {
      await this.GhostMarketERC721.mintGhost(transferToAccount, [], "ext_uri", METADATA_JSON, "")
      const tokenId = await this.GhostMarketERC721.getLastTokenID()
      expect(await this.GhostMarketERC721.getMetadataJson(tokenId)).to.equal(METADATA_JSON)
    });

    it('everybody can mint', async function () {
      this.GhostMarketERC721.mintGhost(transferToAccount, [], "ext_uri", "", "", { from: mintingFeeAccount })
    });
  });

  describe('mint NFT with fee', function () {
    it('should mint if setGhostmarketMintFee is set to 0', async function () {
      const feeAddressEthBalanceBefore = await web3.eth.getBalance(this.GhostMarketERC721.address)

      await this.GhostMarketERC721.setGhostmarketMintFee(0)

      await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "")
      const feeAddressEthBalanceAfter = await web3.eth.getBalance(this.GhostMarketERC721.address)
      expect(parseInt(feeAddressEthBalanceAfter)).to.equal(parseInt(feeAddressEthBalanceBefore))
    });

    it('should send fee to mintingFeeAccount', async function () {
      const value = ether('0.1').toString();
      await this.GhostMarketERC721.setGhostmarketMintFee(value)
      const feeAddressEthBalanceBefore = await web3.eth.getBalance(this.GhostMarketERC721.address)
      await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "", { value: value })
      const feeAddressEthBalanceAfter = await web3.eth.getBalance(this.GhostMarketERC721.address)
      expect(parseInt(feeAddressEthBalanceAfter)).to.equal(parseInt(feeAddressEthBalanceBefore) + parseInt(value))
    });

    it('should send fee to mintingFeeAccount from another minting account', async function () {
      const value = ether('0.1').toString();
      await this.GhostMarketERC721.setGhostmarketMintFee(value)
      const feeAddressEthBalanceBefore = await web3.eth.getBalance(this.GhostMarketERC721.address)
      let royaltiesWalletSigner = await this.GhostMarketERC721.connect(royaltiesToWallet)

      await royaltiesWalletSigner.mintGhost(minter, [], "ext_uri", "", "", { value: value, from: royaltiesAccount })
      const feeAddressEthBalanceAfter = await web3.eth.getBalance(this.GhostMarketERC721.address)
      expect(parseInt(feeAddressEthBalanceAfter)).to.equal(parseInt(feeAddressEthBalanceBefore) + parseInt(value))
    });
  });

  describe('withdraw from contract', function () {
    it('should withdraw all available balance from contract', async function () {
      const value = ether('0.1');
      await this.GhostMarketERC721.setGhostmarketMintFee(value)
      const feeAddressEthBalanceBefore = await web3.eth.getBalance(this.GhostMarketERC721.address)
      await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "", { value: value, from: royaltiesAccount })
      await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "", { value: value, from: royaltiesAccount })
      await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "", { value: value, from: royaltiesAccount })
      const feeAddressEthBalanceAfter = await web3.eth.getBalance(this.GhostMarketERC721.address)
      await this.GhostMarketERC721.withdraw(feeAddressEthBalanceAfter)
      expect(await web3.eth.getBalance(this.GhostMarketERC721.address)).to.equal('0')
    });

    it('should revert trying to withdraw more then the contract balance', async function () {
      const value = ether('0.1');
      await this.GhostMarketERC721.setGhostmarketMintFee(value)
      const feeAddressEthBalanceBefore = await web3.eth.getBalance(this.GhostMarketERC721.address)
      await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "", { value: value })
      await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "", { value: value })
      await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "", { value: value })
      const feeAddressEthBalanceAfter = await web3.eth.getBalance(this.GhostMarketERC721.address)
      await expectRevert(this.GhostMarketERC721.withdraw(feeAddressEthBalanceAfter + value),
        "Withdraw amount should be greater then 0 and less then contract balance"
      );
    });

    it('should revert if other then the contract owner tries to withdraw', async function () {
      const value = ether('0.1');
      await this.GhostMarketERC721.setGhostmarketMintFee(value)
      await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "", { value: value })
      await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "", { value: value })
      await this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "", { value: value })
      const feeAddressEthBalanceAfter = await web3.eth.getBalance(this.GhostMarketERC721.address)
      await expectRevert(this.GhostMarketERC721.withdraw(feeAddressEthBalanceAfter, { from: royaltiesAccount }),
        "Ownable: caller is not the owner"
      );
    });
  });

  describe('locked content', function () {
    const hiddencontent = "top secret"
    it("should set and get locked content for nft", async function () {
      this.GhostMarketERC721.mintGhost(transferToAccount, [], "ext_uri", "", hiddencontent)
      const tokenId = await this.GhostMarketERC721.getLastTokenID()
      const { logs } = await this.GhostMarketERC721.getLockedContent.sendTransaction(tokenId, { from: transferToAccount })
      expectEvent.inLogs(logs, 'LockedContentViewed', {
        msgSender: transferToAccount,
        tokenId: tokenId,
        lockedContent: hiddencontent,
      });
    });

    it("should revert if other then token owner tries to fetch locked content", async function () {
      this.GhostMarketERC721.mintGhost(transferToAccount, [], "ext_uri", "", hiddencontent)
      const tokenId = await this.GhostMarketERC721.getLastTokenID()
      await expectRevert(this.GhostMarketERC721.getLockedContent(tokenId),
        "Caller must be the owner of the NFT"
      );
    });

    it("should increment locked content view count", async function () {
      this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", hiddencontent)
      const tokenId = await this.GhostMarketERC721.getLastTokenID()
      const currentCounter = await this.GhostMarketERC721.getCurrentLockedContentViewTracker(tokenId)
      // call two times the getLockedContent function, counter should increment by 2
      await this.GhostMarketERC721.getLockedContent(tokenId)
      await this.GhostMarketERC721.getLockedContent(tokenId)
      expect(await this.GhostMarketERC721.getCurrentLockedContentViewTracker(tokenId)).to.be.bignumber.equal((currentCounter + 2).toString());
      // mint another NFT
      this.GhostMarketERC721.mintGhost(minter, [], "ext_uri", "", "top secret2")
      const tokenId2 = await this.GhostMarketERC721.getLastTokenID()
      const currentCounter2 = await this.GhostMarketERC721.getCurrentLockedContentViewTracker(tokenId2)
      await this.GhostMarketERC721.getLockedContent(tokenId2)
      expect(await this.GhostMarketERC721.getCurrentLockedContentViewTracker(tokenId2)).to.be.bignumber.equal((currentCounter2 + 1).toString());
    });
  });

  function expectEqualStringValues(value1, value2) {
    expect(value1.toString()).to.equal(value2.toString())
  }
});