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
        UserModel = require('mongoose').model('User')
        GameModel = require('mongoose').model('Game')
    })
}

var getUserData = function (req, res) {
    var _id = req.param('UID')
    UserModel.findOne({
        _id: _id
    }, function (err, user) {
        if (err) {
            res.send(err)
            return console.err
        } else if (user == null) {
            res.send('-4') //No User found
            return
        }
        console.log('User: ' + user)
        var userToReturn = {
            userName: user.username,
            coins: user.coins,
            fotoId: 0
        }
        res.send(userToReturn)
    })
}


var getRecentEvents = function (req, res) {
    var _id = req.param('UID')
    var events = []
    GameModel.find({
        $or: [{
            userSearching: _id
                }, {
            userFound: _id
            }]
    }).exec(function (err, data) {
        if (err) {
            res.send(err)
            return console.err
        }
        for (var i = 0; i < data.length; i++) {
            var userIdOfUserPlayedWith
            if (_id == data[i].userSearching) {
                userIdOfUserPlayedWith = data[i].userFound
            } else {
                userIdOfUserPlayedWith = data[i].userSearching
            }
            UserModel.findOne({
                _id: userIdOfUserPlayedWith
            }, function (err, data) {
                if (err) {
                    events.push(err)
                } else if (data == null) {
                    events.push('NO other user found')
                } else {
                    events.push({
                        'type': 'played',
                        'date': '01.01.2014',
                        'user': data.username
                    })
                }
            }).exec(function () {
                if (events.length == data.length)
                    res.send(events)
            })
        }
    })
}

var changeModus = function (req, res) {
    var _id = req.body.UID
    var newModus = req.body.nowModus

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
            user.modus = newModus
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

var updateGPS = function (req, res) {
    var _id = req.body.UID
    var longitude = req.body.longitude
    var latitude = req.body.latitude

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
            user.longitude = longitude
            user.latitude = latitude
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

var savePhoto = function (req, res) {
    UserModel.findOne({
            _id: req.body._id
        },
        function (err, user) {
            if (err != null) {
                res.send('-100')
                return
            } else if (user == null) {
                res.send('-4')
                return
            } else {
                user.photos.push({
                    id: user.photos.length,
                    photoString: req.body.photoString
                })
                UserModel.update({
                    _id: user.id
                }, {
                    $set: {
                        photos: user.photos
                    }
                }, function (err) {
                    if (err) {
                        res.send(err)
                        return
                    } else {
                        res.send('1')
                        return
                    }
                })
            }
        })
}

var deletePhoto = function (req, res) {
    UserModel.findOne({
        _id: req.body._id
    }, function (err, user) {
        if (err) {
            res.send('-100')
            return
        } else if (user == null) {
            res.send('-4')
            return
        } else {
            for (var i = user.photos.length - 1; i >= 0; i--) {
                if (photo.id == req.body.photoId) {
                    user.photos.splice(i, 1)
                    break
                }
            }
            UserModel.update({
                _id: user.id
            }, {
                $set: {
                    photos: user.photos
                }
            }, function (err) {
                if (err) {
                    res.send(err)
                    return
                } else {
                    res.send('1')
                    return
                }
            })
        }
    })
}

exports.init = init
exports.getUserData = getUserData
exports.getRecentEvents = getRecentEvents
exports.changeModus = changeModus
exports.updateGPS = updateGPS
exports.savePhoto = savePhoto
exports.deletePhoto = deletePhoto