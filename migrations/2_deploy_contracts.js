const Pila = artifacts.require("./Pila.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(Pila, 'Pila', 'PILA', 10, 1000);
};