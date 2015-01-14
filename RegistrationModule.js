var mongoose = require('mongoose')
var fs = require('fs')
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
        var userSchema = mongoose.Schema({
            pushId: String,
            username: String,
            password: String,
            mail: String,
            sessionkey: String,
            longitude: Number,
            latitude: Number,
            modus: Number,
            coins: Number,
            visible: Number,
            coinFactor: Number,
            photos: Array,
            benefits: Array,
            usersToTalkWith: Array
        })
        UserModel = mongoose.model('User', userSchema)
    })
}

var register = function (req, res) {
    res.type('text/plain')
    if (req.body['username'] != null && req.body['password'] != null && req.body['mail'] != null) {
        UserModel.findOne({
            'mail': req.body.mail
        }, function (err, user) {
            if (err) {
                res.send('-100')
                return
            } else if (user == null) {
                var user = new UserModel({
                    pushId: '', //pushId for GCM or APN
                    username: req.body.username,
                    password: req.body.password,
                    mail: req.body.mail,
                    longitude: req.body.longitude,
                    latitude: req.body.latitude,
                    coinFactor: 1, //can be upgraded by a benefit. Has influence on how many coins the user get for playing
                    coins: 0, //necessary to buy benefits
                    visible: 1, //flag if someone is eligible for being found by play-algorithm
                    photos: [],
                    benefits: [], //stores the benefits, bought by the user
                    usersToTalkWith: [] //if both users agreed to a chat after playing, a contact is stored here
                })
                user.save(function (err) {
                    if (!err) {
                        console.log('User erstellt mit der id: ' + user.id)
                        res.send("" + user.id) //Everything worked, send Back UserId
                    } else {
                        console.log(err)
                        res.send('-110') //DB-Connection Error
                        return
                    }
                })
            } else {
                res.send('-2')
                return
            }
        })
    }
}

var deleteUser = function (req, res) {
    UserModel.remove({
        _id: req.body._id
    }, function (err) {
        if (err) {
            console.log(err)
            res.send('-120')
            return
        }
        res.send('1')
    })
}

exports.register = register
exports.init = init
exports.deleteUser = deleteUser