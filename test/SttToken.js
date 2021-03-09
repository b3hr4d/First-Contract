var SttToken = artifacts.require("./SttToken.sol");

contract("sttToken", async function (accounts) {
  var tokenInstance;
  it("initializes the contract with the provided value", async function () {
    tokenInstance = await SttToken.deployed();
    var tokenName = await tokenInstance.name();
    var tokenSymbol = await tokenInstance.symbol();
    var tokenStandard = await tokenInstance.standard();

    assert.equal(tokenName, "Smart World Token", "has the currect name");
    assert.equal(tokenSymbol, "STT", "has the currect symbol");
    assert.equal(tokenStandard, "STT Token v1.0", "has the currect standard");
  });

  it("sets the initial supply upon deployment", async function () {
    tokenInstance = await SttToken.deployed();
    var totalSupply = await tokenInstance.totalSupply();
    var tokenBalance = await tokenInstance.balanceOf(accounts[0]);

    assert.equal(totalSupply.toNumber(), 1000000, "set totalSupply to 1000000");

    assert.equal(
      tokenBalance.toNumber(),
      1000000,
      "it allocated the initial supply to the admin account"
    );
  });
  it("Transfer tokens ownership", function () {
    return SttToken.deployed()
      .then(function (instance) {
        tokenInstance = instance;
        return tokenInstance.transfer.call(accounts[1], 999999999999);
      })
      .then(assert.fail)
      .catch(function (error) {
        assert(
          error.message.indexOf("revert") >= 0,
          "error message must contain revert"
        );
        return tokenInstance.transfer.call(accounts[1], 250000, {
          from: accounts[0],
        });
      })
      .then(function (success) {
        assert.equal(success, true, "It Returns true");
        return tokenInstance.transfer(accounts[1], 250000, {
          from: accounts[0],
        });
      })
      .then(function (receipt) {
        assert.equal(receipt.logs.length, 1, "trigger one event");
        assert.equal(
          receipt.logs[0].event,
          "Transfer",
          "Should be transfer event"
        );
        assert.equal(
          receipt.logs[0].args._from,
          accounts[0],
          "logs the account the token transferred from"
        );
        assert.equal(
          receipt.logs[0].args._to,
          accounts[1],
          "logs the account the token transferred to"
        );
        assert.equal(
          receipt.logs[0].args._value,
          250000,
          "logs the transfer amount"
        );
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then(function (balance) {
        assert.equal(
          balance.toNumber(),
          250000,
          "add amount to the reciving account"
        );
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function (balance) {
        assert.equal(
          balance.toNumber(),
          750000,
          "add amount to the reciving account"
        );
      });
  });
});
