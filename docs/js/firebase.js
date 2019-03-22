var config = {
  apiKey: "AIzaSyC0FrgoZ7I1kZRTegbMRMCcUha4brJcAdI",
  authDomain: "simplify-web.firebaseapp.com",
  databaseURL: "https://simplify-web.firebaseio.com",
  projectId: "simplify-web",
  storageBucket: "simplify-web.appspot.com",
  messagingSenderId: "905219341672"
};

firebase.initializeApp(config);
var db = firebase.firestore();

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    document.getElementById("signUp").style.visibility="hidden";
    document.getElementById("signIn").style.visibility="hidden";
    document.getElementById("error-tabs").style.visibility="hidden";

    document.getElementById("signOut").style.visibility="visible";
    document.getElementById("tabs").style.visibility="visible";

  } else {
    // User is signed out.
    document.getElementById("signUp").style.visibility="visible";
    document.getElementById("signIn").style.visibility="visible";
    document.getElementById("error-tabs").style.visibility="visible";

    document.getElementById("signOut").style.visibility="hidden";
    document.getElementById("tabs").style.visibility="hidden";
  }
});

function getTransactions() {

  db.collection("transactions").orderBy("createdAt", "desc").limit(100).get()
    .then(function(querySnapshot) {
      var html = "";
      querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
        html += '</tr>';
        html += '<td class="column1">' + doc.data().createdAt.toDate().toLocaleDateString("pt-BR") + '</td>';
        html += '<td class="column2"><span class="addr">' + doc.data().senderWallet + '</span></td>';
        html += '<td class="column3" style="text-align: justify;">' + doc.data().recognition + '</td>';
        html += '<td class="column4">' + doc.data().amountSent + '</td>';
        html += '<td class="column5"><span class="addr">' + doc.data().receiverWallet + '</span></td>';
        html += '</tr>';
      });
      document.getElementById("table-box").innerHTML = html;
    })
    .catch(function(error) {
      console.error("Error getting documents: ", error);
    });

  // TODO: add pagination => https://firebase.google.com/docs/firestore/query-data/query-cursors
  // return first.get().then(function (documentSnapshots) {
  //   // Get the last visible document
  //   var lastVisible = documentSnapshots.docs[documentSnapshots.docs.length-1];
  //   console.log("last", lastVisible);

  //   // Construct a new query starting at this document,
  //   // get the next 25 cities.
  //   var next = db.collection("cities")
  //           .orderBy("population")
  //           .startAfter(lastVisible)
  //           .limit(25);
  // });

}

function createUser() {

  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function(result) {
      // console.log(result);
      db.collection("users").doc(result.user.uid).set({
        uid: result.user.uid,
        name: document.getElementById("name").value,
        wallet: document.getElementById("wallet").value,
        user: document.getElementById("email").value
      })
      .then(function() {
        $('#signUpModal').modal('hide');
      })
      .catch(function(error) {
        console.error("Error adding document: ", error);
      });

    })
    .catch(function(error) {
      console.error(error);
    });
}

function login() {

  var email = document.getElementById("emailLogin").value;
  var password = document.getElementById("passwordLogin").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(result) {
      // console.log(result);
      $('#loginModal').modal('hide');
      window.location.reload();
    })
    .catch(function(error) {
      console.error(error);
    });
}

function logout() {
  firebase.auth().signOut()
    .then(function(result) {
      // Sign-out successful.
      window.location.reload();
    }).catch(function(error) {
      // An error happened.
      console.error(error);
    });
}