var config = {
    apiKey: "AIzaSyChswObckyb28F9PVfG86BwYSB6pavqOws",
    authDomain: "dave-a160c.firebaseapp.com",
    databaseURL: "https://dave-a160c.firebaseio.com",
    projectId: "dave-a160c",
    storageBucket: "gs://dave-a160c.appspot.com/",
    messagingSenderId: "227711290879"
  };
  firebase.initializeApp(config);


var algorithm = {
    name: "RSA-OAEP",
    modulusLength: 2048,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    hash: {
        name: "SHA-256"
    }
};

var publicKey;
var privateKey;
 window.crypto.subtle.generateKey(
    algorithm,
    true,
    ["encrypt", "decrypt"]
)
    .then(async (result) => {

        await window.crypto.subtle.exportKey(
            "jwk",
            result.privateKey
        )
            .then((keyData) => {
                privateKey = keyData;
            });

        await window.crypto.subtle.exportKey(
            "jwk",
            result.publicKey
        )
            .then((keyData) => {
                publicKey = keyData;
            });
    })
    .then(() => {
        firebase.database().ref('server/').set({
            privateKey: privateKey,
            publicKey: publicKey,
        })
            .then(function () {
                console.log("ok");
            })
            .catch(e => console.log(e.message));
    })