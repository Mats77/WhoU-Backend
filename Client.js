const request = require('request')
const host = 'http://whou.sabic.uberspace.de/api'
const port = 443
const gamesToRatePath = '/play/rating/gamesToRate'
const insertNewRatingPath = '/play/rating/insertNewRating'
const allItemsPath = '/benefit/allItems'
const buyItemPath = '/benefit/buyItem'
const userDataPath = '/userData/data'
const recentEventsPath = '/userData/recentEvents'
const changeModusPath = '/userData/changeModus'
const updateGPSPath = '/userData/updateGPS'
const newPhotoPath = '/photo/saveNew'
const deletePhotoPath = 'photo/delete'
const logOutPath = '/logout'


function createNewUser(name, pwd, mail) {
    var newUser = {
        'username': name,
        'password': pwd,
        'mail': mail
    }

    //    request.get(host + ':' + port + loginWithUsernamePath, {
    //        form: user
    //    }, function (err, response, body) {
    //        if (err) {
    //            console.log(err)
    //            return -400
    //        } //Connection-Error
    //        console.log(response.body.substring(2))
    //        return (response.body.substring(2))
    //    })

    //    request.get(host + ':' + port + loginWithSessionKeyPath, {
    //        form: credentials
    //    }, function (err, response, body) {
    //        if (err) {
    //            console.log(err)
    //            return -400
    //        } //Connection-Error
    //        console.log(response.body)
    //        return (response.body)
    //    })
    //
    //
    //    request.post(host + ':' + port + searchPartnerToPlayWithPath, {
    //        form: searchRequest
    //    }, function (err, response, body) {
    //        if (err) {
    //            console.log(err)
    //            return -1 //Connection Error
    //        }
    //        console.log(body)
    //        return body
    //    })
    //
    //    console.log(host + newUserPath)
    //    request.post(host + newUserPath, {
    //        form: newUser
    //    }, function (err, response, body) {
    //        if (err) {
    //            console.log(err)
    //            return -1 //Connection Error
    //        }
    //        console.log(body)
    //        return body
    //    })
}

var getUserData = function (userId, callback) {
    request.get()
    $http({
        url: host + userDataPath,
        method: 'GET',
        params: userId
    }).success(callback).error(function (data) {
        console.log(data)
    })
}

getUserData(123111213312212, function (data) {
    console.log(data)
})