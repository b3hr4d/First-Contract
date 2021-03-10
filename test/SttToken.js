var SttToken = artifacts.require("./SttToken.sol");

contract("SttToken", async function (accounts) {
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

  it("Transfer tokens ownership", async function () {
    tokenInstance = await SttToken.deployed();
    try {
      await tokenInstance.transfer.call(accounts[1], 999999999999);
      assert.fail();
    } catch (error) {
      assert(
        error.message.indexOf("revert") >= 0,
        "error message must contain revert"
      );
    }

    var success = await tokenInstance.transfer.call(accounts[1], 250000, {
      from: accounts[0],
    });
    assert.equal(success, true, "It Returns true");

    var receipt = await tokenInstance.transfer(accounts[1], 250000, {
      from: accounts[0],
    });
    assert.equal(receipt.logs.length, 1, "trigger one event");
    assert.equal(receipt.logs[0].event, "Transfer", "Should be transfer event");
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

    var balance1 = await tokenInstance.balanceOf(accounts[1]);
    assert.equal(
      balance1.toNumber(),
      250000,
      "add amount to the reciving account"
    );

    var balance0 = await tokenInstance.balanceOf(accounts[0]);
    assert.equal(
      balance0.toNumber(),
      750000,
      "add amount to the reciving account"
    );
  });

  it("approves tokens delegated function", async function () {
    tokenInstance = await SttToken.deployed();

    const success = await tokenInstance.approve.call(accounts[0], 100);
    assert.equal(success, true, "It returns true");

    const receipt = await tokenInstance.approve(accounts[1], 100, {
      from: accounts[0],
    });
    assert.equal(receipt.logs.length, 1, "trigger one event");
    assert.equal(receipt.logs[0].event, "Approval", "Should be Approval event");
    assert.equal(
      receipt.logs[0].args._owner,
      accounts[0],
      "logs the account the token transferred from"
    );
    assert.equal(
      receipt.logs[0].args._spender,
      accounts[1],
      "logs the account the token transferred to"
    );
    assert.equal(receipt.logs[0].args._value, 100, "logs the transfer amount");

    const alloawnce = await tokenInstance.allowance(accounts[0], accounts[1]);
    assert.equal(
      alloawnce.toNumber(),
      100,
      "stores the allowance for delegated transfer"
    );
  });

  it("Handles delegated token transfer", async function () {
    tokenInstance = await SttToken.deployed();
    const fromAccount = accounts[2];
    const toAccount = accounts[3];
    const spendingAcount = accounts[4];
    const transferR = await tokenInstance.transfer(fromAccount, 100, {
      from: accounts[0],
    });
    const approveS = await tokenInstance.approve(spendingAcount, 10, {
      from: fromAccount,
    });
    const approveR = await tokenInstance.approve(spendingAcount, 100, {
      from: spendingAcount,
    });

    try {
      await tokenInstance.transferFrom(fromAccount, toAccount, 9999, {
        from: spendingAcount,
      });
      assert.fail();
    } catch (error) {
      assert(
        error.message.indexOf("revert") >= 0,
        "cannot transfer value larger than balance"
      );
    }

    try {
      await tokenInstance.transferFrom(fromAccount, toAccount, 20, {
        from: spendingAcount,
      });
      assert.fail();
    } catch (error) {
      assert(
        error.message.indexOf("revert") >= 0,
        "cannot transfer amount larger than aporoved amount"
      );
    }

    const success = await tokenInstance.transferFrom.call(
      fromAccount,
      toAccount,
      10,
      {
        from: spendingAcount,
      }
    );
    assert.equal(success, true, "should transferFrom function return true");

    const receipt = await tokenInstance.transferFrom(
      fromAccount,
      toAccount,
      10,
      {
        from: spendingAcount,
      }
    );
    assert.equal(receipt.logs.length, 1, "trigger one event");
    assert.equal(receipt.logs[0].event, "Transfer", "Should be Transfer event");
    assert.equal(
      receipt.logs[0].args._from,
      fromAccount,
      "logs the account the token transferred from"
    );
    assert.equal(
      receipt.logs[0].args._to,
      toAccount,
      "logs the account the token transferred to"
    );
    assert.equal(receipt.logs[0].args._value, 10, "logs the transfer amount");

    const balanceOfFrom = await tokenInstance.balanceOf(fromAccount);
    assert.equal(
      balanceOfFrom.toNumber(),
      90,
      "deducts the amount from sending accounts"
    );

    const balanceOfTo = await tokenInstance.balanceOf(toAccount);
    assert.equal(
      balanceOfTo.toNumber(),
      10,
      "Add the amount from the reciving accounts"
    );

    const alloawnce = await tokenInstance.allowance(
      fromAccount,
      spendingAcount
    );
    assert.equal(alloawnce.toNumber(), 0, "deducts amount from the allowance");
  });
});
