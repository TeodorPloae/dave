const log_in_btn = document.getElementById("login_element");
const sign_up_btn = document.getElementById("sign_up_element");
const log_in_submit = document.getElementById("login-submit");
const sign_up_submit = document.getElementById("sign-up-submit");
const auth = firebase.auth();

class LogInData {
    constructor(){
        this.email = document.getElementById("email-username").value;
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

    const promise = auth.createUserWithEmailAndPassword(userData.email, userData.password);

    promise.catch(e => console.log(e.message));
});

log_in_submit.addEventListener('click', e => {
    let userData = new LogInData();

    const promise = auth.createUserWithEmailAndPassword(userData.email, userData.password);

    promise.catch(e => console.log(e.message));
})
