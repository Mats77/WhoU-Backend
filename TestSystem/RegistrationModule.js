var mongoose = require('mongoose')
var fs = require('fs')
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
        var userSchema = mongoose.Schema({
            username: String,
            password: String,
            mail: String,
            sessionkey: String,
            longitude: Number,
            latitude: Number,
            modus: Number,
            coins: Number,
            visisble: Number,
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
        var user = new UserModel({
            username: req.body.username,
            password: req.body.password,
            mail: req.body.mail,
            longitude: req.body.longitude,
            latitude: req.body.latitude,
            coins: 0,
            visible: 1 //,
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

var deleteUser = function (req, res) {
    UserModel.remove({
        _id: req.body._id
    }, function (err) {
        if (err) {
            console.log(err)
            res.send('-9')
            return
        }
        res.send('1')
    })
}

exports.register = register
exports.init = init
exports.deleteUser = deleteUser