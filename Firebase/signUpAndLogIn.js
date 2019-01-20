const log_in_btn = document.getElementById("login_element");
const sign_up_btn = document.getElementById("sign_up_element");
const log_in_submit = document.getElementById("login-submit");
const sign_up_submit = document.getElementById("sign-up-submit");
const auth = firebase.auth();

class LogInData {
    constructor() {
        this.email = document.getElementById("login-email").value;
        this.password = document.getElementById("login-password").value;
    }
}

class SignUpData {
    constructor() {
        this.username = document.getElementById("sign-up-username").value;
        this.password = document.getElementById("sign-up-password").value;
        this.confirmPassword = document.getElementById("sign-up-confirm_password").value;
        this.firstName = document.getElementById("first_name").value;
        this.lastName = document.getElementById("last_name").value;
        this.email = document.getElementById("email").value;

        this.generateKey();

        //this.privateKey = this.generateKey().then( (res) => {
        //return res;
        //});

    }

    isEmailValid() {
        var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (this.email.match(mailformat)) {
            return true;
        } else {
            return false;
        }
    }

    doesThePasswordsMatch() {
        if (this.password.localeCompare(this.confirmPassword) == 0) {
            return true;
        } else {
            return false;
        }
    }

    async generateKey() {
        var privateKeyExport;
        var publicKeyExport;
        var algorithm = {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: {
                name: "SHA-256"
            }
        };

        await window.crypto.subtle.generateKey(
            algorithm,
            true,
            ["encrypt", "decrypt"]
        )
            .then(async (result) => {

                await window.crypto.subtle.exportKey(
                    "jwk",
                    result.privateKey
                )
                    .then((keyData) => {
                        this.privateKey = keyData;
                    });

                await window.crypto.subtle.exportKey(
                    "jwk",
                    result.publicKey
                )
                    .then((keyData) => {
                        this.publicKey = keyData;
                    });
            });
    }
}

sign_up_submit.addEventListener('click', e => {

    let userData = new SignUpData();

    if (!userData.isEmailValid()) {
        alert("You have entered an invalid email address!");
        return;

    }

    if (!userData.doesThePasswordsMatch()) {
        alert("The Passwords dont match!");
        return;
    }

    auth.createUserWithEmailAndPassword(userData.email, userData.password)
        .then(function success(user) {
            firebase.database().ref('users/' + user.user.uid).set({
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username,
                privateKey: userData.privateKey,
                publickey: userData.publicKey
            })
                .then(function () {
                    window.location = 'dashboard.html';
                    console.log("success");

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
        .then(function () {
            window.location = 'dashboard.html';
        })
        .catch(e => {
            alert(e.message);
            return;
        }
        );
})