var formular = document.querySelector('form');

formular.addEventListener('submit', (e) => {
    var data = new FormData(e.target);

    var JSONresult = {};

    var key = generateAESKey();

    iv = crypto.getRandomValues(new Uint8Array(16));

    JSONresult["ownerData"] = encryptUserData("crypto@user.com",
    "{\"alg\":\"RSA-OAEP-256\",\"e\":\"AQAB\",\"ext\":true,\"key_ops\":[\"encrypt\"],\"kty\":\"RSA\",\"n\":\"wlvIWuBpxB84Pp8fXD_Ja5oza4jrtEUlgtTZeAbRyhBCjE6MhuNQPcDU45sbvX4GwcDPQbnsaSFwr--V0bB7woe98tFsXeTGD_uQv7V7evPwU079GE--lHRTzsDrfcjBujDc_-p5prIU4VAqsI6-iVGG_Z4IFNhy60AsWkdRbu91yMLGxOSU-7Ztt7PtkG5_-swIRgwVHQdr2wpVrdB1qjoyk5QAwN5jglaNa_h0syp4D-AiVP_7o6SkXLr0OBnbwv2dMuPw8ELjty1FZzdQsQ3h_axwt6U6Kcsond2h9OWwEb_A_Jz8QrEtMDlONJX8Uj2CHQi8d2y8pi2_ml3iLQ\"}"
    , iv, key);

    for (var pair of data.entries()) {

        window.crypto.subtle.encrypt(
            {
                name: "AES-CTR",
                counter: iv,
                length: 256,
            },
            key,
            pair[1]
        )
            .then(function (encrypted) {
                JSONresult["userData"][pair[0]] = new Uint8Array(encrypted);
            })

    }

    console.log(JSONresult);
    document.getElementById('password').value = 'SorryBruh'; // GRIJA LA PAROLELE DIN URL !!!!!!!!!!!!!

    fetch("http://localhost:5016",
        {
            method: "POST",
            headers: {
                "Content-Type": "text/plain",
            },
            body: JSON.stringify(JSONresult)
        })
});

async function generateAESKey() {
    var AESKey
    await window.crypto.subtle.generateKey(
        {
            name: "AES-CTR",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    )
        .then((result) => {
            AESKey = result;
            //giveKey(result);
        });

    return AESKey;
}

async function encryptUserData(email, RSAPublicKey, iv, keyToEncrypt) {
    JSONresult = {};

    var algorithm = {
        name: "RSA-OAEP",
        hash: {
            name: "SHA-256"
        }
    };
    RSAPublicKey = JSON.parse(RSAPublicKey);

    var enc = new TextEncoder();

    await window.crypto.subtle.importKey(
        "jwk",
        RSAPublicKey,
        algorithm,
        false,
        ["encrypt"]
        )
        .then( (key) => {
            RSAPublicKey = key;
        }) 

    await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        RSAPublicKey,
        enc.encode(email)
    )
        .then(function (encrypted) {
            JSONresult["email"] = new Uint8Array(encrypted)
        });

    await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        RSAPublicKey,
        iv
    )
        .then(function (encrypted) {
            JSONresult["iv"] = new Uint8Array(encrypted);
        });

    window.crypto.subtle.wrapKey(
        "jwk", //the export format, must be "raw" (only available sometimes)
        keyToEncrypt, //the key you want to wrap, must be able to fit in RSA-OAEP padding
        publicKey, //the public key with "wrapKey" usage flag
        {   //these are the wrapping key's algorithm options
            name: "RSA-OAEP",
            hash: { name: "SHA-256" },
        }
    )
        .then(function (wrapped) {
            //returns an ArrayBuffer containing the encrypted data
            JSONresult["key"] = new Uint8Array(wrapped);
        });

    return JSONresult;
}