const logout_button = document.getElementById("logout_button");

logout_button.addEventListener('click', e => {
    firebase.auth().signOut()
        .then(function(){
            //logout extra functionality
            sessionStorage.clear();
            window.location = '/home/anggbard/UAIC/An3/sem1/CLIW/dave/home.html';
    })
    .catch(e => console.log(e.message));
})