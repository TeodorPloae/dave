var formular = document.querySelector('form');

formular.addEventListener('submit', async (e) => {

    e.preventDefault();

    var key = await generateAESKey();

    var iv = window.crypto.getRandomValues(new Uint8Array(16));

    JSONresult = {
        "userData": {},
        "ownerData": {}
    };

    var encrdata = await encryptOwnerData("{\"alg\":\"RSA-OAEP-256\",\"e\":\"AQAB\",\"ext\":true,\"key_ops\":[\"encrypt\",\"wrapKey\"],\"kty\":\"RSA\",\"n\":\"xIAyDWZU2_hLRspWXxRC2HwbdolaNQ8mFW2W3WMySB4RJZX8BfV841vFruTsRxIvjkgm8A0B75A4aN6Z3fFLAIg668gfCKZG9O5TWac8_rsFssQEjI5qK0eRhHiv_tVYVXynCB_pRze_iCVfm0WHBV-Kajr7HIIHLZV1Lg1b8GdlcWeyOmpJgHBmk0Oz32jbYV8WjsUxdk6TpPufbv0PLH84B_1bpC2PGGOiVX5kJlt67D0EJBBnfBdRWVHb6DlTzPkLM5Gw1xkRJG1WVu9UQYyReI9g9Y6iohZBtDXqgg-6lIBT79r6CySYPHuCli10YbJMCDJZir6Moh9hKXURKw\"}", iv, key);

    var encryptedUID = {"0":205,"1":190,"2":150,"3":252,"4":67,"5":197,"6":209,"7":115,"8":198,"9":234,"10":37,"11":195,"12":36,"13":126,"14":246,"15":240,"16":250,"17":188,"18":56,"19":46,"20":15,"21":150,"22":78,"23":235,"24":42,"25":25,"26":6,"27":135,"28":112,"29":255,"30":90,"31":121,"32":89,"33":77,"34":54,"35":74,"36":2,"37":206,"38":132,"39":49,"40":6,"41":208,"42":194,"43":213,"44":246,"45":253,"46":22,"47":47,"48":52,"49":103,"50":229,"51":179,"52":122,"53":54,"54":181,"55":208,"56":128,"57":255,"58":99,"59":195,"60":160,"61":238,"62":38,"63":122,"64":35,"65":131,"66":241,"67":114,"68":77,"69":199,"70":245,"71":35,"72":177,"73":66,"74":189,"75":202,"76":143,"77":216,"78":64,"79":68,"80":90,"81":89,"82":253,"83":28,"84":160,"85":149,"86":196,"87":233,"88":41,"89":5,"90":180,"91":2,"92":59,"93":74,"94":174,"95":180,"96":118,"97":229,"98":99,"99":238,"100":131,"101":106,"102":97,"103":122,"104":87,"105":166,"106":238,"107":98,"108":35,"109":141,"110":219,"111":251,"112":123,"113":74,"114":11,"115":145,"116":42,"117":56,"118":228,"119":124,"120":213,"121":92,"122":139,"123":19,"124":163,"125":248,"126":40,"127":36};

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
