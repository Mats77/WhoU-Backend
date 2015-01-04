const request = require('request')
const host = 'http://localhost:'
const port = 61234
const newUserPath = '/newUser'
const loginWithMailPath = '/login/mail/'
const loginWithSessionKeyPath = '/login/sessionkey'
const searchPartnerToPlayWithPath = '/play'
const gamesToRatePath = '/play/rating/gamesToRate'
const insertNewRatingPath = '/play/rating/insertNewRating'
const allItemsPath = '/benefit/allItems'
const buyItemPath = '/benefit/buyItem'
const userDataPath = '/userData/data'
const recentEventsPath = '/userData/recentEvents'
const changeModusPath = '/userData/changeModus'
const updateGPSPath = '/userData/updateGPS'
const newPhotoPath = '/photo/saveNew'
const deletePhotoPath = '/photo/delete'
const logOutPath = '/logout'
const deleteUserPath = '/delete'

var userId = 0
var sessionKey = 0
var testCount = 0
var successfullCount = 0
var failureCount = 0
var testShouldBeFinished = 16

function createNewUser(name, pwd, mail, longitude, latitude) {
    testCount++
    var user = {
        'username': name,
        'password': pwd,
        'mail': mail,
        'longitude': longitude,
        'latitude': latitude
    }

    request.post(host + port + newUserPath, {
        form: user
    }, function (err, response, body) {
        if (err) {
            console.log(err)
            console.error('CREATE USER BROKE DOWN')
            failureCount++
            printResult()
            return
        } //Connection-Error
        userId = body
        console.log('Everything alright with createNewUser: ' + body)
        successfullCount++
        printResult()
        searchPartnerToPlayWith(userId)
        getUserData(userId)
        changeModus(userId, 1)
        insertNewRating(userId, 50)
        updateGPS(userId, 10, 10)
        savePhoto(userId, "123g87oerghf8owcz4np8z34xm984czn534p834ünv5npzc25nnz938p4f5nüu13p8")
        deletePhoto(userId, 1)
    })
}

var logUserInWithMail = function (mail, password) {
    testCount++
    var user = {
        'mail': mail,
        'password': password
    }
    request.get(host + port + loginWithMailPath, {
        form: user
    }, function (err, response, body) {
        if (err && body != '-3') {
            console.log(err)
            console.error('LOGIN WITH MAIL BROKE DOWN')
            failureCount++
            printResult()
            return
        }
        console.log('Everything alright with loginWithMail: ' + body)
        sessionKey = JSON.parse(body).SessionKey
        successfullCount++
        printResult()
        if (sessionKey != 0 && userId != 0)
            logUserInWIthSessionKey(userId, sessionKey)
    })
}

var logUserInWIthSessionKey = function (userId, sessionKey) {
    testCount++
    var credentials = {
        '_id': userId,
        'sessionkey': sessionKey
    }
    request.get(host + port + loginWithSessionKeyPath, {
        form: credentials
    }, function (err, response, body) {
        if (err || body == '-4') {
            console.log(err + body)
            console.error('LOGIN WITH SESSIONKEY BROKE DOWN')
            failureCount++
            printResult()
            return
        }
        console.log('Everything alright with loginWithSessionKey: ' + body)
        successfullCount++
        printResult()
        logout(userId)
    })
}

var deleteUser = function (userId) {
    testCount++
    var user = {
        '_id': userId
    }
    request.del(host + port + deleteUserPath, {
        form: user
    }, function (err, response, body) {
        if (err || body != '1') {
            console.log(err + body)
            console.error('DELETE BROKE DOWN')
            failureCount++
            printResult()
            return
        }
        console.log('Everything alright with deleteUser: ' + body)
        successfullCount++
        printResult()
    })
}

var printResult = function () {
    if (testCount == testShouldBeFinished && failureCount + successfullCount == testShouldBeFinished) {
        console.log(successfullCount + '/' + testCount + ' Tests were successful')
        if (failureCount > 0) {
            console.error('WATCH OUT! There were ' + failureCount + ' Tests unsuccessful')
            return
        }
        console.log('CHECK!!')
    }
}

var getAllBenefits = function () {
    testCount++
    request.get(host + port + allItemsPath, function (err, response, data) {
        if (err) {
            console.log(err || JSON.parse(data).length != 2)
            console.error('GET ALL ITEMS BROKE DOWN')
            failureCount++
            printResult()
            return
        }
        console.log('Everything alright with getAllItems: ' + data)
        successfullCount++
        printResult()
    })
}

var searchPartnerToPlayWith = function (userId) {
    testCount++
    var user = {
        '_id': userId
    }
    request.post(host + port + searchPartnerToPlayWithPath, {
        form: user
    }, function (err, response, data) {
        if (err || data == '-100' || data == '-5') {
            console.log(err + data)
            console.error('PLAY BROKE DOWN')
            failureCount++
            printResult()
            return
        }
        console.log('Everything alright with Play: ' + data)
        successfullCount++
        printResult()
        getRecentEvents(userId)
        getGamesToRate(userId)
    })
}

