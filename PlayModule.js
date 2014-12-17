var mongoose = require('mongoose')
var db
var UserModel
var GameModel

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

        var gameSchema = mongoose.Schema({
            userSearching: String,
            userFound: String,
        })
        GameModel = mongoose.model('Game', gameSchema)
    })
}

var play = function (req, res) {
    var searchRequest = req.body
    res.type('text/plain')
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    UserModel.findOne(function (err, user) {
        if (err) {
            console.log(err)
            res.send('-100') //Database connection error
        } else if (user == null) {
            res.send('-5') //No User Found
        } else {
            var newGame = new GameModel({
                userSearching: searchRequest._id,
                userFound: user._id
            })
            newGame.save(function (err) {
                if (err) {
                    console.log(err)
                    res.send(-6)
                }
                console.log('New game saved')
                var toReturn = {
                    'username': user.username,
                    'longitude': 1231.112,
                    'latitude': 12311.22,
                    'task': 'Finde heruas:;Eat a Döner;Find out Name', //first for task, following for list-items
                    'taskType': 1, //0 for text, 1 for list
                    'image': {
                        'data': null,
                        'contentType': null
                    }
                }
                res.send(toReturn)
            })
        }
    })
}

var photoTest = function (req, res) {
    res.type('text/plain')
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'X-Requested-With')
    res.sendFile('/home/whou/Data/Weihnachtsbaum.jpg')
}

function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1 / 180
    var radlat2 = Math.PI * lat2 / 180
    var radlon1 = Math.PI * lon1 / 180
    var radlon2 = Math.PI * lon2 / 180
    var theta = lon1 - lon2
    var radtheta = Math.PI * theta / 180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180 / Math.PI
    dist = dist * 60 * 1.1515
    if (unit == "K") {
        dist = dist * 1.609344
    }
    if (unit == "N") {
        dist = dist * 0.8684
    }
    return dist
}


exports.play = play
exports.init = init
exports.photoTest = photoTest