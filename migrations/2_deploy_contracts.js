const SttToken = artifacts.require("SttToken");

module.exports = function (deployer) {
  deployer.deploy(SttToken, 1000000);
};
