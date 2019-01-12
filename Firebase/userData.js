class UserData {
    constructor(userId){
        dbUser = firebase.database().ref('/users/' + userId).once('value');

        this.firstName = dbUser.val().firstName;
        this.lastName = dbUser.val().lastName;
        this.username = dbUser.val().username;
    }
}

let theUser = new UserData(firebase.auth().currentUser.uid);

document.getElementById("hello_text").innerText = "Hello " + theUser.username;

//current user is null <==