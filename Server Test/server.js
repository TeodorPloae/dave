var express = require('express');
var bodyParser = require('body-parser');
var app = express();


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({ type: 'text/plain'}))

app.post('/', function (req, res) {
    
    console.log("am primit cv");
    

    console.log(req.body);
    
    
});

app.listen(5016, function () {
    console.log('Example app listening on port 5016.');
});