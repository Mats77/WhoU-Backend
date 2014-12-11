//Necessary Node.js modules
const http = require('http')
const url = require('url')
const express = require('express')
const bodyParser = require('body-parser')
var mongoose = require('mongoose')

//Configure Server App
var app = express()
app.use(bodyParser.urlencoded({
    extended: 'false'
}))
app.use(bodyParser.json())
//mongoose.connect('mongodb://localhost/whoU')
//var db = mongoose.connection


//Paths for routing of APIs
const newUserPath = '/newUser'
const loginWithUsernamePath = '/api/login/username'
const loginWithSessionKeyPath = '/api/login/sessionkey'
const searchPartnerToPlayWithPath = '/api/play'

//Implement each module
const playModule = require('./PlayModule')
const registrationModule = require('./RegistrationModule')
const loginModule = require('./LoginModule')
    //const initModule = require('./InitModule')

//stuff
const port = 61234

app.post(newUserPath, function (req, res) {
    registrationModule.register(req, res)
})

app.get(loginWithUsernamePath, function (req, res) {
    loginModule.loginWithMail(req, res)
})

app.get(loginWithSessionKeyPath, function (req, res) {
    loginModule.loginWithSessionKey(req, res)
})

app.post(searchPartnerToPlayWithPath, function (req, res) {
    playModule.play(req, res)
})

registrationModule.init()
loginModule.init()
playModule.init()

app.listen(port)