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


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({ type: 'text/plain'}))

var publicKey;
var privateKey;

firebase.database().ref('/server/').once('value')
            .then( function (snapshot) {
                webcrypto.subtle.importKey(
                    "jwk",
                    snapshot.val().privateKey,
                    {
                        name: "RSA-OAEP",
                        hash: {
                            name: "SHA-256"
                            }
                    },
                    false,
                    ["decrypt"]
                    )
                    .then( (key) => {
                        privateKey = key;
                    }) 

                publicKey = snapshot.val().publicKey;
            });

app.post('/', function (req, res) {
    
    console.log("am primit cv");

    console.log(req.body);
    
});

app.get('/getPublicKey', function (req, res) {
    
    console.log("am primit cv de la dashboard");
    res.json(publicKey);
    console.log("am trimis cv la dashboard");
    
});

app.listen(5016, function () {
    console.log('Example app listening on port 5016.');
});