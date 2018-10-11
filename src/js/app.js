App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://127.0.0.1:8545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Pila.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var PilaArtifact = data;
      App.contracts.Pila = TruffleContract(PilaArtifact);

      // Set the provider for our contract.
      App.contracts.Pila.setProvider(App.web3Provider);

      // Use our contract to retieve and mark the adopted pets.
      // web3.eth.getAccounts(function(error, accounts) {
      //   if (error) {
      //     console.log(error);
      //   }

      //   var account = accounts[0];

      //   App.contracts.Pila.deployed().then(function(instance) {
      //     pilaTokenInstance = instance;
      //     pilaTokenInstance.ActionStarted().watch(function(error, event) {
      //       if(!error) {
      //         App.populateActions();
      //         console.log(event);
      //       }
      //     })
      //   });
      // });

      App.populateActions();
      return App.getBalances();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#transferButton', App.handleTransfer);
    $(document).on('click', '#addToWhitelist', App.addToWhitelist);
    $(document).on('click', '#addAction', App.createAction);
    $(document).on('click', '#addVolunteer', App.addVolunteer);
    $(document).on('click', '#finishAction', App.finishAction);
  },

  handleTransfer: function(event) {
    event.preventDefault();

    var amount = parseInt($('#TTTransferAmount').val());
    var toAddress = $('#TTTransferAddress').val();

    console.log('Transfer ' + amount + ' TT to ' + toAddress);

    var pilaTokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Pila.deployed().then(function(instance) {
        pilaTokenInstance = instance;

        return pilaTokenInstance.transfer(toAddress, amount, {from: account, gas: 100000});
      }).then(function(result) {
        alert('Transfer Successful!');
        return App.getBalances();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  getBalances: function() {
    console.log('Getting balances...');

    var pilaTokenInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Pila.deployed().then(function(instance) {
        pilaTokenInstance = instance;

        return pilaTokenInstance.balanceOf(account);
      }).then(function(result) {
        balance = result.c[0];

        $('#TTBalance').text(balance);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  addToWhitelist: function() {
     console.log("Adding to whitelist...");

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Pila.deployed().then(function(instance) {
        pilaTokenInstance = instance;
        const address = $('#whitelistAddress').val();

        pilaTokenInstance.addAddressToWhitelist(address, {from: account, gas: 100000}).then(function(result){
          alert('Endereço autorizado');
          console.log(result);
        });
      });
    });
  },

  createAction: function() {
    console.log("Creating action...");

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Pila.deployed().then(function(instance) {
        pilaTokenInstance = instance;
        const people = parseInt($('#actionPeople').val());
        const url = $('#actionUrl').val();

        console.log(people + " people at " + url);

        pilaTokenInstance.addAction(people, url).then(function(result){
          alert("Nova ação cadastrada");
          console.log(result);
        });
      });
    });
  },

  addVolunteer: function() {
    console.log("Adding volunteer...");

    var r = confirm("Os dados estão corretos? Após a inserção, não será mais possível alterar os dados.");
    if (r == false) return;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Pila.deployed().then(function(instance) {
        pilaTokenInstance = instance;
        const actionId = parseInt($('#actionId').val());
        const volunteer = $('#volunteer').val();
        const contribution = parseInt($('#contribution').val());

        pilaTokenInstance.addVolunteer(actionId, volunteer, contribution).then(function(result){
          alert("Novo voluntário adicionado à ação");
          console.log(result);
        });
      });
    });
  },

  finishAction: function() {
    console.log("Finishing action...");
    var r = confirm("Deseja realmente encerrar a ação? Após o encerramento ele mudará de status e os tokens serão distribuídos.");
    if (r == false) return;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Pila.deployed().then(function(instance) {
        pilaTokenInstance = instance;
        const actionId = $('#actionIdToFinish').val();

        pilaTokenInstance.finishAction(actionId).then(function(result){
          pilaTokenInstance.getActionTokenAmount().then(function(result){
            alert("Ação encerrada. O total de tokens emitidos foi de " + result.toString());
            console.log(result);
          });
        });
      });
    });
  },

  amITheOwner: function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Pila.deployed().then(function(instance) {
        pilaTokenInstance = instance;

        pilaTokenInstance.owner.then(function(result){
          return result.toString() == account;
        });
      });
    });
  },

  populateActions: function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Pila.deployed().then(function(instance) {
        pilaTokenInstance = instance;


        pilaTokenInstance.getActionCount().then(function(result){
          const count = result.toString();
          $("#actions").empty();
          $("#loading").show();
          for (var i = 0; i < count; i++) {
            pilaTokenInstance.getAction(i).then(function(action) {
              console.log(action);
              const creator = action[0].toString();
              const url = web3.toAscii(action[1]);
              const active = action[2].toString();
              const people = action[3].toString();
              const volunteers = action[4].toString();

              if(active){
                              // $("#actions").append("<tr><td>"+(i-1)+"</td><td>"+creator+"</td><td>"+url+"</td><td>"+people+"</td><td>"+volunteers+"</td></tr>");
                $("#actions").append("<p class='action'>A&ccedil;&atilde;o #" + (i-1) + " (" + people + " pessoas impactadas)</p>");
                $("#actions").append("<p class='address'>Criado por " + creator + "</p>");
                $("#actions").append("<p><a href='" + url + "' target='_blank'>" + url + "</a> - " + volunteers + " volunt&aacute;rios</p><hr>");
              }
            });
            $("#loading").hide();
          }
        });
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
