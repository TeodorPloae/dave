 
var elemente = document.querySelectorAll('.tab a')
var login = document.getElementById("login");
var sign_up = document.getElementById("sign-up");
login.style.display = 'none';

elemente[0].addEventListener('click', function (e) {

    sign_up.style.display = 'inline-grid';
    login.style.display = 'none';
    
});

elemente[1].addEventListener('click', function (e) {
    
    login.style.display = 'inline-grid';
    sign_up.style.display = 'none';
    
});