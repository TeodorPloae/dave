const logout_button = document.getElementById("logout_button");
const download_button = document.getElementById("download_button");
const link = document.getElementById("download_link");
const db_select = document.getElementById("DB_Select");
const modal = document.getElementById("modal");

var storage = firebase.storage();
var pathReference = storage.ref('thefile.js');

logout_button.addEventListener('click', e => {
    firebase.auth().signOut()
        .then(function () {
            //logout extra functionality
            sessionStorage.clear();
            window.location = 'home.html';
        })
        .catch(e => console.log(e.message));
});

download_button.addEventListener('click', e => {

})

function loadData(theUser) {
    var srvPublicKey;
    // var xhr = new XMLHttpRequest();
    // xhr.responseType = 'json';

    // xhr.onload = function (event) {
    //     srvPublicKey = xhr.response;

    //     console.log(srvPublicKey);
    // };

    // xhr.open('GET', "http://localhost:5016/getPublicKey");
    // xhr.setRequestHeader('Access-Control-Allow-Headers', '*');
    // xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    // xhr.send();

    fetch('http://localhost:5016/getPublicKey', {mode: "no-cors"})
.then(response => response.json())
.then(data => {
  console.log(data) // Prints result from `response.json()` in getRequest
})
.catch(error => console.error(error))

    console.log(srvPublicKey);
    //console.log(theUser.email, theUser.publicKey)
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

                    text = text.replace("{email}", theUser.email);
                    text = text.replace("{RSAPublicKey}", theUser.publicKey);

                    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                    link.setAttribute('download', 'theFile2.js');
                });

                reader.readAsText(blob);
            };

            xhr.open('GET', url);
            xhr.send();
        })
        .catch(e => console.log(e.message));
    download_button.style.backgroundColor = "#1ab188";


}

db_select.addEventListener('click', e => {

    modal.style.display = 'block';

});

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}