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
const skipUserPath = '/benefit/skipUser'
const userDataPath = '/userData/data'
const recentEventsPath = '/userData/recentEvents'
const changeModusPath = '/userData/changeModus'
const updateGPSPath = '/userData/updateGPS'
const insertPushIdPath = '/userData/pushId'
const newPhotoPath = '/photo/saveNew'
const getPhotoPath = '/photo/get'
const deletePhotoPath = '/photo/delete'
const updateProfilPhotoPath = '/photo/profilPhoto'
const logOutPath = '/logout'
const deleteUserPath = '/delete'
const usersCurrentlyPlayedWithPath = '/chat/list'
const previousMessagesPath = '/chat/previousMessages'
const messagesLeftPath = '/chat/messagesLeftPath'
const upgradeMessagesPath = '/chat/upgradeMessages'
const sendMessagePath = '/chat/sendMessage'
const searchStartedPushPath = '/chat/searchStartedPush'
const sendStandardMessagePath = '/chat/sendStandardMessage'

//Implement each module
const playModule = require('./PlayModule')
const chatModule = require('./ChatModule')
const registrationModule = require('./RegistrationModule')
const loginModule = require('./LoginModule')
const userDataModule = require('./UserDataModule')
const benefitModule = require('./BenefitModule')
const initModule = require('./InitModule')

//Initialization methods of each module --> setting up db connection for example
registrationModule.init() //First!!!
playModule.init() //second!!
loginModule.init()
userDataModule.init()
benefitModule.init()
chatModule.init()

//setting up the node-server
var app = express()
app.use(bodyParser.urlencoded({
    extended: 'false'
}))
app.use(bodyParser.json())
app.use(cors())

//each API is built the same. These methods route the different requests into the modules and pass the request and response objects as arguments
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

app.post(deletePhotoPath, cors(), function (req, res, next) {
    console.log('Server: ' + req.params[0])
    console.log('Server: ' + req.body)
    userDataModule.deletePhoto(req, res)
})

app.get(getPhotoPath, cors(), function (req, res, next) {
    userDataModule.getPhoto(req, res)
})

app.put(updateProfilPhotoPath, cors(), function (req, res, next) {
    userDataModule.updateProfilPhoto(req, res)
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

app.put(insertPushIdPath, cors(), function (req, res, next) {
    userDataModule.insertPushId(req, res)
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

app.put(skipUserPath, cors(), function (req, res, next) {
    benefitModule.skipUser(req, res)
})

app.delete(deleteUserPath, cors(), function (req, res, next) {
    registrationModule.deleteUser(req, res)
})

app.get(usersCurrentlyPlayedWithPath, cors(), function (req, res, next) {
    chatModule.getUsersCurrentlyPlayedWith(req, res)
})

app.get(previousMessagesPath, cors(), function (req, res, next) {
    chatModule.getPreviousMessages(req, res)
})

app.get(messagesLeftPath, cors(), function (req, res, next) {
    chatModule.getMessagesLeft(req, res)
})

app.put(upgradeMessagesPath, cors(), function (req, res, next) {
    benefitModule.upgradeMessageCount(req, res)
})

app.post(sendMessagePath, cors(), function (req, res, next) {
    chatModule.sendMessage(req, res)
})

app.post(searchStartedPushPath, cors(), function (req, res, next) {
    chatModule.pushSearchStarted(req, res)
})

app.post(sendStandardMessagePath, cors(), function (req, res, next) {
    chatModule.sendStandardMessage(req, res)
})

app.get('/test', function (req, res, next) {
    playModule.photoTest(req, res)
})

//server starts
app.listen(port)