Who-U Backend
=====
Who-U is a social gaming app that brings strangers together. 
The app helps breaking the ice by giving a hook for a conversation or an activity.

#Getting started
This app is a cross-platform app build with phonegap and ionic.
The following lines are going to describe the structure of the node.js based backend. To store the data a mongodb is used. There are five modules in total, which are going to be described step by step

#Backend Structure
The initial point of the Backend is the Server.js file, in which all Paths are declared as constants as follows:

```js
    const updateProfilPhotoPath = '/photo/profilPhoto'
````

Those constants are used by the express.js framework (https://github.com/expressjs), to route the incoming http-requests to the proper module and method.

```js
    app.get(loginWithMailPath, cors(), function (req, res, next) {
        loginModule.loginWithMail(req, res)
    })
````

The method .get() signals which http method has to be used by the client to send the server request. Since the client code is tested in the browser using the "grunt serve" method, the "corse()" parameter is necessary to set a header, which symbols the legality of cross-domain-http-requests.
Actually the server.js just initializes all modules and itself:

```js
registrationModule.init()
playModule.init()
loginModule.init()
userDataModule.init()
benefitModule.init()
chatModule.init()

var app = express()
````
and from thenon does nothing else than routing the requests.

#The Modules
**The Registration Module:**

It seems obvious to start with this module, because it is the first, which is used by a user during registration.
 


