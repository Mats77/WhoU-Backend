var mongoose = require('mongoose')
var db
var UserModel

var init = function () {
    mongoose.connect('mongodb://localhost/whoU')
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
        })
        UserModel = mongoose.model('User', userSchema)
    })
    return UserModel
}

exports.init = init