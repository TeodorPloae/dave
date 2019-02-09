const db_button_select = document.getElementById("DB_Select");
const site_db_view = document.getElementById("site_db_view");

function setSelectDB(theUser) {
    firebase.database().ref('/users/' + theUser.uid + '/sites').once('value')
        .then( (snapshot) => {

            Object.keys(snapshot.val()).forEach(function(siteName) {
                siteName = siteName.replace('_','.');
                var option = document.createElement("option");
                option.setAttribute("value", siteName);
                option.innerHTML = siteName;
                db_button_select.appendChild(option);
            })


            db_button_select.disabled = false;
            db_button_select.style.backgroundColor = "#1ab188";
        })
        .catch(e => console.log(e.message));
}

db_button_select.addEventListener("change", e => {
    siteName = db_button_select.value.replace(".", "_");

    var request = new XMLHttpRequest();
    if ('withCredentials' in request) {
        request.open('POST', 'http://localhost:5016/getUserDataFromSiteName', true);
        // Just like regular ol' XHR
        request.onreadystatechange = function () {
            if (request.readyState === 4) {
                if (request.status >= 200 && request.status < 400) {
                    // JSON.parse(request.responseText) etc.
                    var JsonResponse = JSON.parse(request.response);
                    
                    var userData = {};
                    var attributes = [];

                    const start = async () => {
                        await asyncForEach(Object.keys(JsonResponse), async (timeStamp) => {
                            let aesComponents = JsonResponse[timeStamp]["aesComponents"];

                            delete JsonResponse[timeStamp]["aesComponents"];
    
                            aesComponents = await decryptUserAEScomponents(aesComponents, theUser.privateKey);
    
                            var currentUserData = {};
                            Object.keys(JsonResponse[timeStamp]).forEach( async function (key) {
                                currentUserData[key] = await aesDecrypt(
                                    JsonResponse[timeStamp][key], 
                                    aesComponents.key,
                                    aesComponents.iv
                                    );
                                if (attributes.indexOf(key) < 0 ){
                                    attributes.push(key);
                                }
                                
                            });
                            
                            userData[timeStamp] = currentUserData;
                        });

                        attributes.sort();
                        userData["attributes"] = attributes;
                        setTimeout(function() {
                            populateTable(userData);
                        } , 200);
                        
                    }

                    start();
            
                } else {
                    // Handle error case
                    console.log("error at getUserData from server!");
                }
                
            }
        };
        request.setRequestHeader('Content-type', 'text/plain; charset=utf-8');
        let data = JSON.stringify({"uid" : theUser.encryptedUid, "siteName" : siteName});
        request.send(data);
    }
});

function populateTable(userData) {
    var table = document.createElement("table");
    site_db_view.appendChild(table);

    var columnsName = document.createElement("tr");
    table.appendChild(columnsName);


    userData.attributes.forEach(function(attribute){
        var columnName = document.createElement("th");
        columnName.innerHTML = attribute;
        columnsName.appendChild(columnName);
    });

    delete userData.attributes;

    
    Object.keys(userData).forEach(function(timeStamp){
        var newTr = document.createElement("tr");
         
        Object.keys(userData[timeStamp]).forEach(function(key){
            var newTd = document.createElement("td");
            newTr.appendChild(newTd);
            newTd.innerHTML = userData[timeStamp][key];
                   
        });
        table.appendChild(newTr);
    });
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}