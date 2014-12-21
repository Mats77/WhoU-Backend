var mongoose = require('mongoose')
var db
var UserModel
var GameModel

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

        var gameSchema = mongoose.Schema({
            userSearching: String,
            userFound: String,
            ratedByUserSearched: Number,
            ratedByUserFound: Number
        })
        GameModel = mongoose.model('Game', gameSchema)
    })
}

var play = function (req, res) {
    var searchRequest = req.body
    res.type('text/plain')
    UserModel.findOne({
        _id: {
            '$ne': searchRequest._id
        }
    }, function (err, user) {
        if (err) {
            console.log(err)
            res.send('-100') //Database connection error
        } else if (user == null) {
            res.send('-5') //No User Found
        } else {
            var newGame = new GameModel({
                userSearching: searchRequest._id,
                userFound: user._id,
                ratedByUserSearching: 0,
                ratedByUserFound: 0
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

var handleRating = function (req, res) {
    var _id = req.body._id
    var coins = req.body.coins
    console.log(req.body)

    UserModel.findOne({
        _id: _id
    }, function (err, user) {
        if (err) {
            console.err
            res.send('-100') //Error with database Connection
            return console.err
        } else if (user == null) {
            console.log('No User found')
            return res.send('-3') //No User Found
        } else {
            if (user.coins != null)
                user.coins += coins
            else
                user.coins = coins
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

var getGamesToRate = function (req, res) {
    res.send('-9999')
    //    var _id = req.param('userId')
    //    GameModel.find({
    //        $or: [{
    //            userSearching: _id
    //                }, {
    //            userFound: _id
    //            }]
    //    }).exec(function (err, data) {
    //        if (err) {
    //            res.send(err)
    //            return console.err
    //        }
    //        for (var i = 0; i < data.length; i++) {
    //            var userIdOfUserPlayedWith
    //            if (_id == data[i].userSearching) {
    //                userIdOfUserPlayedWith = data[i].userFound
    //            } else {
    //                userIdOfUserPlayedWith = data[i].userSearching
    //            }
    //            UserModel.findOne({
    //                _id: userIdOfUserPlayedWith
    //            }, function (err, data) {
    //                if (err) {
    //                    events.push(err)
    //                } else if (data == null) {
    //                    events.push('NO other user found')
    //                } else {
    //                    events.push({
    //                        'type': 'played',
    //                        'date': '01.01.2014',
    //                        'user': data.username
    //                    })
    //                }
    //            }).exec(function () {
    //                if (events.length == data.length)
    //                    res.send(events)
    //            })
    //        }
    //    })
}

var photoTest = function (req, res) {
    res.type('text/plain')
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
exports.handleRating = handleRating
exports.init = init
exports.photoTest = photoTest
exports.getGamesToRate = getGamesToRate