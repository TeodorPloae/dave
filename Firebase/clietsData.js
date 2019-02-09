var db_button_select = document.getElementById("DB_Select")

function setSelectDB(theUser) {
    firebase.database().ref('/users/' + theUser.uid + '/sites').once('value')
        .then( (snapshot) => {

            Object.keys(snapshot.val()).forEach(function(siteName) {
                var option = document.createElement("option");
                option.setAttribute("value", siteName);
                option.innerHTML = siteName;
                db_button_select.appendChild(option);
            })

        })
        .catch(e => console.log(e.message));
}