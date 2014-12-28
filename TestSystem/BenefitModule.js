var mongoose = require('mongoose')
var db
var BenefitModel
var UserModel

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
    })
}

var getAllItems = function (req, res) {
    var items = BenefitModel.find({}, function (err, data) {
        if (err) {
            res.send('-8')
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
                    res.send('-10')
                    return
                } else if (item == null) {
                    res.send('-11')
                    return
                } else {
                    if (user.coins > (item.price * req.body.count)) {
                        user.coins = (Number(item.price) * Number(req.body.count))
                        if (user.benefits.length == 0) {
                            user.benefits = [
                                {
                                    BID: item.id,
                                    count: req.body.count
                                }
                            ]
                        } else {
                            user.benefits.push({
                                BID: item.id,
                                count: req.body.count
                            })
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
                        res.send('-13')
                    }
                    return
                }
            })
            return
        }
    })
}


exports.init = init
exports.getAllItems = getAllItems
exports.buyItem = buyItem