var mongoose = require('mongoose')
var db
var UserModel

var init = function () {
    mongoose.connect('mongodb://Mats:MobileProject.123@localhost:20766/whoU')
    db = mongoose.connection
    db.on('error', function (err) {
        console.log(err)
        return
    })
    db.once('open', function () {
        console.log('open')
        UserModel = require('mongoose').model('User')
    })
}

var loginWithMail = function (req, res) {
    res.type('text/plain')
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    var credentials = req.body
    var sessionkey = Math.random() * 1e20

    UserModel.findOne({
        mail: credentials.mail,
        password: credentials.password
    }, function (err, user) {
        if (err) {
            console.err
            res.send('-100') //Error with database Connection
            return console.err
        } else if (user == null) {
            console.log('No User found')
            return res.send(-3) //No User Found
        } else {
            user.sessionkey = sessionkey
            user.save(function (err) {
                if (err) return console.log(err)
                res.send('SK' + sessionkey)
            })
        }
    })
}

var loginWithSessionKey = function (req, res) {
    res.type('text/plain')
    var credentials = req.body
    console.log(credentials)
    UserModel.findOne({
        _id: credentials._id,
        sessionkey: credentials.sessionkey
    }, function (err, user) {
        if (err) {
            res.send('-100')
            return console.err
        } else if (user == null) {
            res.send('-4') //No User found
            return
        }
        console.log('User: ' + user)
        res.send(user)
    })
}

exports.loginWithMail = loginWithMail
exports.loginWithSessionKey = loginWithSessionKey
exports.init = init