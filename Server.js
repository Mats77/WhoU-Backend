//node modules
var http = require('http');
var url = require('url')
var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')

//ports and paths
const port = 61234
const newUserPath = '/newUser'
const loginWithUsernamePath = '/login/username'
const loginWithSessionKeyPath = '/login/sessionkey'
const searchPartnerToPlayWithPath = '/play'

//Implement each module
const playModule = require('./PlayModule')
const registrationModule = require('./RegistrationModule')
const loginModule = require('./LoginModule')
registrationModule.init() //First!!!
playModule.init()
loginModule.init()

var app = express()

app.use(bodyParser.urlencoded({
    extended: 'false'
}))
app.use(bodyParser.json())


//app.get(newUserPath, function (req, res, next) {
//    res.type('text/plain')
//    res.header("Access-Control-Allow-Origin", "*");
//    res.header("Access-Control-Allow-Headers", "X-Requested-With");
//    res.send('LÄUFT BEI MIR 1')
//})

app.post(newUserPath, function (req, res, next) {
    registrationModule.register(req, res)
})

app.get(loginWithUsernamePath, function (req, res, next) {
    loginModule.loginWithMail(req, res)
})

app.get(loginWithSessionKeyPath, function (req, res, next) {
    //    res.type('text/plain')
    //    res.header("Access-Control-Allow-Origin", "*");
    //    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    //    res.send('LÄUFT BEI MIR 1')
    loginModule.loginWithSessionKey(req, res)
})

app.post(searchPartnerToPlayWithPath, function (req, res, next) {
    playModule.play(req, res)
})

app.get('/test', function (req, res, next) {
    playModule.photoTest(req, res)
})

app.use(function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.send("FAIIIIIIL");
});

app.listen(port)