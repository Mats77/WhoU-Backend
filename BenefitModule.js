var mongoose = require('mongoose')
var db
var BenefitModel
var UserModel
var ContactModel
var GameModel
const playModule = require('./PlayModule')

var init = function () {
    mongoose.connect('mongodb://Mats:MobileProject.123@localhost:20766/whoU')
    db = mongoose.connection
    db.on('error', function (err) {
        console.log(err)
        return
    })
    db.once('open', function () {
        benefitSchema = mongoose.Schema({
            id: Number,
            name: String,
            description: String,
            price: Number
        })
        UserModel = require('mongoose').model('User')
        BenefitModel = mongoose.model('Benefit', benefitSchema)
        ContactModel = require('mongoose').model('Contact')
        GameModel = require('mongoose').model('Game')
    })
}

var getAllItems = function (req, res) {
    var items = BenefitModel.find({}, function (err, data) {
        if (err) {
            res.send('-100')
            return
        }
        res.send(data)
    })
}

var buyItem = function (req, res) {
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
            BenefitModel.findOne({
                id: req.body.BID
            }, function (err, item) {
                if (err) {
                    res.send('-100')
                    return
                } else if (item == null) {
                    res.send('-7')
                    return
                } else {
                    if (user.coins >= (item.price * req.body.count)) {
                        user.coins = (user.coins - (Number(item.price) * Number(req.body.count)))
                        if (item.id == 4) {
                            if (user.coinFactor == 1) {
                                user.benefits.push({
                                    BID: 4,
                                    count: 10
                                })
                            } else {
                                for (var benefit in user.benefits) {
                                    if (benefit.id == 4)
                                        benefit.count = benefit.count + 10
                                }
                            }
                        } else {
                            if (user.benefits.length == 0) {
                                user.benefits = [
                                    {
                                        BID: item.id,
                                        count: req.body.count
                                    }
                                ]
                            } else {
                                var itemAlreadyExistsAtLeastOnce = false
                                for (var i = 0; i < user.benefits.length; i++) {
                                    if (user.benefits[i].BID == item.id) {
                                        user.benefits[i].count = user.benefits[i].count + req.body.count
                                        itemAlreadyExistsAtLeastOnce = true
                                    }
                                }
                                if (!itemAlreadyExistsAtLeastOnce) {
                                    user.benefits.push({
                                        BID: item.id,
                                        count: req.body.count
                                    })
                                }
                            }
                        }
                        UserModel.update({
                            _id: user.id
                        }, {
                            $set: {
                                benefits: user.benefits,
                                coins: user.coins
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
                    } else {
                        res.send('-9')
                    }
                    return
                }
            })
            return
        }
    })
}

var upgradeMessageCount = function (req, res) {
    var _id = req.body._id
    var otherUserId = req.body.otherUser
    ContactModel.update({
            $or: [{
                firstUserId: _id,
                secondUserId: otherUserId
        }, {
                firstUserId: otherUserId,
                secondUserId: _id
        }]
        }, {
            $inc: {
                messagesLeftFirstUser: 30,
                messagesLeftSecondUser: 30
            }
        },
        function (err) {
            if (err) {
                console.log(err)
                res.send('-100')
                return
            }
            res.send('1')
        })
}

var skipUser = function (req, res) {
    var _id = req.body._id
    var gameId = req.body.gameId

    var result = playModule.matchMe(_id, function (result) {
            if (typeof result === 'object') {
                GameModel.findOne({
                    _id: gameId
                }, function (err, game) {
                    if (err) {
                        res.send('-100')
                        console.log(err)
                        return
                    } else if (game == null) {
                        res.send('-13')
                        return
                    } else {
                        game.userFound = result.otherUserId
                        game.save(function (err) {
                            if (err) {
                                console.log(err)
                                res.send('-110')
                                return
                            } else {
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
                                    }
                                    console.log('user found ' + user)
                                    for (var i = user.benefits.length - 1; 0 <= i; i--) {
                                        if (user.benefits[i].BID == 1  && user.benefits[i].count == 1) {
                                            user.benefits.splice(i)
                                        } else if (user.benefits[i].BID == 1 && user.benefits[i].count > 1) {
                                            user.benefits[i].count = user.benefits[i].count - 1
                                        } else {
                                            res.send('-18')
                                            return
                                        }
                                        user.save(function (err) {
                                            if (err) {
                                                console.log(err)
                                                res.send('-110')
                                                return
                                            }
                                            res.send(result)
                                        })
                                    }
                                })
                            }
                        })
                    }

                })
            } else {
                res.send(result)
            }
        })
        //GAME ÄNDERN!
}


exports.init = init
exports.getAllItems = getAllItems
exports.buyItem = buyItem
exports.upgradeMessageCount = upgradeMessageCount
exports.skipUser = skipUser