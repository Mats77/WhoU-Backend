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
const loginWithMailPath = '/login/mail/'
const loginWithSessionKeyPath = '/login/sessionkey'
const searchPartnerToPlayWithPath = '/play'
const gamesToRatePath = '/play/rating/gamesToRate'
const insertNewRatingPath = '/play/rating/insertNewRating'
const allItemsPath = '/benefit/allItems'
const buyItemPath = '/benefit/buyItem'
const userDataPath = '/userData/data'
const recentEventsPath = '/userData/recentEvents'
const changeModusPath = '/userData/changeModus'
const updateGPSPath = '/userData/updateGPS'
const newPhotoPath = '/photo/saveNew'
const deletePhotoPath = '/photo/delete'
const logOutPath = '/logout'
const deleteUserPath = '/delete'

//Implement each module
const playModule = require('./PlayModule')
const registrationModule = require('./RegistrationModule')
const loginModule = require('./LoginModule')
const userDataModule = require('./UserDataModule')
const benefitModule = require('./BenefitModule')

registrationModule.init() //First!!!
playModule.init() //second!!
loginModule.init()
userDataModule.init()
benefitModule.init()

var app = express()

app.use(bodyParser.urlencoded({
    extended: 'false'
}))
app.use(bodyParser.json())
app.use(cors())


app.post(newUserPath, cors(), function (req, res, next) {
    registrationModule.register(req, res)
})

app.get(loginWithMailPath, cors(), function (req, res, next) {
    loginModule.loginWithMail(req, res)
})

app.get(loginWithSessionKeyPath, cors(), function (req, res, next) {
    loginModule.loginWithSessionKey(req, res)
})

app.post(searchPartnerToPlayWithPath, cors(), function (req, res, next) {
    playModule.play(req, res)
})

app.get(userDataPath, function (req, res, next) {
    userDataModule.getUserData(req, res)
})

app.get(recentEventsPath, cors(), function (req, res, next) {
    userDataModule.getRecentEvents(req, res)
})

app.post(newPhotoPath, cors(), function (req, res, next) {
    userDataModule.savePhoto(req, res)
})

app.delete(deletePhotoPath, cors(), function (req, res, next) {
    userDataModule.deletePhoto(req, res)
})

app.put(logOutPath, cors(), function (req, res, next) {
    loginModule.logout(req, res)
})

app.put(changeModusPath, cors(), function (req, res, next) {
    userDataModule.changeModus(req, res)
})

app.put(updateGPSPath, cors(), function (req, res, next) {
    userDataModule.updateGPS(req, res)
})

app.get(gamesToRatePath, cors(), function (req, res, next) {
    playModule.getGamesToRate(req, res)
})

app.put(insertNewRatingPath, cors(), function (req, res, next) {
    playModule.handleRating(req, res)
})

app.get(allItemsPath, cors(), function (req, res, next) {
    benefitModule.getAllItems(req, res)
})

app.post(buyItemPath, cors(), function (req, res, next) {
    benefitModule.buyItem(req, res)
})

app.delete(deleteUserPath, cors(), function (req, res, next) {
    registrationModule.deleteUser(req, res)
})

app.get('/test', function (req, res, next) {
    playModule.photoTest(req, res)
})

app.listen(port)