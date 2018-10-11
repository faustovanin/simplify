const Pila = artifacts.require("Pila");

contract("Pila", async (accounts) => {
	

	it("should manage whitelist and volunteers (with subscribers)", function() {
		var pila = Pila.new("Pila", "PILA", 10, 10000, {from:accounts[0]});
		// console.log(pila);
		return pila.then(async function(instance) {
			// Authorize
			await instance.addAddressToWhitelist(accounts[0]);
			// Actions
			await instance.addAction(200, "http://pila.digital");
			var actionId = await instance.getActionCount.call();
			actionId = actionId.s-1;
			// Adding volunteers
			await instance.addVolunteer(actionId, accounts[1], 20);
			// Adding subscriberds
			await instance.subscribe(actionId, {from:accounts[2]});
			await instance.approveVolunteer(actionId, accounts[2], 20);
			// Assert volunteers
			var volunteerCount = await instance.getActionVolunteerCount(actionId);
			assert.equal(volunteerCount.toString(), 2, 'Wrong number of volunteerCount. Expected 2.')
			// Assert token balance before finishing
			var tokenAmount = await instance.getActionTokenAmount(actionId);
			assert.equal(tokenAmount.toString(), 400, 'Wrong total amount of tokens');
			// Finish action			
			await instance.finishAction(actionId, {from:accounts[0]});
			// Asssert token amount after finishing
			var tokenAmount = await instance.getActionTokenAmount(actionId);
			assert.equal(tokenAmount.toString(), 392, 'Wrong total amount of tokens');
			// Assert account balance
			var accountBalance = await instance.balanceOf(accounts[1]);
			assert.equal(accountBalance.toString(), 200*10000000000, 'Wrong balance for account ' + accounts[1]);
		});
	});


});