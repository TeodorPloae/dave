window.isUser = false;
class UserData{
    constructor(uid){
        this.uid =  uid;
        this.importKey("privateKey");
        this.importKey("publicKey");
    }

    async importKey(type){
        var algorithm = {
            name: "RSA-OAEP",
            hash: {
                name: "SHA-256"
            }
        };
        
        var purpose = "";
        if (type == "publicKey") {
            purpose = "encrypt";
        } else {
            purpose = "decrypt";
        }
        
        await firebase.database().ref('/users/' + this.uid).once('value')
            .then( async (snapshot) => {
                await window.crypto.subtle.importKey(
                    "jwk",
                    snapshot.val()[type],
                    algorithm,
                    false,
                    [purpose]
                    )
                    .then( (key) => {
                        this[type] = key;
                    })
            })
    }
}

 firebase.auth().onAuthStateChanged(async user => {
    if (user) {
        var User = new UserData(user.uid);
        await firebase.database().ref('/users/' + user.uid).once('value')
            .then(function (snapshot) {
                sessionStorage.setItem("firstName", snapshot.val().firstName);
                sessionStorage.setItem("lastName", snapshot.val().lastName);
                sessionStorage.setItem("username", snapshot.val().username);

                document.getElementById("hello_text").innerText = "Hello " + sessionStorage.getItem("username");
            })
            .catch(e => console.log(e.message));
    }

    loadData(User);
});

function loadData(User){
    //do stuff with user data
    console.log(User);
}