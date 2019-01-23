var formular = document.querySelector('form');

formular.addEventListener('submit', (e) => {
    //e.preventDefault();
    var data = new FormData(e.target);
    
     var myJson = {};

     for(var pair of data.entries()) {
        
         myJson[pair[0]] = pair[1];
    
      }

     console.log(myJson);
     document.getElementById('password').value = 'SorryBruh'; // GRIJA LA PAROLELE DIN URL !!!!!!!!!!!!!
     
     fetch("http://localhost:5016",
{
    method: "POST",
    headers: {
            "Content-Type": "text/plain",
        },
    body: JSON.stringify(myJson)
})
     
     

  });





