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
and from thenon does nothing else than routing the request and response objects. 

#The Modules
**The Registration Module:**

It seems obvious to start with this module, because it is the first module, which the users have to interact with. In its init() method a connection to the mongodb is opened and the UserSchema is declared. In Addition to that it offers the methods "register" and "delete".
The register method creates a new user document, using the arguments passed by the client request, and responds with the id, which is given by the monogdb. Before creating a user it's verified, that the mail isn't in use yet. To avoid spam users it's allowed to have only one user per mail-account.

```js
var user = new UserModel({
    pushId: '',                     //pushId for GCM or APN
    username: req.body.username,
    password: req.body.password,
    mail: req.body.mail,
    longitude: req.body.longitude,
    latitude: req.body.latitude,
    coinFactor: 1,                  //can be upgraded by a benefit. Has influence on how many coins the user get for                                       playing
    coins: 0,                       //necessary to buy benefits
    visible: 1,                     //flag if someone is eligible for being found by play-algorithm
    photos: [],
    benefits: [],                   //stores the benefits, bought by the user
    usersToTalkWith: []             //if both users agreed to a chat after playing, a contact is stored here
})
```

The second method is "delete", which takes a userId as argument and deletes the user.
