const Simplify = artifacts.require("Simplify");

contract("Simplify", async (accounts) => {
	

	it("should allow non owners to mint", function() {
		var sy = Simplify.new("Simplify", "SY", 10, {from:accounts[1]});
		console.log(sy);
		return sy.then(async function(instance) {
			// Mint
			await instance.mint(accounts[2], 100);
		});
	});


});