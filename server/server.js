'use strict';

// Constants
const PORT = 80;
const HOST = '0.0.0.0';

var express = require('express');
var path = require('path');
var app = express();
// enable public html
app.use(express.static(path.join(__dirname, 'public')));
// enable POST request decoding
var bodyParser = require('body-parser');
app.use(bodyParser.json());     // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({// to support URL-encoded bodies
    extended: true
}));
var PIFD = require('node-pifacedigital');
var pifacedigital = new PIFD.PIFaceDigital(0, true); //TODO multi piface

// TEST
console.log("Sending true on pin 1");
pifacedigital.set(0, 1);
var val = pifacedigital.getInput();
console.log("Raspi inputs : " + JSON.stringify(val));
console.log("Sending false on pin 1");
pifacedigital.set(0, 0);
console.log("Raspi inputs : " + JSON.stringify(val));

// DEBUG

// App
app.get('/api/v1/input/get', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({0: {0: false, 1: false, 2: false, 3: false}}));
});

app.get('/api/v1/output/get', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({0: {0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false}}));
});

app.post('/api/v1/output/set', (req, res) => {
    console.log("Request : " + JSON.stringify(req.body));
    var piface = req.body.pin || 'undefined'; //TODO for multi piface
    var pin = req.body.pin || 'undefined';
    var state = req.body.state || 'undefined';
//    if (piface !== 'undefined' && pin !== 'undefined' && state !== 'undefined') {
        pifacedigital.set(pin, state);
        console.log("Sending " + state + " on pin " + pin);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({message: 'ok', status: {0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false}}));
//    } else {
//        res.setHeader('Content-Type', 'application/json');
//        res.send(JSON.stringify({message: 'ko', error: 'fail'}));
//    }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);