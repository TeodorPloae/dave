const logout_button = document.getElementById("logout_button");
const download_button = document.getElementById("download_button");
const link = document.getElementById("download_link");
const db_select = document.getElementById("DB_Select");
const modal = document.getElementById("modal");
const site_name = document.getElementById("site_name");// not in html atm
var readDownload = true;
var storage = firebase.storage();
var pathReference = storage.ref('thefile.js');

const enc = new TextEncoder();

var srvPublicKey;

var req = new XMLHttpRequest();

// Feature detection for CORS
if ('withCredentials' in req) {
    req.open('GET', 'http://localhost:5016/getPublicKey', true);
    // Just like regular ol' XHR
    req.onreadystatechange = function () {
        if (req.readyState === 4) {
            if (req.status >= 200 && req.status < 400) {
                // JSON.parse(req.responseText) etc.
                var JsonResponse = JSON.parse(req.response);

                window.crypto.subtle.importKey(
                    "jwk",
                    JsonResponse,
                    {
                        name: "RSA-OAEP",
                        modulusLength: 1024,
                        publicExponent: new Uint8Array([1, 0, 1]),
                        hash: {
                            name: "SHA-1"
                        }
                    }
                    ,
                    false,
                    ["encrypt"]
                )
                    .then(function (key) {
                        srvPublicKey = key;
                    });

            } else {
                // Handle error case
                link.innerHTML = "Server is down!";
                readDownload = false;
            }
        }
    };
    req.send();
}

logout_button.addEventListener('click', e => {
    firebase.auth().signOut()
        .then(function () {
            //logout extra functionality
            sessionStorage.clear();
            window.location = 'home.html';
        })
        .catch(e => console.log(e.message));
});

function loadData(theUser) {
    if (!readDownload) {
        return;
    }
    storage.ref('thefile.js').getDownloadURL()
        .then(function (url) {
            link.setAttribute('download', 'thefile.js');

            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';

            xhr.onload = function (event) {
                var blob = xhr.response;

                const reader = new FileReader();

                reader.addEventListener('loadend', (e) => {

                    var text = e.srcElement.result;

                    text = text.replace("{RSAPublicKey}", JSON.stringify(theUser.publicKey));

                    link.setAttribute('download', 'theFile.js');

                    window.crypto.subtle.encrypt(
                        {
                            name: "RSA-OAEP",
                            modulusLength: 1024,
                            publicExponent: new Uint8Array([1, 0, 1]),
                            hash: {
                                name: "SHA-1"
                            }
                        },
                        srvPublicKey,
                        enc.encode(theUser.uid)
                    )
                        .then(function (encryptedUid) {
                            theUser.encryptedUid = new Uint8Array(encryptedUid)

                            text = text.replace("{uid}", JSON.stringify(theUser.encryptedUid));
                            link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));


                            download_button.disabled = false;

                            download_button.style.backgroundColor = "#1ab188";
                            requireSiteName();
                            getUserData(theUser);
                        })
                        .catch(e => console.log(e.message));

                });

                reader.readAsText(blob);
            };

            xhr.open('GET', url);
            xhr.send();
        })
        .catch(e => console.log(e.message));
}

db_select.addEventListener('click', e => {

    modal.style.display = 'block';

});

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

function requireSiteName() {
    //to be implemented
    console.log("reminder! Implement site name field!");
}

function getUserData(theUser) {
    var request = new XMLHttpRequest();
    if ('withCredentials' in request) {
        request.open('POST', 'http://localhost:5016/getUserDataFromSiteName', true);
        // Just like regular ol' XHR
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status >= 200 && request.status < 400) {
                    // JSON.parse(request.responseText) etc.
                    var JsonResponse = JSON.parse(request.response);

                    console.log(JsonResponse, "JsonResponse");

                    Object.keys(JsonResponse).forEach( async function(timeStamp) {
                        //trateaza fiecare unser in parte
                        //console.log(JsonResponse[timeStamp]["aesComponents"], "aicisa")
                        let aesComponents = JsonResponse[timeStamp]["aesComponents"];

                        delete JsonResponse[timeStamp]["aesComponents"];


                        aesComponents = await decryptUserAEScomponents(aesComponents, theUser.privateKey);
     
                        var userData = {};
                        Object.keys(JsonResponse[timeStamp]).forEach( async function (key) {
                            userData[timeStamp][key] = await aesDecrypt(
                                JsonResponse[timeStamp][key], 
                                aesComponents.key,
                                aesComponents.iv
                                );
                        });

                        console.log(userData);
                    });
                } else {
                    // Handle error case
                    console.log("error at getUserData from server!");
                }
            }
        };
        request.setRequestHeader('Content-type', 'text/plain; charset=utf-8');
        let data = JSON.stringify({"uid" : theUser.encryptedUid, "siteName" : "jetix"});
        request.send(data);
    }

}

async function aesDecrypt(data, key, iv) {
    var decrypt;
    console.log(data, "aesDecr data");
    window.crypto.subtle.decrypt(
        {
            name: "AES-CTR",
            counter: iv,
            length: 256
        },
        key,
        new Uint8Array( data)
    )
    .then(function(decrypted){
        decrypt = new Uint8Array(decrypted);
    })
    .catch(e => console.log(e.message));

    return decrypt;
}

async function decryptUserAEScomponents(aesComponents, rsaPrivateKey) {

    console.log(aesComponents, "in DUAC");

    aesComponents.iv = await rsaDecrypt(aesComponents.iv, rsaPrivateKey);
// import key;
    await window.crypto.subtle.unwrapKey(
        "raw", //the import format, must be "raw" (only available sometimes)
        new Uint8Array( aesComponents.key), //the key you want to unwrap
        rsaPrivateKey, //the private key with "unwrapKey" usage flag
        {   //these are the wrapping key's algorithm options
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: {
                name: "SHA-256"
            },
        },
        {   //this what you want the wrapped key to become (same as when wrapping)
            name: "AES-CTR",
            length: 128
        },
        false, //whether the key is extractable (i.e. can be used in exportKey)
        ["encrypt", "decrypt"] //the usages you want the unwrapped key to have
    )
    .then(function(key){
        aesComponents.key = key;
        console.log(aesComponents);
    })
    .catch(function(err){
        console.error(err);
    });

    return aesComponents;
}

async function rsaDecrypt(data, key){
    var result;
    console.log(data, "data",);
    await window.crypto.subtle.decrypt(
        {
            name: "RSA-OAEP"
        },
        key, 
        new Uint8Array(data) 
    )
    .then(function(decrypted){
        result = new Uint8Array( decrypted);
        console.log(decrypted, "decr");
    })
    .catch(function(err){
        console.error(err);
    });

    return result;
}