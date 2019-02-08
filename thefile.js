var formular = document.querySelector('form');

formular.addEventListener('submit', async (e) => {

    e.preventDefault();

    var key = await generateAESKey();

    var iv = window.crypto.getRandomValues(new Uint8Array(16));

    JSONresult = {
        "userData": {},
        "ownerData": {}
    };

    var encrdata = await encryptOwnerData({RSAPublicKey}, iv, key);

    var encryptedUID = {uid};

    JSONresult["userData"]["aesComponents"] = encrdata;
    JSONresult["ownerData"]["uid"] = uidJsonToArray(encryptedUID);
    JSONresult["ownerData"]["siteName"] = "jetix.ro"; //window.location.hostname

    var data = new FormData(e.target);

    for (var pair of data.entries()) {
        JSONresult["userData"][pair[0]] = await encryptUserData(pair[1], key, iv)
    }

    JSONresult["userTimestamp"] = + new Date();

    console.log(JSONresult);

    fetch("http://localhost:5016",
        {
            method: "POST",
            headers: {
                "Content-Type": "text/plain",
            },
            mode: "no-cors",
            body: JSON.stringify(JSONresult)
        })
        .then(function (response) {
            console.log("Json sent!", response);
        })
});

async function generateAESKey() {
    var AESkey;
    await window.crypto.subtle.generateKey(
        {
            name: "AES-CTR",
            length: 128,
        },
        true,
        ["encrypt", "decrypt"]
    )
    .then(function (result) {
        AESkey = result;
    });

    return AESkey;
}

async function encryptOwnerData(RSAPublicKey, iv, keyToEncrypt) {
    ownerJson = {};

    var algorithm = {
        name: "RSA-OAEP",
        modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: {
                name: "SHA-256"
        },
    };

    RSAPublicKey = await JSON.parse(RSAPublicKey);

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
        algorithm,
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
        algorithm
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
            console.log(encryptedData);
        });

    return encryptedData;
}
function uidJsonToArray(json) {
    var ret = new Uint8Array(128);
    for (var i = 0; i < 128; i++) {
        ret[i] = json[i]
    }
    return ret
};
