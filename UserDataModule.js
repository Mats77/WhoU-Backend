var mongoose = require('mongoose')
var db
var UserModel
var GameModel

//db initialization
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

    //searching the important data for requesting _id
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

        //adding all photoIds
        //and a special variable for the profilPhoto
        var photoIds = []
        var profilePhotoId = -1
        for (var i = 0; i < user.photos.length; i++) {
            photoIds.push(user.photos[i].id)
            if (user.photos[i].isProfilPhoto == 1) {
                profilePhotoId = user.photos[i].id
            }
        }

        //creating object to return and return it
        var userToReturn = {
            id: _id,
            userName: user.username,
            coins: user.coins,
            photoIds: photoIds,
            profilePhotoId: profilePhotoId,
            pushId: user.pushId
        }
        res.send(userToReturn)
    })
}


var getRecentEvents = function (req, res) {
    var _id = req.param('_id')
    var events = []
    
    var user_timeStamp = {}
    //searching all games in which he participated - whether as searching user or as found user
    GameModel.find({
        $or: [{
            userSearching: _id
                }, {
            userFound: _id
            }]
    }, function (err, data) {
        if (err) {
            res.send(err)
            console.log(err)
            return
        } else if (data.length == 0) {
            res.send('-17')
            return
        }

        //for each game get the id of the other user ...
        for (var i = 0; i < data.length; i++) {
            var userIdOfUserPlayedWith
            if (_id == data[i].userSearching) {
                userIdOfUserPlayedWith = data[i].userFound
            } else {
                userIdOfUserPlayedWith = data[i].userSearching
            }
            user_timeStamp[userIdOfUserPlayedWith] = data[i].timeStamp
            //...get its data from the db...
            UserModel.findOne({
                _id: userIdOfUserPlayedWith
            }, function (err, user) {
                if (err) {
                    events.push(err)
                } else if (user != null) {
                    var profilPhoto = -1
                    for(var j=0; j<user.photos.length; j++){
                        if(user.photos[j].isProfilPhoto == 1){
                            profilPhoto = user.photos[j].photoString
                        }
                    }
                    //...and add the necessary data to the events array
                    events.push({
                        'type': 'played',
                        'date': user_timeStamp[user._id],
                        'user': user.username,
                        'userId': user._id,
                        'profilPhoto': profilPhoto
                    })
                } else {
                    //maybe the other player has been deleted since they played
                    events.push({
                        'type': 'played',
                        'user': 'user deleted'
                    })
                }

                //as soon as every game with its necessary data has been added to the events array, return the array to the client
                if (events.length == data.length)
                    res.send(events)
            })
        }
    })
}

var changeModus = function (req, res) {
    var _id = req.body._id
    var newModus = req.body.newModus

    //single db update-document-query
    UserModel.update({
        _id: _id
    }, {
        $set: {
            visible: newModus
        }
    }, function (err) {
        if (err) {
            console.log(err)
            res.send('-110')
        } else {
            res.send('1')
        }
    })
}

var updateGPS = function (req, res) {
    var _id = req.body._id
    var longitude = req.body.longitude
    var latitude = req.body.latitude

    //single db update-document-query
    UserModel.update({
        _id: _id
    }, {
        $set: {
            longitude: longitude,
            latitude: latitude
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

var savePhoto = function (req, res) {
    var _id = req.body._id

    UserModel.findOne({
            _id: _id
        },
        function (err, user) {
            if (err != null) {
                res.send('-100')
                return
            } else if (user == null) {
                res.send('-4')
                return
            } else {

                //if it is the first photo set its profilPhoto flag
                var isProfilPhoto = user.photos.length == 0 ? 1 : 0

                //setting the photo's id --> the last photo's id + 1 or 0
                var photoId = user.photos.length == 0 ? 0 : ((user.photos[user.photos.length - 1].id) + 1)

                //adding the photo to the user's photo array
                user.photos.push({
                    id: photoId,
                    photoString: req.body.photoString,
                    isProfilPhoto: isProfilPhoto
                })

                //updating db-document
                user.save(function (err) {
                    if (err) {
                        res.send('-110')
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
    var _id = req.body._id
    var photoId = req.body.PID

    UserModel.findOne({
        _id: _id
    }, function (err, user) {
        if (err) {
            res.send('-100')
            return
        } else if (user == null) {
            res.send('-4')
            return
        } else {
            //searching for the photo, that shall be deleted
            for (var i = user.photos.length - 1; i >= 0; i--) {
                if (user.photos[i].id == photoId) {
                    user.photos.splice(i, 1)
                    break
                }
            }
            //saving the updated user
            user.save(function (err) {
                if (err) {
                    res.send('-110')
                    return
                }
                res.send('1')
            })
        }
    })
}

var getPhoto = function (req, res) {
    var _id = req.param('_id')
    var photoId = req.param('photoId')

    //fetching user from db
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

            //searching through the user's photos.
            //returning his id (necessary due to concurrency), and the photo-data
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
    var _id = req.body._id
    var photoId = req.body.photoId
    console.log('PROFIL PHOTO: _id ' + _id + ', photoId ' +photoId)

    UserModel.findOne({
        _id: _id
    }, function (err, user) {
        if (err) {
            console.log(err)
            res.send('-100')
            return
        } else if (user == 0) {
            res.send('-4')
            return
        } else {

            //searching through the fotos
            //setting the profilePhoto flag for the requested photo
            for (var i = 0; i < user.photos.length; i++) {
                console.log('Actual ID: ' + user.photos[i].id)
                console.log(user.photos[i].id == photoId)
                if (user.photos[i].id == photoId)
                    user.photos[i].isProfilPhoto = 1
                else
                    user.photos[i].isProfilPhoto = 0
                    
                console.log(user.photos[i].id + ' ' +user.photos[i].isProfilPhoto)
            }
            user.markModified('photos')
            //saving the updated user
            user.save(function (err) {
                if (err) {
                    console.log(err)
                    res.send('-110')
                    return
                }
                res.send('1')
            })
        }
    })
}

var insertPushId = function (req, res) {
    var _id = req.body._id
    var pushId = req.body.pushId

    //updating the user's document in the db with the inserted pushId
    UserModel.update({
        _id: _id
    }, {
        $set: {
            pushId: pushId
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
exports.insertPushId = insertPushId