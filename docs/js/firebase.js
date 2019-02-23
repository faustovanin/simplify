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

    document.getElementById("signOut").style.visibility="visible";
    document.getElementById("tabs").style.visibility="visible";

    console.log(user);
    // User is signed in.
    // var displayName = user.displayName;
    // var email = user.email;
    // var emailVerified = user.emailVerified;
    // var photoURL = user.photoURL;
    // var isAnonymous = user.isAnonymous;
    // var uid = user.uid;
    // var providerData = user.providerData;
    // ...
  } else {
    // User is signed out.
    document.getElementById("signUp").style.visibility="visible";
    document.getElementById("signIn").style.visibility="visible";

    document.getElementById("signOut").style.visibility="hidden";
    document.getElementById("tabs").style.visibility="hidden";
    
    console.log('signed out');
  }
});

function createUser() {

  var email = document.getElementById("email").value;
  var password = document.getElementById("password").value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(function(result) {
      console.log(result);

      db.collection("users").add({
        name: document.getElementById("name").value,
        wallet: document.getElementById("wallet").value,
        user: document.getElementById("email").value
      })
      .then(function(docRef) {
          console.log("Document written with ID: ", docRef.id);
          $('#signUpModal').modal('hide');
      })
      .catch(function(error) {
          console.error("Error adding document: ", error);
      });

    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(error);
    });
}

function login() {

  var email = document.getElementById("emailLogin").value;
  var password = document.getElementById("passwordLogin").value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(result) {
      console.log(result);
      $('#loginModal').modal('hide');
      window.location.reload();
    })
    .catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(error);
    });
}

function logout() {
  firebase.auth().signOut()
    .then(function(result) {
      // Sign-out successful.
      console.log('signOut, ', result);
      window.location.reload();
    }).catch(function(error) {
      // An error happened.
      console.error(error);
    });
}