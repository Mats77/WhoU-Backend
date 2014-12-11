var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/whoU')

var db = mongoose.connection
db.on('error', console.error)
db.once('open', function () {

    console.log('Step 1')
    var userSchema = mongoose.Schema({
        username: String,
        password: String,
        mail: String,
        sessionkey: String,
        longitude: Number,
        latitude: Number,
        modus: Number,
        picture: String
    })

    var User = mongoose.model('User', userSchema)
    var firstUser = new User({
        username: 'admin',
        password: 'admin',
        mail: 'admin@admin.de'
    })
    firstUser.save(function (err, data) {
        if (!err) console.log(data)
        if (err) console.err
    })

    //    console.log('Step 3')
    //    var gameSchema = mongoose.Schema({
    //        userSearching: String,
    //        userFound: String,
    //    })
    //
    //    console.log('Step 4')
    //    var Game = mongoose.model('Game', gameSchema)
    //
    //    var firstGame = new Game({
    //        userSearching: 'admin1',
    //        userFound: 'admin2'
    //    })
    //    firstGame.save(function (err, done) {
    //        console.log('done')
    //    })

    console.log('Last Step done')
})