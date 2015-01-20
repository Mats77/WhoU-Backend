var mongoose = require('mongoose')
var db
var BenefitModel
var UserModel
var ContactModel
var GameModel
const playModule = require('./PlayModule')

//db initialization
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

//returning all possible benefits
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
    var _id = req.body._id
    var BID = req.body.BID

    //1 part

    //fetching user and requested benefit
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
            BenefitModel.findOne({
                id: BID
            }, function (err, item) {
                if (err) {
                    res.send('-100')
                    return
                } else if (item == null) {
                    res.send('-7')
                    return
                } else {

                    //2 part

                    //checking if user has coins --> defensie programming
                    //and reducing amount of coins
                    if (user.coins >= (item.price * req.body.count)) {
                        user.coins = (user.coins - (Number(item.price) * Number(req.body.count)))

                        //3 part

                        //adding benefit to user's benfit array
                        //if he already has bought this benefit and not spent it yet, increase amount, otherwise add new JSON to array
                        var itemAlreadyExistsAtLeastOnce = false
                        for (var i = 0; i < user.benefits.length; i++) {
                            if (user.benefits[i].BID == item.id) {
                                if (user.benefits.id == 4) {
                                    user.benefits[i].count = user.benefits[i].count + 10
                                    itemAlreadyExistsAtLeastOnce = true
                                } else {
                                    user.benefits[i].count = user.benefits[i].count + 1
                                    itemAlreadyExistsAtLeastOnce = true
                                }
                            }
                        }
                        if (!itemAlreadyExistsAtLeastOnce) {
                            user.benefits.push({
                                BID: item.id,
                                count: req.body.count
                            })
                        }

                        //updating user and handling errors
                        user.save(function (err) {
                            if (err) {
                                res.send('-110')
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

//special API for upgrading Messages, because immediate redeeming
var upgradeMessageCount = function (req, res) {
    var _id = req.body._id
    var otherUserId = req.body.otherUser
    console.log('UPGRADE: ' + _id)
    console.log('UPGRADE: ' + otherUserId)

    //decreasing coins of requesting user
    UserModel.update({
        _id: _id
    }, {
        $inc: {
            coins: -15
        }
    }, function (err) {
        if (err) {
            console.log(err)
            res.send('-110')
            return
        }
        //and upgrading messages left in contact model
        ContactModel.findOne({
            $or: [
                {
                    firstUserId: _id,
                    secondUserId: otherUserId
                }, {
                    secondUserId: _id,
                    firstUserId: otherUserId
            }
        ]
        }, function (err, contact) {
            if (err) {
                console.log(err)
                res.send('-100')
                return
            }
            if (contact == null) {
                res.send('-12')
                return
            }
            contact.messagesLeftFirstUser = contact.messagesLeftFirstUser + 30
            contact.messagesLeftSecondUser = contact.messagesLeftSecondUser + 30

            console.log(contact)
            contact.markModified('messagesLeftFirstUser')
            contact.markModified('messagesLeftSecondUser')

            contact.save(function (err) {
                if (err) {
                    res.send('-100')
                    console.log(err)
                    return
                }
                return ('1')
            })
        })
    })
}

var skipUser = function (req, res) {
    var _id = req.body._id
    var gameId = req.body.gameId

    playModule.matchMe(_id, function (result) {
        //1 part

        //check if matching algorithm returned an object or an error code
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

                    //updating the user foud in the game
                    //the document was already created after the first user has been matched
                    //because the user was matched and the game has already been safed a rematch is algorithmically not possible
                    game.userFound = result.otherUserId
                    game.save(function (err) {
                        if (err) {
                            console.log(err)
                            res.send('-110')
                            return
                        } else {

                            //2 part

                            //creating the JSON to return
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

                                //decreasing the benefit count
                                var benefitFound = false
                                for (var i = user.benefits.length - 1; 0 <= i; i--) {
                                    console.log(user.benefits[i])
                                    if (user.benefits[i].BID == 1  && user.benefits[i].count == 1) {
                                        user.benefits.splice(i)
                                        benefitFound = true
                                    } else if (user.benefits[i].BID == 1 && user.benefits[i].count > 1) {
                                        user.benefits[i].count = user.benefits[i].count - 1
                                        benefitFound = true
                                    }
                                }

                                //3 part
                                if (!benefitFound) {
                                    res.send('-14')
                                    return
                                }
                                //saving the user with decrased benefit amount
                                user.save(function (err) {
                                    if (err) {
                                        console.log(err)
                                        res.send('-110')
                                        return
                                    }

                                    //returning the newly matched user
                                    console.log('Skip user returning: ' + result)
                                    res.send(result)
                                })
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