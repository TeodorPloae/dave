var theUser;

class UserData{
    constructor(uid){
        this.uid =  uid;
        this.importKeys();

    }

    async importKeys(){
        var algorithm = {
            name: "RSA-OAEP",
            hash: {
                name: "SHA-256"
            }
        };
        
        
        await firebase.database().ref('/users/' + this.uid).once('value')
            .then( async (snapshot) => {
                
                this.publicKey = JSON.stringify(snapshot.val().publicKey);
                //console.log(JSON.parse(this.publicKey));

                    await window.crypto.subtle.importKey(
                        "jwk",
                        snapshot.val().privateKey,
                        algorithm,
                        false,
                        ["decrypt", "unwrapKey"]
                        )
                        .then( (key) => {
                            this.privateKey = key;
                        }) 
            })
    }

    setEmail(email){
        this.email = email;
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

                User.setEmail(user.email);
                document.getElementById("hello_text").innerText = "Hello " + sessionStorage.getItem("username");
            })
            .catch(e => console.log(e.message));
    }

    theUser = User;
    loadData(theUser);
});
