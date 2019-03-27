
var db = firebase.firestore();

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
    $.getJSON('js/Simplify.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var SimplifyArtifact = data;
      App.contracts.Simplify = TruffleContract(SimplifyArtifact);

      // Set the provider for our contract.
      App.contracts.Simplify.setProvider(App.web3Provider);

      // App.populateActions();

      App.updateUserData();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '#transferButton', App.handleTransfer);
    $(document).on('click', '#addToWhitelist', App.addToWhitelist);
    $(document).on('click', '#addAction', App.createAction);
    $(document).on('click', '#addVolunteer', App.addVolunteer);
    $(document).on('click', '#finishAction', App.finishAction);
    $(document).on('click', '#mint', App.mint);
    $(document).on('click', '#createAccount', App.createAccount);
    $(document).on('click', '#checkAccount', App.checkAccount);
  },

  handleTransfer: function(event) {
    event.preventDefault();

    if (document.getElementById("TTTransferAddress").value
      && document.getElementById("TTTransferAmount").value
      && document.getElementById("TTTransferComment").value
    ) {

      $("#loading").show();
      $("#system").hide();

      var syTokenInstance;

      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.log(error);
        }

        var account = accounts[0];

        App.contracts.Simplify.deployed().then(async function(instance) {
          syTokenInstance = instance;

          const decimals = await syTokenInstance.decimals.call();
          var amount = parseInt($('#TTTransferAmount').val()) * Math.pow(10, decimals);
          var toAddress = $('#TTTransferAddress').val();
          // console.log('Transfer ' + amount + ' TT to ' + toAddress);
          return syTokenInstance.transfer(toAddress, amount, {from: account, gas: 100000});
        })
        .then(function() {
          /**
           * Save transaction data on our backend
           */
          firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
              const amount = parseInt($('#TTTransferAmount').val());
              const toAddress = $('#TTTransferAddress').val();
              const recognitionText = $('#TTTransferComment').val();

              db.collection("users").doc(user.uid).get()
                .then(function(doc) {
                  if (doc.exists) {
                    // console.log("loggedUser data:", doc.data());
                    loggedUser = doc.data();
                    db.collection("transactions").add({
                      senderUid: loggedUser.uid,
                      senderWallet: loggedUser.wallet,
                      receiverWallet: toAddress,
                      amountSent: amount,
                      recognition: recognitionText,
                      createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    })
                    .catch(function(error) {
                      console.error("Error adding transaction: ", error);
                    });
                  } else {
                      // user will be undefined
                      throw new Error("No such user or not enough transaction data!");
                  }
                }).catch(function(error) {
                  console.error("Error getting Logged User data:", error);
                });
            }
          });
        })
        .then(function(result) {
          alert('Transfer Successful!');

          document.getElementById("TTTransferAddress").value = "";
          document.getElementById("TTTransferAmount").value = "";
          document.getElementById("TTTransferComment").value = "";

          $("#loading").hide();
          $("#system").show();

          App.updateUserData();
        }).catch(function(err) {
          $("#loading").hide();
          $("#system").show();
          alert(err.message);
          console.error(err.message);
        });
      });
    }

  },

  getBalances: function(account) {

    console.log('Getting balances...');

    var syTokenInstance;
    return new Promise(function(resolve, reject) {
      web3.eth.getAccounts(function(error, accounts) {
        if (error) {
          console.error(error);
          reject(error);
        }

        if(!account) account = accounts[0];

        App.contracts.Simplify.deployed().then(function(instance) {
          syTokenInstance = instance;

          return syTokenInstance.balanceOf(account);
        }).then(async function(result) {
          const decimals = await syTokenInstance.decimals.call();
          let balance = result/Math.pow(10, decimals);

          resolve(balance);
        }).catch(function(err) {
          console.error(err.message);
          reject(err);
        });
      });
    });


  },

  updateUserData: function() {
    App.getBalances().then(function(balance) {
      $('#TTBalance').text(balance);
    });

    App.getFlow().then(function(flow) {
      $('#TTFlow').text(flow);
    });
  },

  amITheOwner: function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.error(error);
      }

      var account = accounts[0];

      App.contracts.Simplify.deployed().then(function(instance) {
        syTokenInstance = instance;

        syTokenInstance.owner.then(function(result){
          return result.toString() == account;
        });
      });
    });
  },

  mint: function() {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.error(error);
      }

      $("#loading").show();
      $("#system").hide();

      var account = accounts[0];

      App.contracts.Simplify.deployed().then(async function(instance) {
        syTokenInstance = instance;

        const decimals = await syTokenInstance.decimals.call({from:account});
        const address = $('#address').val();
        const selfRecognition = $('#self-recognition').val();
        const amount = parseInt($('#amount').val()) * Math.pow(10, decimals);
        const amountSY = $('#amount').val();

        syTokenInstance.mint(address, amount, {from:account})
          .then(function() {
            firebase.auth().onAuthStateChanged(function(user) {
              if (user) {
                db.collection("users").doc(user.uid).get()
                  .then(function(doc) {
                    if (doc.exists) {
                      loggedUser = doc.data();
                      db.collection("transactions").add({
                        senderUid: loggedUser.uid,
                        senderWallet: "Auto Reconhecimento",
                        receiverWallet: loggedUser.wallet,
                        amountSent: amountSY,
                        recognition: selfRecognition,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                      })
                      .catch(function(error) {
                        console.error("Error adding transaction: ", error);
                      });
                    } else {
                        // user will be undefined
                        throw new Error("No such user or not enough transaction data!");
                    }
                  }).catch(function(error) {
                    console.error("Error getting Logged User data:", error);
                  });
              }
            });
          })
          .then(function(result) {
            alert('Tokens emitidos!');

            $("#loading").hide();
            $("#system").show();
            document.getElementById("address").value = "";
            document.getElementById("self-recognition").value = "";
            document.getElementById("amount").value = "";

            App.updateUserData();
          })
          .catch(function(err) {
            $("#loading").hide();
            $("#system").show();
            alert(err.message);
            console.error(err);
          });
      });
    });
  },

  createAccount: function() {
    let account = web3.eth.account.create();
    // console.log(account);
    $('#account').text(account.address);
    $('#privateKey').text(account.privateKey);
  },

  getFlow: function(account) {
    return new Promise(function(resolve, reject){
      App.contracts.Simplify.deployed().then(async function(instance) {

        console.log('Getting flow...');

        var syTokenInstance;

        web3.eth.getAccounts(function(error, accounts) {
          if (error) {
            console.error(error);
            reject(error);
          }

          if(!account) account = accounts[0];

          App.contracts.Simplify.deployed().then(function(instance) {
            syTokenInstance = instance;

            return syTokenInstance.getFlow(account);
          }).then(async function(result) {
            const decimals = await syTokenInstance.decimals.call();
            let flow = result/Math.pow(10, decimals);

            resolve(flow);
          }).catch(function(err) {
            console.error(err.message);
            reject(err);
          });
        });
      });
    });
  },

  checkAccount: function() {
    App.getBalances($('#checkaccount').val()).then(function(balance) {
      $('#checkbalance').val('Saldo: ' + balance + ' SY');
    });

    App.getFlow($('#checkaccount').val()).then(function(flow) {
      $('#checkflow').val('Fluxo: ' + flow + ' SY');
    });
  }
};


$(document).ready(function() {
  $('#loginModal').on('shown.bs.modal', function () {
    $('#myInput').focus()
  });

  $('#signUpModal').on('shown.bs.modal', function () {
    $('#myInput').focus()
  });

  $(function() {
    $(window).load(function() {
      $("#loading").hide();
      App.init();
    });
  });
});
