var mongoose = require('mongoose')
var db
var UserModel
var GameModel
var ContactModel

//db initialization, and setting up Game and Contact-Schema
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
            ratedByUserFound: Number,
            timeStamp: Number
        })
        GameModel = mongoose.model('Game', gameSchema)

        var contactSchema = mongoose.Schema({
            firstUserId: String,
            secondUserId: String,
            verifiedByFirstUser: Number,
            verifiedBySecondUser: Number,
            messagesLeftFirstUser: Number,
            messagesLeftSecondUser: Number,
            messages: Array
        })
        ContactModel = mongoose.model('Contact', contactSchema)
    })
}

//the 
var play = function (req, res) {
    var _id = req.body._id
    var result = matchMe(_id, function (result) {
        console.log('RESULT 1: ' + result.otherUserId)

        //check if matchingAlgorithm returned a user
        if (typeof result === 'object') {

            //creating and saving game object
            var newGame = new GameModel({
                userSearching: _id,
                userFound: result.otherUserId,
                ratedByUserSearched: 0,
                ratedByUserFound: 0,
                timeStamp: Date.now()
            })

            newGame.save(function (err) {
                if (err) {
                    console.log(err)
                    res.send('-110e')
                    return
                }
                console.log('New game saved')
                result.gameId = newGame._id
                console.log('RESULT SENT: ' + result)

                //return game object to client
                res.send(result)
            })

            //if matching algorithm returned a error code, pass is to client
        } else {
            res.send(result)
        }
    })
}

//The algorithm to match players
function matchMe(_id, callback) {
    //adding the user himself to ineligible users
    var ineligibleUsers = []
    ineligibleUsers.push(_id)
    UserModel.findOne({
        _id: _id
    }, function (err, user) {
        if (err) {
            console.log(err)
            callback('-100')
        } else if (user == null) {
            callback('-4')
        }

        //adding users recently played with to ineligible users
        GameModel.find({
            $or: [{
                userSearching: _id
        }, {
                userFound: _id
        }]
        }, function (err, games) {
            if (err) {
                console.log(err)
                callback('-100')
            }
            console.log('NEW PLAY ALGORITHM: Time Difference: ' + games)
            for (var i = 0; i < games.length; i++) {
                console.log('NEW PLAY ALGORITHM: Time Difference: ' + games[i].timeStamp - Date.now())
                if (games[i].timeStamp - Date.now() < (1000 * 60 * 60 * 24)) {
                    if (games[i].userSearching == _id)
                        ineligibleUsers.push(games[i].userFound)
                    else
                        ineligibleUsers.push(games[i].userSearching)
                }
            }
            console.log('NEW PLAY ALGORITHM: ineligibleUsers: ' + ineligibleUsers)

            //fetch users, which are not ineligible
            UserModel.find({
                _id: {
                    $nin: ineligibleUsers
                }
            }, function (err, users) {
                console.log('NEW PLAY ALGORITHM: Users: ' + users)
                if (err) {
                    console.log(err)
                    callback('-100d')
                }

                //add visible and nearby users to eligibleUsers
                var eligibleUsers = []
                for (var i = 0; i < users.length; i++) {
                    if (getDistance(user.latitude, user.longitude, users[i].latitude, users[i].longitude, 'K') < 500) {
                        if (users[i].visible == 1)
                            eligibleUsers.push(users[i])
                    }
                }
                console.log('NEW PLAY ALGORITHM: ElibibleUsers: ' + eligibleUsers)

                //if there are one or more eligible Users return a random one
                if (eligibleUsers.length > 0) {
                    var otherPlayer = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)]

                    console.log('NEW PLAY ALGORITHM: otherPlayer: ' + otherPlayer)

                    var toReturn = {
                        'username': otherPlayer.username,
                        'otherUserId': otherPlayer._id,
                        'longitude': otherPlayer.longitude,
                        'latitude': otherPlayer.latitude,
                        'task': 'Finde heraus:;Eat a Döner;Find out Name', //first for task, following for list-items
                        'taskType': 1, //0 for text, 1 for list
                        'image': {
                            'data': null,
                            'contentType': null
                        }
                    }
                    console.log('NEW PLAY ALGORITHM returning: ' + toReturn)
                    console.log('NEW PLAY ALGORITHM returning: ' + toReturn.username)
                    callback(toReturn)

                    //signal, that no users can be matched
                } else {
                    callback('-1')
                }
            })

        })

    })
}


