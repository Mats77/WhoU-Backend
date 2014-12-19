var serverAPI = require('./serverAPI')

exports.testSomething = function (test) {
    test.expect(1)
    test.ok(true, "this assertion should pass")
    test.done()
}

exports.testSomethingElse = function (test) {
    test.ok(true, "this assertion should pass too")
    test.done()
}

exports.testLogin = function (test) {
    var req = {}
    req.param = {

    }
    serverAPI.loginWithMail("dummy@dummy.de", "dummy", function (data) {
        test.ok(data > 100000000000, "SessionID passt")
    })
    test.done()
}