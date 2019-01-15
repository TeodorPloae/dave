firebase.auth().onAuthStateChanged(user => {
    if (user) {
        sessionStorage.setItem("uid", user.uid);
        firebase.database().ref('/users/' + user.uid).once('value')
            .then(function (snapshot) {
                sessionStorage.setItem("firstName", snapshot.val().firstName);
                sessionStorage.setItem("lastName", snapshot.val().lastName);
                sessionStorage.setItem("username", snapshot.val().username);

                document.getElementById("hello_text").innerText = "Hello " + sessionStorage.getItem("username");
            })
            .catch(e => console.log(e.message));
    }
});