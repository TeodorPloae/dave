 
var elemente = document.querySelectorAll('.tab');
var sign_up_button = elemente[0];
var login_button = elemente[1];

var login = document.getElementById("login");
var sign_up = document.getElementById("sign-up");

var main_form = document.getElementById("main_form");
var sign_up_list_element = document.getElementById("sign_up_element");
var login_list_element = document.getElementById("login_element");
login.style.display = 'none';

sign_up_button.addEventListener('click', function (e) {
    sign_up.style.display = 'grid';
    login.style.display = 'none';

    sign_up_list_element.classList.remove("inactive");
    login_list_element.classList.add("inactive");
});

login_button.addEventListener('click', function (e) {
    
    login.style.display = 'grid';
    sign_up.style.display = 'none';

    login_list_element.classList.remove("inactive");
    sign_up_list_element.classList.add("inactive");
});