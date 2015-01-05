var mongoose = require('mongoose')
var db
var UserModel
var GameModel
var allDone = false

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
                ratedByUserSearched: 0,
                ratedByUserFound: 0,
                timeStamp: Date.now()
            })
            newGame.save(function (err) {
                if (err) {
                    console.log(err)
                    res.send('-110')
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
            return res.send('-4') //No User Found
        } else {
            if (user.coins != null)
                user.coins += coins
            else
                user.coins = coins
            user.save(function (err) {
                if (err) {
                    res.send('-110')
                    return console.log(err)
                }
                res.send('1')
            })
        }
    })
}

var getGamesToRate = function (req, res) {
    var gamesToRate = []
    allDone = false
    var counter = 0
    var _id = req.param('_id')
    console.log('ID:' + _id)
    GameModel.find({
        $or: [{
            userSearching: _id
        }, {
            userFound: _id
        }]
    }, function (err, games) {
        console.log('GAMES:' + games)
        console.log(games.length)
        if (err) {
            res.send('-100')
            return
        } else if (games.length == 0) {
            console.log(_id)
            res.send('-987654')
        } else {
            for (var i = 0; i < games.length; i++) {
                var userPlayedWith
                var timeStamp
                var gameId
                if (games[i].userFound == _id && games[i].ratedByUserFound == 0) {
                    timeStamp = games[i].timeStamp
                    gameId = games[i]._id
                    UserModel.findOne({
                        _id: games[i].userSearching
                    }, function (err, user) {
                        if (err) {
                            console.log(err)
                        }
                        gamesToRate.push({
                            userPlayedWith: user.username,
                            date: timeStamp,
                            gameId: gameId
                        })
                        counter++
                        if (counter == games.length)
                            allDone = true
                        sendGamesToRateResponse(res, gamesToRate)
                    })
                } else if (games[i].userSearching == _id && games[i].ratedByUserSearched == 0) {
                    timeStamp = games[i].timeStamp
                    gameId = games[i]._id
                    UserModel.findOne({
                        _id: games[i].userFound
                    }, function (err, user) {
                        if (err) {
                            console.log(err)
                        }
                        gamesToRate.push({
                            userPlayedWith: user.username,
                            date: timeStamp,
                            gameId: gameId
                        })
                        counter++
                        if (counter == games.length)
                            allDone = true
                        sendGamesToRateResponse(res, gamesToRate)
                    })
                }
            }
        }
    })
}

function sendGamesToRateResponse(res, gamesToRate) {
    if (allDone) {
        res.send(gamesToRate)
        allDone = false
    }
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