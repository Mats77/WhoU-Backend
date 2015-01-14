var mongoose = require('mongoose')
    //var gcm = require('node-gcm')

var GameModel
var UserModel
var ContactModel

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
    var userId = req.params['_id']
    ContactModel.find({
        $or: [{
            firstUser: userId
                }, {
            secondUserId: userId
                }]
    }, function (err, data) {
        if (err) {
            console.log(err)
            res.send('-100')
            return
        }
        var toReturn = []
        console.log(data)
        for (var i = 0; i < data.length; i++) {
            console.log('CONTACT: ' + data[i])
            var contact = data[i]
            if (contact.verifiedByFirstUser == 1 && contact.verifiedBySecondUser == 1) {
                if (contact.firstUserId == userId) {
                    toReturn.push(contact.firstUserId)
                } else {
                    toReturn.push(contact.secondUserId)
                }
            }
        }
        console.log(toReturn)
        res.send(toReturn)
    })
}

var getPreviousMessages = function (req, res) {
    var _id = req.params['id']
    var otherUserId = req.params['otherUser']
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
            res.send(contact.messages)
        }
    })
}

var getMessagesLeft = function (req, res) {
    var _id = req.params['id']
    var otherUserId = req.params['otherUser']
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
        contact.messages.push({
            userSent: _id,
            message: message
        })

        contact.save(function (err) {
            if (err) {
                console.log(err)
                res.send('-110')
                return
            }
            res.send('1')
        })
    })
}


var pushSearchStarted = function (req, res) {
    var otherUserId = req.body._id
    UserModel.findOne({
        _id: otherUserId
    }, function (err, user) {
        if (err) {
            console.log(err)
            res.send('-100')
            return
        } else if (user == null) {
            res.send('-4')
            return
        }
        //var message = gcm.Message()
        //
        //var sender = new gcm.Sender('AIzaSyCDx8v9R0fMsAsjoAffF-P3FCFWXlvwLhg');
        //var registrationIds = [user.pushId];
        //
        //// Value the payload data to send...
        //message.addData('message', "\u270C Peace, Love \u2764 and PhoneGap \u2706!");
        //message.addData('title', 'Push Notification Sample');
        //message.addData('msgcnt', '3'); // Shows up in the notification in the status bar
        //message.addData('soundname', 'beep.wav'); //Sound to play upon notification receipt - put in the www folder in app
        ////message.collapseKey = 'demo';
        ////message.delayWhileIdle = true; //Default is false
        //message.timeToLive = 3000;
        //
        //sender.send(message, registrationIds, 4, function (result) {
        //    console.log(result);
        //    res.send('1')
        //});
    })
}

var sendStandardMessage = function (req, res) {
    var otherUserId = req.body._id
    UserModel.findOne({
        _id: otherUserId
    }, function (err, user) {
        if (err) {
            console.log(err)
            res.send('-100')
            return
        } else if (user == null) {
            res.send('-4')
            return
        }
        //var message = gcm.Message()
        //
        //var sender = new gcm.Sender('AIzaSyCDx8v9R0fMsAsjoAffF-P3FCFWXlvwLhg');
        //var registrationIds = [user.pushId];
        //
        //// Value the payload data to send...
        //message.addData('message', "\u270C Peace, Love \u2764 and PhoneGap \u2706!");
        //message.addData('title', 'Push Notification Sample');
        //message.addData('msgcnt', '3'); // Shows up in the notification in the status bar
        //message.addData('soundname', 'beep.wav'); //Sound to play upon notification receipt - put in the www folder in app
        ////message.collapseKey = 'demo';
        ////message.delayWhileIdle = true; //Default is false
        //message.timeToLive = 3000;
        //
        //sender.send(message, registrationIds, 4, function (result) {
        //    console.log(result);
        //    res.send('1')
        //});
    })
}

var openSSEConnection = function (req, res) {
    res.send('-9999')
}

exports.getUsersCurrentlyPlayedWith = getUsersCurrentlyPlayedWith
exports.getPreviousMessages = getPreviousMessages
exports.getMessagesLeft = getMessagesLeft
exports.sendMessage = sendMessage
exports.pushSearchStarted = pushSearchStarted
exports.sendStandardMessage = sendStandardMessage
exports.init = init
exports.openSSEConnection = openSSEConnection