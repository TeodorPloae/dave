const logout_button = document.getElementById("logout_button");
const download_button = document.getElementById("download_button");
const link = document.getElementById("download_link");

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
    download_button.style.backgroundColor = "#1ab188"
    console.log(theUser);
    storage.ref('thefile.js').getDownloadURL()
        .then(function (url) {
            link.setAttribute('download', 'thefile.js');

            var xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';

            xhr.onload = function (event) {
                var blob = xhr.response;

                //link.setAttribute('href', window.URL.createObjectURL(blob));

                const reader = new FileReader();

                reader.addEventListener('loadend', (e) => {
                    var text = e.srcElement.result;

                    text = text.replace("{name}", sessionStorage.getItem("username"));
                    text = text.replace("{key}", theUser.uid);

                    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
                    link.setAttribute('download', 'theFile2.js');
                });

                // Start reading the blob as text.
                reader.readAsText(blob);
            };

            xhr.open('GET', url);
            xhr.send();
        })
        .catch(e => console.log(e.message));
}