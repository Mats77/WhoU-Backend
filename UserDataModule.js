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
            console.err
            return
        } else if (user == null) {
            res.send('-4') //No User found
            return
        }
        var photoIds = []
        var profilePhotoId = -1
        for (var i = 0; i < user.photos.length; i++) {
            photoIds.push(user.photos[i].id)
            if (user.photos[i].isProfilPhoto == 1) {
                profilePhotoId = user.photos[i].id
            }
        }
        var userToReturn = {
            id: _id,
            userName: user.username,
            coins: user.coins,
            photoIds: photoIds,
            profilePhotoId: profilePhotoId
        }
        res.send(userToReturn)
    })
}


var getRecentEvents = function (req, res) {
    var _id = req.param('_id')
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
                } else if (user != null) {
                    events.push({
                        'type': 'played',
                        'date': data.timeStamp,
                        'user': user.username
                    })
                } else {
                    events.push({
                        'type': 'played',
                        'date': data.timeStamp,
                        'user': 'user deleted'
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
    var newModus = req.body.newModus

    UserModel.update({
        _id: _id
    }, {
        $set: {
            visible: newModus
        }
    }, function (err) {
        if (err) {
            console.log(err)
            res.send('-1234')
        } else {
            res.send('1')
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
                var isProfilPhoto = user.photos.length == 0 ? 1 : 0
                user.photos.push({
                    id: user.photos.length,
                    photoString: req.body.photoString,
                    isProfilPhoto: isProfilPhoto
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
            var somethingSent = false
            for (var i = 0; i < user.photos.length; i++) {
                if (user.photos[i].id == photoId) {
                    res.send({
                        'userId': _id,
                        'id': user.photos[i].id,
                        'data': user.photos[i].photoString
                    })
                    somethingSent = true
                    break
                }
            }
            if (!somethingSent)
                res.send('-8')
        }
    })
}

var updateProfilPhoto = function (req, res) {
    UserModel.findOne({
        _id: req.body._id
    }, function (err, user) {
        if (err) {
            console.log(err)
            res.send('-100')
            return
        } else if (user == 0) {
            res.send('-4')
            return
        } else {
            for (var photo in user.photos) {
                if (photo.id == req.body.photoId) {
                    photo.isProfilPhoto = 1
                } else {
                    photo.isProfilPhoto = 0
                }
            }
            UserModel.update({
                _id: req.body._id
            }, {
                $set: {
                    photos: user.photos
                }
            }, function (err) {
                if (err) {
                    res.send('-110')
                } else {
                    res.send('1')
                }
            })
        }
    })
}

var insertPush = function (req, res) {
    UserModel.update({
        _id: req.body._id
    }, {
        $set: {
            pushId: req.body.pushId
        }
    }, function (err) {
        if (err) {
            console.log(err)
            res.send('-110')
            return
        }
        res.send('1')
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
exports.updateProfilPhoto = updateProfilPhoto
exports.insertPush = insertPush