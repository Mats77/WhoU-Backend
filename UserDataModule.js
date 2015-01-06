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
        UserModel = require('mongoose').model('User')
        GameModel = require('mongoose').model('Game')
    })
}

var getUserData = function (req, res) {
    var _id = req.param('_id')
    console.log('GetUserData: ' + _id)
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
    var _id = req.param('_id')
    console.log('recent events id: ' + _id)
    var events = []
    GameModel.find({
        $or: [{
            userSearching: _id
                }, {
            userFound: _id
            }]
    }).exec(function (err, data) {
        console.log('1')
        if (err) {
            res.send(err)
            console.log(err)
            return
        } else if (data.length == 0) {
            res.send('-1235478')
            return
        }
        console.log('recent events data ' + data)
        for (var i = 0; i < data.length; i++) {
            var userIdOfUserPlayedWith
            if (_id == data[i].userSearching) {
                userIdOfUserPlayedWith = data[i].userFound
            } else {
                userIdOfUserPlayedWith = data[i].userSearching
            }
            UserModel.findOne({
                _id: userIdOfUserPlayedWith
            }, function (err, user) {
                if (err) {
                    events.push(err)
                } else if (user == null) {
                    events.push('NO other user found')
                } else {
                    events.push({
                        'type': 'played',
                        'date': '01.01.2014',
                        'user': user.username
                    })
                }
                console.log('data length: ' + data.length + ' events length: ' + events.length)
                if (events.length == data.length)
                    res.send(events)
            })
        }
    })
}

var changeModus = function (req, res) {
    var _id = req.body._id
    var newModus = req.body.nowModus

    UserModel.findOne({
        _id: _id
    }, function (err, user) {
        if (err) {
            console.err
            res.send('-100') //Error with database Connection
            console.err
            return
        } else if (user == null) {
            console.log('No User found')
            res.send('-4')
            return //No User Found
        } else {
            user.modus = newModus
            user.save(function (err) {
                if (err) {
                    res.send('-110')
                    console.log(err)
                    return
                }
                res.send('1')
            })
        }
    })
}

var updateGPS = function (req, res) {
    var _id = req.body._id
    var longitude = req.body.longitude
    var latitude = req.body.latitude

    UserModel.findOne({
        _id: _id
    }, function (err, user) {
        if (err) {
            console.err
            res.send('-100') //Error with database Connection
            console.err
            return
        } else if (user == null) {
            console.log('No User found')
            res.send('-4') //No User Found
            return
        } else {
            user.longitude = longitude
            user.latitude = latitude
            user.save(function (err) {
                if (err) {
                    res.send('-110')
                    console.log(err)
                    return
                }
                res.send('1')
            })
        }
    })
}

var savePhoto = function (req, res) {
    console.log('ID 1:' + req.body._id)
    console.log('ID2: ' + req.param('_id'))
    console.log(req.body._id)
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

var getPhoto = function (req, res) {
    var _id = req.param('_id')
    var photoId = req.param('photoId')
    UserModel.findOne({
        _id: _id
    }, function (err, user) {
        if (err) {
            console.log(err)
            res.send('-100')
            return
        } else if (user == null) {
            res.send('-4')
            return
        } else {
            if (user.photos.length > photoId) {
                res.send(user.photos[photoId])
            } else {
                res.send('-8')
            }
        }
    })
}

exports.init = init
exports.getUserData = getUserData
exports.getRecentEvents = getRecentEvents
exports.getPhoto = getPhoto
exports.changeModus = changeModus
exports.updateGPS = updateGPS
exports.savePhoto = savePhoto
exports.deletePhoto = deletePhoto