const request = require('request')
const host = 'http://whou.sabic.uberspace.de'
const port = 443
const newUserPath = '/api/newUser'
const loginWithUsernamePath = '/api/login/username'
const loginWithSessionKeyPath = '/api/login/sessionkey'
const searchPartnerToPlayWithPath = '/api/play'


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

    console.log(host + newUserPath)
    request.post(host + newUserPath, {
        form: newUser
    }, function (err, response, body) {
        if (err) {
            console.log(err)
            return -1 //Connection Error
        }
        console.log(body)
        return body
    })
}

createNewUser(123121.123122, 12222.1223, '54844b303f3f588c0fdaeefa')