var handleRating = function (req, res) {
    //reading out the arguments
    var _id = req.body._id
    var coins = req.body.coins
    var gameId = req.body.gameId
    var stayInContact = req.body.stayInContact

    //fetching the user to be rated from the db
    UserModel.findOne({
        _id: _id
    }, function (err, user) {
        if (err) {
            console.err
            res.send('-100') //Error with database Connection
            return
        } else if (user == null) {
            console.log('No User found')
            res.send('-4')
            return //No User Found
        } else {

            //adding the coins; amount depending on coinfactor flag
            if (user.coins != null)
                user.coins += (coins * user.coinFactor)
            else
                user.coins = (coins * user.coinFactor)

            //if coinfactor is bigger than one (--> benefit is used), reduce the amount
            if (user.coinFactor != 1) {
                for (var i = user.benefits.length - 1; 0 <= i; i--) {
                    if (user.benefits[i].id == 4) {
                        user.benefits[i].counter = user.benefits[i].counter - 1
                        if (user.benefits[i].counter == 0)
                            user.benefits[i].splice(i, 1)
                    }
                }
            }

            //saving user with new coin amount
            user.save(function (err) {
                if (err) {
                    res.send('-110')
                    console.log(err)
                    return
                }

                //set the flag in the game for the rating user 1, so that he hasn't have to rate the same game again
                GameModel.findOne({
                    _id: gameId
                }, function (err, game) {
                    if (err) {
                        console.log(err)
                        res.send('-110')
                        return
                    }
                    if (game == null) {
                        console.log('INSERT RATING: No game found')
                        res.send('-10')
                        return
                    }
                    if (game.userFound == _id) {
                        game.ratedByUserSearched = 1
                    } else {
                        game.ratedByUserFound = 1
                    }

                    //saving
                    game.save(function (err) {
                        if (err) {
                            console.log(err)
                            res.send('-110')
                            return
                        }
                        console.log('HandleRating: Update UserSearched done')

                        //let the contact stuff be handled by the follwing method
                        handleContactRequest(game.userFound, game.userSearching, stayInContact, res)
                    })
                })
            })
        }
    })
}


function handleContactRequest(userId, otherUserId, wishesToStayInContact, res) {
    //check if a contact for those two users already exists
    ContactModel.findOne({
        $or: [
            {
                firstUserId: userId,
                secondUserId: otherUserId
            }, {
                firstUserId: otherUserId,
                secondUserId: userId
            }
        ]
    }, function (err, contact) {
        if (err) {
            console.log(err)
            res.send('-100')
            return

            //if no contact exists for the two users create a new one
        } else if (contact == null) {
            var newContact = new ContactModel({
                firstUserId: userId,
                secondUserId: otherUserId,
                verifiedByFirstUser: wishesToStayInContact,
                verifiedBySecondUser: 0,
                messagesLeftFirstUser: 30,
                messagesLeftSecondUser: 30,
                messages: []
            }).save(function (err) {
                if (err) {
                    console.log(err)
                    res.send('-110')
                    return
                }
                res.send('1')
                return
            })
        } else {
            //if the contact exists, check whether both want to stay in contact or not

            //in case both want to stay in contact update the data and chatting can start
            if ((contact.verifiedByFirstUser == 1 || contact.verifiedBySecondUser == 1) && wishesToStayInContact) {
                ContactModel.update({
                    _id: contact._id
                }, {
                    $set: {
                        verifiedByFirstUser: 1,
                        verifiedBySecondUser: 1
                    }
                }, function (err) {
                    if (err) {
                        console.log(err)
                        res.sen('-110')
                        return
                    }
                    res.send('1')
                })
            } else {

                //if at least one doesn't want to stay in contact, delete the contact
                ContactModel.remove({
                    _id: contact._id
                }, function (err) {
                    if (err) {
                        console.log(err)
                        res.send('-120')
                        return
                    }
                    res.send('1')
                })
            }
        }
    })
}


var getGamesToRate = function (req, res) {
    var gamesToRate = []
    var _id = req.param('_id')

    //find games in which the user particitaped as user searching or userFound.
    GameModel.find({
        $or: [{
            userSearching: _id
        }, {
            userFound: _id
        }]
    }, function (err, games) {
        if (err) {
            res.send('-100')
            return
        } else if (games.length == 0) {
            console.log(_id)
            res.send('-10')
            return
        } else {

            //if user hasn't rated a game in which he participated, add it to gamesToRateArray
            //additionally add the other userId, so that client knows who should be rated
            for (var i = 0; i < games.length; i++) {
                if (games[i].userFound == _id && games[i].ratedByUserFound == 0) {
                    gamesToRate.push({
                        gameId: games[i]._id,
                        otherPlayerId: games[i].userSearching
                    })

                } else if (games[i].userSearching == _id && games[i].ratedByUserSearched == 0) {
                    gamesToRate.push({
                        gameId: games[i]._id,
                        otherPlayerId: games[i].userFound
                    })
                }
            }
            if (gamesToRate.length == 0) {
                res.send('-10')
                return
            }

            //return array with games and otherUsers
            res.send(gamesToRate)
        }
    })
}

//test method
var photoTest = function (req, res) {
    res.type('text/plain')
    res.sendFile('/home/whou/Data/Weihnachtsbaum.jpg')
}

//calculating distance between users denpending on longitude and latitude
function getDistance(lat1, lon1, lat2, lon2, unit) {
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
exports.matchMe = matchMe