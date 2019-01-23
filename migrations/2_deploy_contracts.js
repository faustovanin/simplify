const Simplify = artifacts.require("./Simplify.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Simplify, 'Simplify', 'SY', 10);
};