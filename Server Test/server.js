var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var firebase = require('firebase-admin');
var serviceAccount = require('./serviceAccountKey.json')

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://dave-a160c.firebaseio.com"
});

var WebCrypto = require("node-webcrypto-ossl");
var webcrypto = new WebCrypto();

var textEncoding = require('text-encoding');
var TextDecoder = textEncoding.TextDecoder;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'text/plain' }))

var publicKey;
var privateKey;

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
firebase.database().ref('/server/').once('value')
    .then(function (snapshot) {
        webcrypto.subtle.importKey(
            "jwk",
            snapshot.val().privateKey,
            {
                name: "RSA-OAEP",
                modulusLength: 1024,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: {
                    name: "SHA-1"
                }
            },
            false,
            ["decrypt"]
        )
            .then((key) => {
                privateKey = key;
            })

        publicKey = snapshot.val().publicKey;
    });

app.post('/', function (req, res) {
    let uidArray = uidJsonToArray(req.body.ownerData.uid);
    let userTimestamp = req.body.userTimestamp;

    if (req.body.ownerData.uid) {
        res.sendStatus(200);
        webcrypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
                modulusLength: 1024,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: {
                    name: "SHA-1"
                }
            },
            privateKey,
            uidArray
        )
            .then( (decrypted) => {
                var decryptedUid = new TextDecoder("utf-8").decode(new Uint8Array(decrypted));

                firebase.database().ref('users/' + decryptedUid + '/sites/' +
                    req.body.ownerData.siteName + '/' + userTimestamp).set(
                        req.body.userData
                    )
                    .catch(e => console.log(e.message));
            })
            .catch(e => console.log(e.message));
    } else {
        res.sendStatus(500);
    }
});

app.get('/getPublicKey', function (req, res) {
    res.json(publicKey);
});

app.listen(5016, function () {
    console.log('Server is up and runnit at port 5016.');
});

function uidJsonToArray(json) {
    var ret = new Uint8Array(128);
    for (var i = 0; i < 128; i++) {
        ret[i] = json[i]
    }
    return ret
};

//      {
//     name: "RSA-OAEP",
//     modulusLength: 1024,
//     publicExponent: new Uint8Array([1, 0, 1]),
//     hash: {
//       name: "SHA-1"
//     }
//   }

app.post('/getUserDataFromSiteName', function (req, res) {
    let uidArray = uidJsonToArray(req.body.uid);
    let siteName = req.body.siteName;

    if (uidArray) {
        webcrypto.subtle.decrypt(
            {
                name: "RSA-OAEP",
                modulusLength: 1024,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: {
                    name: "SHA-1"
                }
            },
            privateKey,
            uidArray
        )
            .then((decrypted) => {
                var decryptedUid = new TextDecoder("utf-8").decode(new Uint8Array(decrypted));

                firebase.database().ref('users/' + decryptedUid + '/sites/' + siteName).once('value')
                    .then(function (snapshot) {
                        res.json(snapshot.val());
                    })
                    .catch(e => console.log(e.message));
            })
            .catch(e => console.log(e.message));
    } else {
        res.sendStatus(500);
    }
});