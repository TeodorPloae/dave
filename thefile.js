var JSONresult = {}
function generateAESpart() {
    window.crypto.subtle.generateKey(
        {
            name: "AES-CTR",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    )
    .then( (result) => {
            giveKey(result);
        });
}

function giveKey(key){

    iv = crypto.getRandomValues(new Uint8Array(16));

    encryptedOwnerData = encryptUserData({email}, {RSAPublicKey}, iv, key);

    JSONresult["ownerData"] = encryptedOwnerData;

    data.forEach(element => {
        window.crypto.subtle.encrypt(
            {
                name: "AES-CTR",
                counter: iv,
                length: 256,
            },
            key,
            element
        )
        .then(function(encrypted){
            JSONresult["userData"][data[nume]] = new Uint8Array(encrypted);
        })
    });
    
    console.log(JSONresult);
}

async function encryptUserData( email, RSAPublicKey, iv, keyToEncrypt){
    JSONresult = {};

    await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        RSAPublicKey, 
        email
    )
    .then(function(encrypted){
        JSONresult["email"] = new Uint8Array(encrypted)
    });

    await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        RSAPublicKey, 
        iv
    )
    .then(function(encrypted){
        JSONresult["iv"] = new Uint8Array(encrypted);
    });

    window.crypto.subtle.wrapKey(
        "jwk", //the export format, must be "raw" (only available sometimes)
        keyToEncrypt, //the key you want to wrap, must be able to fit in RSA-OAEP padding
        publicKey, //the public key with "wrapKey" usage flag
        {   //these are the wrapping key's algorithm options
            name: "RSA-OAEP",
            hash: {name: "SHA-256"},
        }
    )
    .then(function(wrapped){
        //returns an ArrayBuffer containing the encrypted data
        JSONresult["key"] = new Uint8Array(wrapped);
    });

    return JSONresult;
}