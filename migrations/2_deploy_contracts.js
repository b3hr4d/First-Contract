const SttToken = artifacts.require("SttToken");
const SttTokenSale = artifacts.require("SttTokenSale");

module.exports = function (deployer) {
  deployer.deploy(SttToken, 1000000).then(function () {
    const tokenPrice = 10000000000000;
    return deployer.deploy(SttTokenSale, SttToken.address, tokenPrice);
  });
};
