var mongoose = require('mongoose')
var db
var UserModel

var init = function () {
    mongoose.connect('mongodb://localhost:27017/whoU')
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
    var credentials = {
        'mail': req.param('mail'),
        'password': req.param('password')
    }
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
            return res.send('-3') //No User Found
        } else {
            user.sessionkey = sessionkey
            user.save(function (err) {
                if (err) {
                    console.log(err)
                    res.send('-4')
                    return
                }
                res.send({
                    'UID': user._id,
                    'SessionKey': sessionkey.toString()
                })
            })
        }
    })
}

var loginWithSessionKey = function (req, res) {
    res.type('text/plain')
    var credentials = {
        '_id': req.param('_id'),
        'sessionkey': req.param('sessionkey')
    }
    console.log(credentials)
    UserModel.findOne({
        _id: credentials._id,
        sessionkey: credentials.sessionkey
    }, function (err, user) {
        if (err) {
            res.send(err)
            return console.err
        } else if (user == null) {
            res.send('-4') //No User found
            return
        }
        console.log('User: ' + user)
        res.send(user)
    })
}

var logout = function (req, res) {
    UserModel.findOne({
        _id: req.body._id
    }, function (err, user) {
        if (err) {
            console.err
            res.send('-100') //Error with database Connection
            return console.err
        } else if (user == null) {
            console.log('No User found')
            return res.send('-3') //No User Found
        } else {
            user.sessionkey = null
            user.save(function (err) {
                if (err) {
                    res.send('-4')
                    return console.log(err)
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