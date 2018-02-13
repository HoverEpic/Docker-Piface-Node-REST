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
// disabling caching for all requests
app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next()
});
var PIFD = require('node-pifacedigital');
var pifaces = []; // for multi piface
pifaces[0] = new PIFD.PIFaceDigital(0, true); //TODO instanciate instances

// INIT, set all output to false
for (var i = 0; i < pifaces.length; i++) {
    var input = [];
    for (var j = 0; j < 8; j++) {
        pifaces[i].set(i, 0);
    }
}

// TEST
//console.log("Sending true on pin 1");
//pifacedigital.set(0, 1);
//var val = pifacedigital.getInput();
//console.log("Raspi inputs : " + JSON.stringify(val));
//console.log("Sending false on pin 1");
//pifacedigital.set(0, 0);
//console.log("Raspi inputs : " + JSON.stringify(val));

// DEBUG

// App
app.get('/api/v1/input/get', (req, res) => {
    var data = [];
    for (var i = 0; i < pifaces.length; i++) {
        var input = [];
        for (var j = 1; j <= 8; j++) {
            var state = (pifaces[i].getInput() & j) === 0;
            input[j] = state;
        }
        data[i] = input;
    }
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify({data}));
});

app.get('/api/v1/output/get', (req, res) => {
    var data = [];
    for (var i = 0; i < pifaces.length; i++) {
        var input = [];
        for (var j = 0; j <= 7; j++) {
            var state = (pifaces[i].pi.getOutput() & j) === 0;
            input[i] = state;
        }
        data[i] = input;
    }
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify(data));
});

app.post('/api/v1/output/set', (req, res) => {
    console.log("Request : " + JSON.stringify(req.body));
    res.header('Content-Type', 'application/json');
    var piface = req.body.piface || 'undefined'; //TODO for multi piface
    var pin = req.body.pin || 'undefined';
    var state = req.body.state || false;
    if (piface !== 'undefined' && pin !== 'undefined') {
        pifaces[piface].set(pin, state);
        console.log("Sending " + state + " on pin " + pin);
        res.send(JSON.stringify({message: 'ok'}));
    } else {
        res.send(JSON.stringify({message: 'ko', error: 'incorrect data'}));
    }
});

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

//var callback = function (pin, type) {
//    var pressed = type === 'hilo'; // buttons are normally closed
//    console.log("Receiving " + pin + " pressed " + pressed);
//
//    var input = pifacedigital.getInput();
//    console.log("Input state all " + dec2bin(input));
//    for (var i = 1; i <= 8; i++) {
//        var state = (pifacedigital.getInput() & i) == 0;
//        console.log("Input state " + i + " " + state);
//    }
//};
//pifacedigital.watch(0, callback);
//pifacedigital.watch(1, callback);
//pifacedigital.watch(2, callback);
//pifacedigital.watch(3, callback);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);