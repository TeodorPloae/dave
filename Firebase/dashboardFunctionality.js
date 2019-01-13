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
            window.location = '/home/anggbard/UAIC/An3/sem1/CLIW/dave/home.html';
        })
        .catch(e => console.log(e.message));
});


storage.ref('thefile.js').getDownloadURL()
    .then(function (url) {
        link.setAttribute('href', url);
        link.setAttribute('download', 'thefile.js');
    })
    .catch(e => console.log(e.message));

// download_button.addEventListener('click', e => {
//     storage.ref('thefile.js').getDownloadURL()
//         .then(function (url) {
//             var xhr = new XMLHttpRequest();
//             xhr.responseType = 'blob';
//             xhr.onload = function (event) {
//                 var blob = xhr.response;
//             };
//             xhr.open('GET', url);
//             xhr.send();

//         })
//         .catch(e => console.log(e.message));
// })
