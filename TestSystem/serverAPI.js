//Error codes:
//9999 --> Not implemented

const http = require('http')
const querystring = require('querystring')
const request = require('request')
const host = 'http://localhost'
const port = 61234
const newUserPath = '/api/newUser'
const loginWithUsernamePath = '/api/login/username'
const loginWithSessionKeyPath = '/api/login/sessionkey'
const searchPartnerToPlayWithPath = '/api/play'

function createNewUser(username, password, mail) {
    var user = {
        'username': username,
        'password': password,
        'mail': mail
    }

    request.post(host + ':' + port + newUserPath, {
        form: user
    }, function (err, response, body) {
        if (err) return -400 //Connection-Error
        console.log(response.body)
        return response.body // -1 for Error on Server otherwise new UserID
    })
    return -9999
}

function loginWithUsername(mail, password) {
    var user = {
        'mail': mail,
        'password': password
    }

    request.get(host + ':' + port + loginWithUsernamePath, {
        form: user
    }, function (err, response, body) {
        if (err) {
            console.log(err)
            return -400
        } //Connection-Error
        console.log(response.body.substring(2))
        return (response.body.substring(2))
    })
    return -9999
}

function loginWithSessionKey(userId, sessionkey) {
    var credentials = {
        '_id': userId,
        'sessionkey': sessionkey
    }
    request.get(host + ':' + port + loginWithSessionKeyPath, {
        form: credentials
    }, function (err, response, body) {
        if (err) {
            console.log(err)
            return -400
        } //Connection-Error
        console.log(response.body)
        return (response.body) //Json with id, username, password, mail and sessionkey
    })
    return -9999
}

function searchPartnerToPlayWith(long, lat, userId) {
    var searchRequest = {
        '_id': userId,
        'longitude': long,
        'latitude': lat
    }
    request.post(host + ':' + port + searchPartnerToPlayWithPath, {
        form: searchRequest
    }, function (err, response, body) {
        if (err) {
            console.log(err)
            return -400 //Connection Error
        }
        console.log(body)
        return body //username, long, lat, task, picture
    })
    return -9999
}