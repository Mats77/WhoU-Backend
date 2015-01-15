Who-U Backend
=====
Who-U is a social gaming app that brings strangers together. 
The app helps breaking the ice by giving a hook for a conversation or an activity.

#Getting started
This app is a cross-platform app build with phonegap and ionic.
The following lines are going to describe the structure of the node.js based backend. To store the data a mongodb is used. There are four different collections in the database:

```js
var userSchema = mongoose.Schema({
            pushId: String,
            username: String,
            password: String,
            mail: String,
            sessionkey: String,
            longitude: Number,
            latitude: Number,
            modus: Number,
            coins: Number,
            visible: Number,
            coinFactor: Number,
            photos: Array,
            benefits: Array,
            usersToTalkWith: Array
        })

var gameSchema = mongoose.Schema({
            userSearching: String,
            userFound: String,
            ratedByUserSearched: Number,
            ratedByUserFound: Number,
            timeStamp: Number
        })
        
var contactSchema = mongoose.Schema({
            firstUserId: String,
            secondUserId: String,
            verifiedByFirstUser: Number,
            verifiedBySecondUser: Number,
            messagesLeftFirstUser: Number,
            messagesLeftSecondUser: Number,
            messages: Array
        })
        
benefitSchema = mongoose.Schema({
            id: Number,
            name: String,
            description: String,
            price: Number
        })
```
Since we wanted this app to be developed as a real app and didn't want to have any backend-synchonization problems, we decided to host the backend on uberspace.de.
The serverside code is divided up into five modules in total, which are going to be described step by step.

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
The register method creates a new user document, using the arguments passed by the client request, and responds with the id, which is given by the monogdb. Before creating a user it's verified, that the mail isn't in use yet. To avoid spam users it's allowed to have only one user per mail-account. Actually there is a second way to create a user. You can register and therefore also login with your facebook account. Most of this is handled client-sided. The only serverside-difference is, that xxxxxxx.

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

**The Login Module:**

After the user is created he has to log himself in. Non-facebook-users have to insert their credentials. If they're correct the server generates a session key, updates the Datamodel of the user and sends the key back to the client.

```js
var loginWithMail = function (req, res) {
    //.....
    UserModel.findOne({
            mail: credentials.mail,
            password: credentials.password
        }, function (err, user) {
            if (err) {
                //Error Handling
            } else if (user == null) {
                //Error Handling
            } else {
                var sessionkey = Math.random() * 1e20
                user.sessionkey = sessionkey
                //Updating User and returning Value
            }
        }
    })
}
```

This 20-digits-long random key is stored in the localStorage of the client. With each following start of the app the userId and the sessionkey are transmitted to the server automatically. In those cases the users seems to be automatically logged in. Only when he logs out in the settings screen he has to reinsert his credentials.

With a succesfull sessionkey-login all relevant userdata are sent to the client, so that the personal homescreen can be set up properly. Since we expect the users to have not so many personal data stored yet, with a username login the only thing returned is the userid with the sessionkey. All necessary data are requested seperately, which will be described in the next section.


**The UserData Module:**
This UserData Module is a huge and important one. It offers nine APIs which serve the purpose to the CRUD methods of the user data. For example there are the savePhoto, getPhoto, deletePhoto and updateProfilPhoto methods. The client converts a photo, that is stored on the users phone or just has been taken by the user, into a string. This string is transmitted to the server and stored in the user.photos array. With the photoString an id, which is unique for one user but not for all photos is stored. In addition to that the photo object contains a isProfilPhoto flag which is set to one for the first photo automatically. 

```js
//requesting the user and error handling
var isProfilPhoto = user.photos.length == 0 ? 1 : 0
var photoId = user.photos.length == 0 ? 0 : user.photos[user.photos.length-1].id
user.photos.push({
    id: user.photos.length,             //0 or last element's id + 1
    photoString: req.body.photoString,
    isProfilPhoto: isProfilPhoto
})
//user.save()
```

As soon as the user has more than one photo stored he can decide whether he wants to keep the first photo to be his profil photo or if he wants to update it. Each photo is requested with the id of the user, that is requesting and the proper photoId. An array of all available photoIds as well as the id ot the profil photo are part of the getUserData method.
Moreover the getUserData method sends the amount of gained coins and the pushId.

```js
//result of getUserData
var userToReturn = {
            id: _id,
            userName: user.username,
            coins: user.coins,
            photoIds: photoIds,
            profilePhotoId: profilePhotoId,
            pushId: user.pushId //necessary if the data of the opponent are requested so that he can be pushed
        }
```

Probably the most complex method in this module is getRecentEvents. It offers data, which are shown like a board in the users homescreen. It searches through all the games to collect those, in which the requesting user took part. Because the GameModel only saves the userIds they have to be looked up in the users collection.

**The Play Module:**

**The Benefit Module:**

**The Chat Module:**
