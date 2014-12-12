var login = require('./LoginModule')

exports.testSomething = function (test) {
    test.expect(1)
    test.ok(true, "this assertion should pass")
    test.done()
}

exports.testSomethingElse = function (test) {
    test.ok(true, "this assertion should pass too")
    test.done()
}

exports.testSomethingElse = function (test) {
    test.ok(login.loginWithSessionKey('abc', 'bcd', 'def'), "this assertion should pass too")
    test.done()
}