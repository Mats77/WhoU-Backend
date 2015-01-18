var mongoose = require('mongoose')
var db
var UserModel

//db initialization
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

//first login on a device
var loginWithMail = function (req, res) {
    var mail = req.param('mail')
    var password = req.param('password')
    console.log('LOGIN WITH MAIL: mail + password')


    UserModel.findOne({
        mail: mail,
        password: password
    }, function (err, user) {
        if (err) {
            console.log(err)
            res.send('-100') //Error with database Connection
            return
        } else if (user == null) {
            console.log('No User found')
            res.send('-3') //No User Found
            return
        } else {
            //creating a random 20-digit sessionkey
            var sessionkey = Math.random() * 1e20
            user.sessionkey = sessionkey

            //saving to db
            user.save(function (err) {
                if (err) {
                    console.log(err)
                    res.send('-4')
                    return
                }
                //and returning to client
                res.send({
                    'UID': user._id,
                    'SessionKey': sessionkey.toString()
                })
            })
        }
    })
}

//all subsequent device done automatically
var loginWithSessionKey = function (req, res) {
    var _id = req.param('_id')
    var sessionkey = req.param('sessionkey')

    //checking if user _id with sessionkey can be found
    UserModel.findOne({
        _id: _id,
        sessionkey: sessionkey
    }, function (err, user) {
        if (err) {
            res.send('-100')
            console.log(err)
            return
        } else if (user == null) {
            res.send('-4') //No User found
            return
        }
        res.send(user)
    })
}

var logout = function (req, res) {
    var _id = req.body._id

    UserModel.findOne({
        _id: _id
    }, function (err, user) {
        if (err) {
            console.log(err)
            res.send('-100') //Error with database Connection
            return
        } else if (user == null) {
            console.log('No User found')
            res.send('-3') //No User Found
            return
        } else {
            //deleting sessionkey in logout process
            user.sessionkey = null
            user.save(function (err) {
                if (err) {
                    res.send('-4')
                    console.log(err)
                    return
                }
                res.send('1')
            })
        }
    })
}

exports.loginWithMail = loginWithMail
exports.loginWithSessionKey = loginWithSessionKey
exports.logout = logout
exports.init = init