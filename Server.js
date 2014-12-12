//node modules
var http = require('http');
var url = require('url')
var express = require('express')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var cors = require('cors')

//ports and paths
const port = 61234
const newUserPath = '/newUser'
const loginWithMailPath = '/login/mail'
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
app.use(cors())


app.post(newUserPath, cors(), function (req, res, next) {
    registrationModule.register(req, res)
})

app.post(loginWithMailPath, cors(), function (req, res, next) {
    loginModule.loginWithMail(req, res)
})

app.post(loginWithSessionKeyPath, cors(), function (req, res, next) {
    loginModule.loginWithSessionKey(req, res)
})

app.post(searchPartnerToPlayWithPath, cors(), function (req, res, next) {
    playModule.play(req, res)
})

app.get('/test', function (req, res, next) {
    playModule.photoTest(req, res)
})

app.listen(port)