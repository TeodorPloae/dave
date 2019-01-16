const log_in_btn = document.getElementById("login_element");
const sign_up_btn = document.getElementById("sign_up_element");
const log_in_submit = document.getElementById("login-submit");
const sign_up_submit = document.getElementById("sign-up-submit");
const auth = firebase.auth();

class LogInData {
    constructor(){
        this.email = document.getElementById("login-email").value;
        this.password = document.getElementById("login-password").value;
    }



}

class SignUpData {
    constructor(){
        this.username = document.getElementById("sign-up-username").value;
        this.password = document.getElementById("sign-up-password").value;
        this.confirmPassword = document.getElementById("sign-up-confirm_password").value;
        this.firstName = document.getElementById("first_name").value;
        this.lastName = document.getElementById("last_name").value;
        this.email = document.getElementById("email").value;
    }

    isEmailValid(){
        var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (this.email.match(mailformat)) {
            return true;
        } else {
            return false;
        }
    }

    doesThePasswordsMatch(){
        if (this.password.localeCompare(this.confirmPassword) == 0){
            return true;
        } else {
            return false;
        }
    }
}

sign_up_submit.addEventListener('click', e => {
    
    let userData = new SignUpData();

    if (!userData.isEmailValid()){
        alert("You have entered an invalid email address!");
        return;
        
    }

    if(!userData.doesThePasswordsMatch()){
        alert("The Passwords dont match!");
        return;
    }

    auth.createUserWithEmailAndPassword(userData.email, userData.password)
        .then(function success(user) {
            firebase.database().ref('users/' + user.user.uid).set({
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username
                })
                .then(function() {
                   window.location = 'dashboard.html';
                })
                .catch(e => console.log(e.message));
        })
        .catch(e => {
            alert(e.message);
            return;
        }
        );
})

log_in_submit.addEventListener('click', e => {

    let logInData = new LogInData();

        auth.signInWithEmailAndPassword(logInData.email, logInData.password)
            .then(function(){
                window.location = 'dashboard.html';
            })
            .catch(e => {
                alert(e.message);
                return;
            }
            );

    // var userId = firebase.auth().currentUser.uid;
    // firebase.database().ref('users/' + userId).set({
    //     firstName: "Ardeleanu",
    //     lastName: "Angel",
    //     username: "anggabard"
    //   });


    //sessionStorage.setItem("email", "ceapa@123.com");
    // let userData = new LogInData();
})