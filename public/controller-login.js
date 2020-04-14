var firebaseConfig = {
    apiKey: "AIzaSyCqAvUiMxbCSWYq-FkjsxnF4QTBOGkUbrM",
    authDomain: "mathquizz-629be.firebaseapp.com",
    databaseURL: "https://mathquizz-629be.firebaseio.com",
    projectId: "mathquizz-629be",
    storageBucket: "mathquizz-629be.appspot.com",
    messagingSenderId: "1093342957316",
    appId: "1:1093342957316:web:ef925a34cd5f89adf90a51"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var auth = firebase.auth();


firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        window.location = "index.html";
    }
  });

$("#login").submit(function (e) {
    e.preventDefault();
    console.log("[");
    var data = $(this).serializeArray();
    console.log(data);
    auth.signInWithEmailAndPassword(data[0].value, data[1].value)
        .then((firebaseUser) => {
            window.location = "index.html";
            console.log(firebaseUser);
        })
        .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                alert('Password salah');
              } else {
                alert("Email tidak ditemukan");
              }
        });
});