var getUserData = function (userId) {
    testCount++
    var user = {
        'UID': userId
    }
    request.get(host + port + userDataPath, {
        form: user
    }, function (err, response, data) {
        if (err) {
            console.log(err + data)
            console.error('USERDATA BROKE DOWN')
            failureCount++
            printResult()
            return
        }
        console.log('Everything alright with UserData: ' + data)
        successfullCount++
        printResult()
    })
}

var getRecentEvents = function (userId) {
    testCount++
    var user = {
        'UID': userId
    }
    request.get(host + port + recentEventsPath, {
        form: user
    }, function (err, response, data) {
        if (err) {
            console.log(err + data)
            console.error('RECENT EVENTS BROKE DOWN')
            failureCount++
            printResult()
            return
        }
        console.log('Everything alright with RecentEvents: ' + data)
        successfullCount++
        printResult()
    })
}

var insertNewRating = function (userId, coins) {
    testCount++
    var coinAddRequest = {
        '_id': userId,
        'coins': coins
    }
    console.log(host + port + insertNewRatingPath)
    request.put(host + port + insertNewRatingPath, {
        form: coinAddRequest
    }, function (err, response, data) {
        if (err || data != 1) {
            console.log(err + data)
            console.error('INSERT NEW RATING BROKE DOWN')
            failureCount++
            printResult()
            return
        }
        console.log('Everything alright with InsertNewRating: ' + data)
        successfullCount++
        printResult()
        buyItem(userId, 1, 1)
    })
}

var changeModus = function (userId, newModus) {
    testCount++
    var changeModusRequest = {
        'UID': userId,
        'newModus': newModus
    }
    request.put(host + port + changeModusPath, {
        form: changeModusRequest
    }, function (err, response, data) {
        if (err || data != 1) {
            console.log(err + data)
            console.error('CHANGE MODUS BROKE DOWN')
            failureCount++
            printResult()
            return
        }
        console.log('Everything alright with ChangeModus: ' + data)
        successfullCount++
        printResult()
    })
}

var updateGPS = function (userId, longitude, latitude) {
    testCount++
    var userLocationData = {
        'UID': userId,
        'longitude': longitude,
        'latitude': latitude
    }
    request.put(host + port + updateGPSPath, {
        form: userLocationData
    }, function (err, response, data) {
        if (err) {
            console.log(err + data)
            console.error('UPDATE GPS BROKE DOWN')
            failureCount++
            printResult()
            return
        }
        console.log('Everything alright with UpdateGPS: ' + data)
        successfullCount++
        printResult()
    })
}

var buyItem = function (userId, benefitId, count) {
    testCount++
    var buyRequest = {
        '_id': userId,
        'BID': benefitId,
        'count': count
    }
    request.post(host + port + buyItemPath, {
        form: buyRequest
    }, function (err, response, data) {
        if (err || data != 1) {
            console.log(err + data)
            console.error('BUY ITEM BROKE DOWN')
            failureCount++
            printResult()
            return
        }
        console.log('Everything alright with buyItem: ' + data)
        successfullCount++
        printResult()
    })
}

var logout = function (userId) {
    testCount++
    var user = {
        '_id': userId,
    }
    request.put(host + port + logOutPath, {
        form: user
    }, function (err, response, data) {
        if (err || data != 1) {
            console.log(err + data)
            console.error('LOGOUT BROKE DOWN')
            failureCount++
            printResult()
            return
        }
        console.log('Everything alright with logout: ' + data)
        successfullCount++
        printResult()
        deleteUser(userId)
    })
}

var getGamesToRate = function (userId) {
    testCount++
    var user = {
        _id: userId
    }
    request.get(host + port + gamesToRatePath, {
        form: user
    }, function (err, response, data) {
        if (err || data.length == 2) {
            console.log(err + data)
            console.error('GAMES TO RATE BROKE DOWN')
            failureCount++
            printResult()
            return
        }
        console.log('Everything alright with gamesToRate: ' + data)
        successfullCount++
        printResult()
    })
}

var savePhoto = function (userId, photoString) {
    testCount++
    var photoData = {
        '_id': userId,
        'photoString': photoString,
    }
    request.post(host + port + newPhotoPath, {
        form: photoData
    }, function (err, response, data) {
        if (err || data < 0) {
            console.log(err + data)
            console.error('SAVE NEW PHOTO BROKE DOWN')
            failureCount++
            printResult()
            return
        }
        console.log('Everything alright with savePhoto: ' + data)
        successfullCount++
        printResult()
    })
}

var deletePhoto = function (userId, photoId) {
    testCount++
    var deletePhotoRequest = {
        '_id': userId,
        'PID': photoId
    }
    console.log('URL: ' + host + port + deletePhotoPath)
    request.del(host + port + deletePhotoPath, {
        form: deletePhotoRequest
    }, function (err, response, data) {
        if (err || data < 0) {
            console.log(err + data)
            console.error('DELETE PHOTO BROKE DOWN')
            failureCount++
            printResult()
            return
        }
        console.log('Everything alright with deletePhoto: ' + data)
        successfullCount++
        printResult()
    })
}

createNewUser('admin', 'admin', 'test@test.de')
logUserInWithMail('test@test.de', 'admin')
getAllBenefits()