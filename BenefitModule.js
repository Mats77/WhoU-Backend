var mongoose = require('mongoose')
var db
var benefitModel
var userModel

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
        userModel = require('mongoose').model('User')
        benefitModel = mongoose.model('Benefit', benefitSchema)
    })
}

var getAllItems = function (req, res) {
    var items = benefitModel.find({}, function (err, data) {
        if (err) {
            res.send('-8')
            return
        }
        res.send(data)
    })
}

var buyItem = function (req, res) {
    res.send('-9999')
}


exports.init = init
exports.getAllItems = getAllItems
exports.buyItem = buyItem