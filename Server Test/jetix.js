var formular = document.querySelector('form');

formular.addEventListener('submit', async (e) => {

    e.preventDefault();
    
    
    //var encryption = new encryptData();

 
    var key = await generateAESKey();

    var iv = window.crypto.getRandomValues(new Uint8Array(16));

    JSONresult = {
        "userData": {},
        "ownerData": {}
    };

    var encrdata = await encryptOwnerData("crypto@user.com",
    "{\"alg\":\"RSA-OAEP-256\",\"e\":\"AQAB\",\"ext\":true,\"key_ops\":[\"encrypt\",\"wrapKey\"],\"kty\":\"RSA\",\"n\":\"vAlTRTU_FstxFSf5Z50vzHqn94c81DD1eacSKKwyJfK1sZJp7fyvadVezvYe_e8AmDI0wzblfDKtgp42MFa_3qNq4xmnObuTlEYJoSfOemwM_5TsAYl7HWAesDTb_Ij3qsP0B5_O9DOwJJOC3lXrrneyJXkl2JW-Zhw2FmfN1YJpEeMg5jXSaMFuqMhM3g_bbcfdrqmJa-qvOIKSH10h218e_z2cWVJhYlrnIhtzMhC0ELgxEykN8cm2GQ5m5fyvoXKlzqzMkALiKBqqYpg_oz2LyLRKgHZmcbk79nQmw3M4ftQIOoAVYJQXxhbvTpO1oJQJgDX_TO0OGo8bllVi2w\"}"
    , iv, key);

    JSONresult["ownerData"] = encrdata;

    var data = new FormData(e.target);

    for (var pair of data.entries()) {
        JSONresult["userData"][pair[0]] = await encryptUserData(pair[1], key, iv)
    }

    console.log(JSONresult);

    document.getElementById('password').value = 'SorryBruh'; // GRIJA LA PAROLELE DIN URL !!!!!!!!!!!!!

    fetch("http://localhost:5016",
        {
            method: "POST",
            headers: {
                "Content-Type": "text/plain",
            },
            mode: "no-cors",
            body: JSON.stringify(JSONresult)
        })
});

async function generateAESKey() {
    var AESkey;
    await window.crypto.subtle.generateKey(
        {
            name: "AES-CTR",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    )
    .then(function (result) {
        AESkey = result;
    });

    return AESkey;
}

async function encryptOwnerData(email, RSAPublicKey, iv, keyToEncrypt) {
    ownerJson = {};

    var algorithm = {
        name: "RSA-OAEP",
        hash: {
            name: "SHA-256"
        }
    };

    RSAPublicKey = await JSON.parse(RSAPublicKey);

    var enc = new TextEncoder();

    await window.crypto.subtle.importKey(
        "jwk",
        RSAPublicKey,
        algorithm,
        true,
        ["encrypt", "wrapKey"]
    )
        .then((key) => {
            RSAPublicKey = key;
        })
        .catch(e => console.log(e.message));

    await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        RSAPublicKey,
        enc.encode(email)
    )
        .then(function (encrypted) {
            ownerJson["email"] = new Uint8Array(encrypted)
        })
        .catch(e => console.log(e.message));

    await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        RSAPublicKey,
        iv
    )
        .then(function (encrypted) {
            ownerJson["iv"] = new Uint8Array(encrypted);
        })
        .catch(e => console.log(e.message));

    await window.crypto.subtle.wrapKey(
        "raw", //the export format, must be "raw" (only available sometimes)
        keyToEncrypt, //the key you want to wrap, must be able to fit in RSA-OAEP padding
        RSAPublicKey, //the public key with "wrapKey" usage flag
        {   //these are the wrapping key's algorithm options
            name: "RSA-OAEP"
        }
    )
        .then(function (wrapped) {
            ownerJson["key"] = new Uint8Array(wrapped);
        })
        .catch(e => console.log(e.message));

    return ownerJson;
}

async function encryptUserData(data, key, iv) {
    var encryptedData;
    var enc = new TextEncoder();

    await window.crypto.subtle.encrypt(
        {
            name: "AES-CTR",
            counter: iv,
            length: 128,
        },
        key,
        enc.encode(data)
    )
        .then(function (encrypted) {
            encryptedData = new Uint8Array(encrypted);
        });

    return encryptedData;
}