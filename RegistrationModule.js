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
            username: String,
            password: String,
            mail: String,
            sessionkey: String,
            longitude: Number,
            latitude: Number,
            modus: Number,
            picture: {
                data: Buffer,
                contentType: String
            }
        })
        UserModel = mongoose.model('User', userSchema)
    })
}

var register = function (req, res) {
    res.type('text/plain')
    if (req.body['username'] != null && req.body['password'] != null && req.body['mail'] != null) {
        console.log('in der if')
        var user = new UserModel({
            username: req.body.username,
            password: req.body.password,
            mail: req.body.mail //,
            //            picture: {
            //                data: fs.readFileSync('/home/whou/Data/Weihnachtsbaum.jpg'),
            //                contentType: 'image'
            //            }
        })
        user.save(function (err) {
            if (!err) {
                console.log('User erstellt mit der id: ' + user.id)
                res.send("" + user.id) //Everything worked, send Back UserId
            } else {
                console.log(err)
                res.send('-100') //DB-Connection Error
                return
            }
        })
        console.log('Fertig')
    }
}

exports.register = register
exports.init = init