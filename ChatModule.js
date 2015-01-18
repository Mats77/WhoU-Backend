var mongoose = require('mongoose')
var gcm = require('node-gcm')

var GameModel
var UserModel
var ContactModel

//db initialization
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
        GameModel = require('mongoose').model('Game')
        ContactModel = require('mongoose').model('Contact')
    })
}

var getUsersCurrentlyPlayedWith = function (req, res) {
    var _id = req.param('_id')

    //fetching the contacts of the requesting user
    ContactModel.find({
        $or: [{
            firstUserId: _id
                }, {
            secondUserId: _id
                }]
    }, function (err, data) {
        if (err) {
            console.log(err)
            res.send('-100')
            return
        }
        var toReturn = []
        console.log(data)

        //if both users of the contact verified the contact, add it to return-array
        for (var i = 0; i < data.length; i++) {
            console.log('CONTACT: ' + data[i])
            var contact = data[i]
            if (contact.verifiedByFirstUser == 1 && contact.verifiedBySecondUser == 1) {
                if (contact.firstUserId == _id) {
                    toReturn.push(contact.secondUserId)
                } else {
                    toReturn.push(contact.firstUserId)
                }
            }
        }

        //return the array of users, the requesting user can chat with
        res.send(toReturn)
    })
}

var getPreviousMessages = function (req, res) {
    var _id = req.param('_id')
    var otherUserId = req.param('otherUser')

    //find the contact for the both user-ids
    ContactModel.findOne({
        $or: [{
                firstUserId: _id,
                secondUserId: otherUserId
        }, {
                firstUserId: otherUserId,
                secondUserId: _id
        }
        ]
    }, function (err, contact) {
        if (err) {
            console.log(err)
            res.send('-100')
            return
        } else if (contact == null) {
            res.send('-12')
            return
        } else {

            //return the messages array of the contact (containing JSON objects with the textMessage, a timeStamp, and an identifier to know which of the users in the contact was the author of the message)
            res.send(contact.messages)
        }
    })
}

var getMessagesLeft = function (req, res) {
    var _id = req.param('id')
    var otherUserId = req.param('otherUser')

    //fetching the contact
    ContactModel.findOne({
        $or: [{
                firstUserId: _id,
                secondUserId: otherUserId
        }, {
                firstUserId: otherUserId,
                secondUserId: _id
        }
        ]
    }, function (err, contact) {
        if (err) {
            console.log(err)
            res.send('-100')
            return
        } else if (contact == null) {
            res.send('-12')
            return
        } else {

            //sending back the messages the requesting user has left, by default 30
            if (_id = contact.firstUserId)
                res.send(contact.messagesLeftFirstUser)
            else
                res.send(contact.messagesLeftSecondUser)
        }
    })
}

var sendMessage = function (req, res) {
    var _id = req.body._id
    var otherUserId = req.body.otherUser
    var message = req.body.message
    var timeStamp = req.body.timeStamp

    //1 part

    //fetch contact from db
    ContactModel.findOne({
        $or: [{
            firstUserId: _id,
            secondUserId: otherUserId
        }, {
            firstUserId: otherUserId,
            secondUserId: _id
        }]
    }, function (err, contact) {
        if (err) {
            console.log(err)
            res.send('-100')
            return
        } else if (contact == null) {
            res.send('-12')
            return
        }

        //check if enough messages are left --> defensive programming
        if (contact.firstUserId == _id) {
            if (contact.messagesLeftFirstUser > 0) {

                //if yes reduce messageLeft count
                contact.messagesLeftFirstUser = contact.messagesLeftFirstUser - 1
            } else {
                res.send('-16')
                return
            }
        } else {
            if (contact.messagesLeftSecondUser > 0) {
                contact.messagesLeftSecondUser = contact.messagesLeftSecondUser - 1
            } else {
                res.send('-16')
                return
            }
        }

        //add JSON to messages array
        contact.messages.push({
            userSent: _id,
            message: message,
            timeStamp: timeStamp
        })

        //update contact document in db
        contact.save(function (err) {
            if (err) {
                console.log(err)
                res.send('-110')
                return
            }
            //2 part

            //fetching pushId and calling sendPush-method
            UserModel.findOne({
                _id: otherUserId
            }, function (err, user) {
                if (err) {
                    console.log(err)
                    return
                }
                sendPush(user.pushId, 'Neue Nachticht erhalten!', message, 1, res)
            })
        })
    })
}

var sendPush = function (userId, title, message, options, res) {

    //fetching user to get his pushId
    UserModel.findOne({
        _id: userId
    }, function (err, user) {
        if (err) {
            console.log(err)
            res.send('-100')
            return
        } else if (user == null) {
            res.send('-4')
            return
        }

        //creating message and sender object
        var push = new gcm.Message()
        var sender = new gcm.Sender('AIzaSyA7nZKnoB8Gn1p8gqkR5avZYSwhrmlFxDU')
        var registrationIds = [user.pushId]

        // Value the payload data to send...
        push.addData('message', message)
        push.addData('title', title)
        //message.addData('msgcnt', '3') // Shows up in the notification in the status bar
        push.addData('soundname', 'beep.wav') //Sound to play upon notification receipt - put in the www folder in app
        push.timeToLive = 3000;

        if (options == 1) {
            push.addData('userId', otherUserId)
        }

        sender.send(push, registrationIds, 4, function (result) {
            console.log(result);
            res.send('1')
        })
    })
}

//convenience pushes while user is searching
var pushSearchStarted = function (req, res) {
    var otherUserId = req.body._id
    sendPush(otherUserId, 'Someone is seaching for you!', 'Attention it gets ', 0, res)
}

var sendStandardMessage = function (req, res) {
    var otherUserId = req.body._id
    sendPush(otherUserId, "You can't be found!", 'Do something to help...', 0, res)
}

exports.getUsersCurrentlyPlayedWith = getUsersCurrentlyPlayedWith
exports.getPreviousMessages = getPreviousMessages
exports.getMessagesLeft = getMessagesLeft
exports.sendMessage = sendMessage
exports.pushSearchStarted = pushSearchStarted
exports.sendStandardMessage = sendStandardMessage
exports.init = init