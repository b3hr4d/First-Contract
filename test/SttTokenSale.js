var SttToken = artifacts.require("./SttToken.sol");
var SttTokenSale = artifacts.require("./SttTokenSale.sol");

contract("SttTokenSale", async function (accounts) {
  var tokenInstance;
  var tokenSaleInstance;
  const tokenPrice = 10000000000000;
  const tokensAvailable = 1000000;
  const tokenSaleAvailable = 750000;
  const admin = accounts[0];
  const buyer = accounts[3];
  const numberOfTokens = 10;

  it("initializes the contract with the provided value", async function () {
    tokenSaleInstance = await SttTokenSale.deployed();

    const tokenSaleAddress = await tokenSaleInstance.address;
    assert.notEqual(tokenSaleAddress, 0x0, "has a contract address");

    const TokenContract = await tokenSaleInstance.tokenContract();
    assert.notEqual(TokenContract, 0x0, "has a token contract address");

    const TokenPrice = await tokenSaleInstance.tokenPrice();
    assert.equal(TokenPrice, tokenPrice, "has a currect price");
  });

  it("facialites token buying", async function () {
    tokenInstance = await SttToken.deployed();
    tokenSaleInstance = await SttTokenSale.deployed();
    // provision 75% of all of token to token sale
    await tokenInstance.transfer(
      tokenSaleInstance.address,
      tokenSaleAvailable,
      {
        from: admin,
      }
    );

    const receipt = await tokenSaleInstance.buyTokens(numberOfTokens, {
      from: buyer,
      value: numberOfTokens * tokenPrice,
    });
    assert.equal(receipt.logs.length, 1, "trigger one event");
    assert.equal(receipt.logs[0].event, "Sell", "Should be transfer event");
    assert.equal(
      receipt.logs[0].args._buyer,
      buyer,
      "logs the account that purchased the tokens"
    );
    assert.equal(
      receipt.logs[0].args._amount,
      numberOfTokens,
      "logs the number of token purchased"
    );

    const tokenSold = await tokenSaleInstance.tokenSold();
    assert.equal(
      tokenSold,
      numberOfTokens,
      "Increment the number of tokens sold"
    );

    const tokenBalance = await tokenInstance.balanceOf(admin);
    assert.equal(
      tokenBalance.toNumber(),
      tokensAvailable - tokenSaleAvailable,
      "Total ERC20 Available token"
    );

    const tokenSaleBalance = await tokenInstance.balanceOf(
      tokenSaleInstance.address
    );
    assert.equal(
      tokenSaleBalance.toNumber(),
      tokenSaleAvailable - numberOfTokens,
      "Total ICO Available token"
    );

    const buyerBalance = await tokenInstance.balanceOf(buyer);
    assert.equal(
      buyerBalance.toNumber(),
      numberOfTokens,
      "Number of token sold to buyer"
    );

    try {
      await tokenSaleInstance.buyTokens(numberOfTokens, {
        from: buyer,
        value: 1,
      });
      assert.fail();
    } catch (error) {
      assert(
        error.message.indexOf("revert") >= 0,
        "msg.value must equal number of token in wei"
      );
    }

    try {
      await tokenSaleInstance.buyTokens(800000, {
        from: buyer,
        value: 800000 * tokenPrice,
      });
      assert.fail();
    } catch (error) {
      assert(
        error.message.indexOf("revert") >= 0,
        "Cannot purchase More Tokens than available"
      );
    }
  });

  it("Ends Token Sales", async function () {
    tokenInstance = await SttToken.deployed();
    tokenSaleInstance = await SttTokenSale.deployed();

    try {
      await tokenSaleInstance.endSale({
        from: buyer,
      });
      assert.fail();
    } catch (error) {
      assert(
        error.message.indexOf("revert") >= 0,
        "Must be admin to end of the sale"
      );
    }

    await tokenSaleInstance.endSale({ from: admin });

    const remainBalance = await tokenInstance.balanceOf(admin);
    assert.equal(
      remainBalance.toNumber(),
      999990,
      "Return all unsold STT to Admin"
    );

    try {
      await tokenSaleInstance.tokenPrice();
      assert.fail();
    } catch (error) {
      assert(
        error.message.indexOf("Returned values aren't valid") >= 0,
        "Must be destroyed to end of the sale"
      );
    }
  });
});
