var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var firebase = require('firebase-admin');
var serviceAccount = require('./serviceAccountKey.json')
const crypto = require('crypto');
const cert = require('crypto').Certificate();
firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://dave-a160c.firebaseio.com"
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({ type: 'text/plain'}))

var publicKey;
var privateKey;

firebase.database().ref('/server/').once('value')
            .then( async (snapshot) => {
                await crypto.subtle.importKey(
                    "jwk",
                    snapshot.val().privateKey,
                    algorithm,
                    false,
                    ["decrypt"]
                    )
                    .then( (key) => {
                        privateKey = key;
                    }) 


               await crypto.subtle.importKey(
                        "jwk",
                        snapshot.val().publicKey,
                        algorithm,
                        false,
                        ["encrypt"]
                        )
                        .then( (key) => {
                            publicKey = key;
                        }) 
            })

app.post('/', function (req, res) {
    
    console.log("am primit cv");
    

    console.log(req.body);
    
});

app.get('/getPublicKey', function (req, res) {
    
    console.log("am primit cv de la dashboard");

    console.log(privateKey, publicKey);

    console.log("am trimis cv la dashboard");
    
    
});

app.listen(5016, function () {
    console.log('Example app listening on port 5016.');
});