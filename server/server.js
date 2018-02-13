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
// multi piface
var pifaces = [];
var pifaces_count = 1;
if (process.env.PIFACE_COUNT !== 'undefined' && !isNaN(process.env.PIFACE_COUNT))
    pifaces_count = parseInt(process.env.PIFACE_COUNT);
for (var i = 0; i < pifaces_count; i++)
    pifaces[i] = new PIFD.PIFaceDigital(i, true);
console.log("Started " + pifaces.length + " PIFaceDigital controller" + (pifaces.length > 1 ? "s" : ""));

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
debugInputs();
debugOutputs();

// App
app.get('/api/v1/piface/get', (req, res) => {
    var data = [];
    for (var i = 0; i < pifaces.length; i++) {
        data[i] = i;
    }
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify({data}));
});

app.get('/api/v1/input/get', (req, res) => {
    var data = [];
    for (var i = 0; i < pifaces.length; i++) {
        var input = [];
        for (var j = 0; j <= 7; j++) {
            var state = (pifaces[i].getInput() & 2**j) === 0;
//            console.log("Raspi inputs : pin " + j + " state " + state);
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
        var output = [];
        for (var j = 0; j <= 7; j++) {
            var state = (pifaces[i].pi.getOutput() & 2**j) !== 0;
//            console.log("Raspi outputs : pin " + j + " state " + state);
            output[j] = state;
        }
        data[i] = output;
    }
    res.header('Content-Type', 'application/json');
    res.send(JSON.stringify({data}));
});

app.post('/api/v1/output/set', (req, res) => {
    console.log("Request : " + JSON.stringify(req.body));
    res.header('Content-Type', 'application/json');
    var piface = req.body.piface || 'undefined'; //TODO for multi piface
    var pin = req.body.pin || 'undefined';
    var state = req.body.state || false;
    if (piface !== 'undefined' && pin !== 'undefined') {
        if (getOutput(piface, pin) == !state) {
            pifaces[piface].set(pin, state);
            console.log("Sending " + state + " on pin " + pin);
    //        debugOutputs();
            res.send(JSON.stringify({message: 'ok'}));
        } else {
            res.send(JSON.stringify({message: 'ko', error: 'no changes'}));
        }
    } else {
        res.send(JSON.stringify({message: 'ko', error: 'incorrect data'}));
    }
});

function getOutput(piface, pin) {
    return (pifaces[piface].getOutput() & 2**pin) !== 0;
}

function dec2bin(dec) {
    return (dec >>> 0).toString(2);
}

function debugInputs() {
    console.log("Debug logging for piface 0");
    var input = pifaces[0].getInput();
    console.log("Input states " + input + " (" + dec2bin(input) + ")");
    for (var i = 0; i <= 7; i++) {
        var state = (input & 2**i) === 0;
        console.log("Input " + i + " " + (state ? "true" : "false") + " (" + (input & 2**i) + ")");
    }
}

function debugOutputs() {
    console.log("Debug logging for piface 0");
    var output = pifaces[0].getOutput();
    console.log("Output states " + output + " (" + dec2bin(output) + ")");
    for (var i = 0; i <= 7; i++) {
        var state = (output & 2**i) !== 0;
        console.log("Output " + i + " " + (state ? "true" : "false") + " (" + (output & 2**i) + ")");
    }
    // crapy String based solution
//    var binary = dec2bin(output);
//    for (var pos = 0; pos < binary.length; pos++) {
//        var state = binary.split('').reverse()[pos] === '1';
//        console.log("Output " + pos + " " + (state ? "true" : "false"));
//    }
}

var callback = function (pin, type) {
    var pressed = type === 'hilo'; // buttons are normally closed
    if (pressed) {
        console.log("Receiving " + pin + " pressed " + pressed);
        debugInputs();
    }
};
pifaces[0].watch(0, callback);
pifaces[0].watch(1, callback);
pifaces[0].watch(2, callback);
pifaces[0].watch(3, callback);
pifaces[0].watch(4, callback);
pifaces[0].watch(5, callback);
pifaces[0].watch(6, callback);
pifaces[0].watch(7, callback);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);