Who-U Backend
=====
Who-U is a social gaming app that brings strangers together. 
The app helps breaking the ice by giving a hook for a conversation or an activity.

#Getting started
This app is a cross-platform app build with phonegap and ionic.
The following lines are going to describe the structure of the node.js based backend. To store the data a mongodb is used. There are four different collections in the database:

```js
var userSchema = mongoose.Schema({
            pushId: String,         //pushId for GCM or APN
            username: String,
            password: String,
            mail: String,
            sessionkey: String,     //used to auto-login
            longitude: Number,
            latitude: Number,
            modus: Number,
            coins: Number,          //necessary to buy benefits
            visible: Number,        //flag if someone is eligible for being found by play-algorithm
            coinFactor: Number,     //can be upgraded by a benefit. Has influence on how many coins the user get                                      //for playing
            photos: Array,
            benefits: Array,        //stores the benefits, bought by the user
            usersToTalkWith: Array  //if both users agreed to a chat after playing, a contact is stored here
})

var gameSchema = mongoose.Schema({
            userSearching: String,              //user who started the game actively
            userFound: String,                  //user who was matched by the matching algorithm
            ratedByUserSearched: Number,        //flag if the user already has rated the game
            ratedByUserFound: Number,
            timeStamp: Number
})
       
//with the rating users have to decide whether they want to stay in contact with each other or not. If both players vote for yes a contact is created and they can start chatting.
var contactSchema = mongoose.Schema({
            firstUserId: String,                
            secondUserId: String,
            verifiedByFirstUser: Number,        //1: wants to stay in contact; 0: doesn't want to
            verifiedBySecondUser: Number,       //as soon as both have voted and at least one voted "no" this                                                     //object will be destroyed
            messagesLeftFirstUser: Number,      //default value 30 messages --> client explanation why
            messagesLeftSecondUser: Number,
            messages: Array                     //stores the messages sent with the userId, text and timestamp
})

//benefits can be purchased to increase the user experience        
benefitSchema = mongoose.Schema({
            id: Number, 
            name: String,
            description: String,                //short description of the benefit, which is displayed to the user
            price: Number                       //price in coins, which are gained by getting rated by other                                                      //players
})
```
Since we wanted this app to be developed as a real app and didn't want to have any backend-synchonization problems, we decided to host the backend on uberspace.de.
The serverside code is divided up into five modules in total, which are going to be described step by step.

#Backend Structure
The initial point of the Backend is the Server.js file, in which all Paths are declared as constants as follows:

```js
//...
const updateProfilPhotoPath = '/photo/profilPhoto'
//...
````

Those constants are used by the express.js framework (https://github.com/expressjs), to route the incoming http-requests to the proper module and method.

```js
//...
app.get(loginWithMailPath, cors(), function (req, res, next) {
        loginModule.loginWithMail(req, res)
})
//...
````

The method .get() signals which http method has to be used by the client to send the server request. Since the client code is tested in the browser using the "grunt serve" method, the "cors()" parameter is necessary to set a header, which symbols the legality of cross-domain-http-requests.
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
and from thenon does nothing else than routing the request and response objects. In case something went wrong the server sends an error code to the client, in which the occured error is handled. A collection of all possible error codes can be found below in this document. If no data is requested a simple "1" is sent back to the client, so that it knows, that no problems occured on the server

#The Modules
**The Registration Module:**

It seems obvious to start with this module, because it is the first module, which the users have to interact with. In its init() method a connection to the mongodb is opened and the UserSchema is declared. In addition to that it offers the methods "register" and "delete".
The register method creates a new user document, using the arguments passed by the client's request, and responds with the id, which is given by the monogdb. Before creating a user it's verified, that the mail isn't in use yet. To avoid spam users it's allowed to have only one user per mail-account. Actually there is a second way to create a user. You can register and therefore also login with your facebook account. Most of this is handled client-sided. The only serverside-difference is, that there are some other arguments in the document. For example the password field only contains: 'facebook'.

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

This 20-digits-long random key is stored in the localStorage of the client. With each following start of the app the userId and the sessionkey are transmitted to the server automatically. In those cases the users are automatically logged in. Only when he logs out in the settings screen he has to reinsert his credentials.

With a succesfull sessionkey-login all relevant userdata are sent to the client, so that the personal homescreen can be set up properly. Since we expect the users to have not so many personal data stored yet, with a username login the only thing returned is the userid with the sessionkey. All necessary data are requested seperately, which will be described in the next section.


**The UserData Module:**

This UserData Module is a huge and important one. It offers nine APIs which serve the purpose of CRUD methods. For example there are the savePhoto, getPhoto, deletePhoto and updateProfilPhoto methods. The client converts a photo, that is stored on the users phone or just has been taken by the user, into a string. This string is transmitted to the server and stored in the user.photos array. With the photoString an id, which is unique for one user but not for all photos, is stored. In addition to that the photo object contains a isProfilPhoto flag which is set to one for the first photo automatically. 

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

Probably the most complex method in this module is getRecentEvents. It offers data, which are shown on the board in the users homescreen. It searches through all the games to collect those, in which the requesting user took part. Because the GameModel only saves the userIds, the names have to be looked up in the users collection.

UpdateGPS, insertPushId and changeModus are very generic functions, which take the requesting user id and the new data to update the mongodb. Nothing special here and the code should be self-explaining.

**The Play Module:**

The play Module might be the most important one, because it contains the very core of our application, which is the player-matching-algorithm. Furthermore the logic to handle the ratings and therefore also the contact creation, the algorithm which searches for the user's games, that haven't been rated are located in this module.

We thought of the following three arguments a player should have to be an eligible match. The first argument is, that the possible match hasn't played with the searching player for at least the last 24 hours. To assure that, we lookup all playing partners of the searching player of the last 24 hours an add them to an ineligible-list.

```js
//...fetching the games...
for (var i = 0; i < games.length; i++) {
            console.log('NEW PLAY ALGORITHM: Time Difference: ' + games[i].timeStamp - Date.now())
            if (games[i].timeStamp - Date.now() < (1000 * 60 * 60 * 24)) {
                        if (games[i].userSearching == _id)
                                    ineligibleUsers.push(games[i].userFound)
            else
                        ineligibleUsers.push(games[i].userSearching)
            }
}
//...second argument...
```
Secondly the destince between those two users shouldn't be more than 500 metres. Therefore we gather the latitude and longitude data every single minute. Those values will be updated, so that we are not collecting those data to create geoprofiles of our users. To narrow the number of possible matches we fetch all users from the mongodb, which are not ineligible because of their last game. After this step we check the distance between each pair. If the distance is below 500 metres, the visibility of the possible match is checked. If both values are true, we found a possible match and the player is added to an eligible-list. As soon as all possible matches are in this list one player is picked randomly.

```js
//...first argument...
var eligibleUsers = []
for (var i = 0; i < users.length; i++) {
            //Distance
            if (getDistance(user.latitude, user.longitude, users[i].latitude, users[i].longitude, 'K') < 500) {
                        //Visibility
                        if(users[i].visible == 1)
                                    eligibleUsers.push(users[i])
            }
}

if (eligibleUsers.length > 0) {
       var otherPlayer = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)]
        //sending match to client
}
```

This algorithm can be called either by the initial play request or by the skip-player benfit, which is going to be described in the next section.

The second important part in this module is about what's happening after the game has been finished. We assume, that a game lasts about 30 minutes, so that we don't ask our users to confirm the end of the game. The client asks regularly if there are any not yet rated games on the server. If that is the case an array of those games is answered. To find out whether there are games, which have to be rated, all games, the requesting player played - either as the one searching or the one searched - are fetched from the database. Those, which are not rated by him are sent back.

```js
//...fetching the games of the requesting user....
for (var i = 0; i < games.length; i++) {
            //requesting user was found
            if (games[i].userFound == _id && games[i].ratedByUserFound == 0) {
                        gamesToRate.push({
                                    gameId: games[i]._id,
                                    otherPlayerId: games[i].userSearching
                        })
            //requesting user was searching
            } else if (games[i].userSearching == _id && games[i].ratedByUserSearched == 0) {
                        gamesToRate.push({
                                    gameId: games[i]._id,
                                    otherPlayerId: games[i].userFound
                        })
            }
}
//...sending back the array...
```

In case the client receives at least one game to rate, the user can see with whome he played and can rate some things (more detailed description in the client). Afterwards the client calculates how many coins the rated user gets and sends a flag whether there is a whish to stay in contact. To handle this the "handleRating" method is used. In the first part of this method the coins are added to the user's account.

```js
//...fetching user from database....
 if (user.coins != null)
            user.coins += (coins * user.coinFactor)
else
            user.coins = (coins * user.coinFactor)
//since the coinfactor is a benefit for 10 games, it has to be reduced for everyone played and eventually removed
if (user.coinFactor != 1) {
            for (var i = user.benefits.length - 1; 0 <= i; i--) {
                    if (user.benefits[i].id == 4) {
                        user.benefits[i].counter = user.benefits[i].counter - 1
                        if (user.benefits[i].counter == 0)
                            user.benefits[i].splice(i,1)
                    }
                }}
}

```

After this addition has been succesfully finished the updated user data are saved. Thereafter the appropriate game is fetched from the database and the flag, that this user has rated the game. Lastly this method calls the "handleContactRequest" method.

This method distinghuishes two different possibilities firstly. He might be the first one who rated this game or the second one. In case he is the first one a new document is created in the database and it is saved whether he wants to stay in contact or not and the method is done sending an "1".

```js
//he is the first one who rated the game, so no contact could be found
else if (contact == null) {
            //new document created.
            var newContact = new ContactModel({
                        firstUserId: userId,
                        secondUserId: otherUserId,
                        verifiedByFirstUser: wishesToStayInContact,
                        verifiedBySecondUser: 0,
                        messagesLeftFirstUser: 30,
                        messagesLeftSecondUser: 30,
                        messages: []
            }).save(function (err) {
                        //...
            }
}
```

In case he is not the first one the method has to handle two different possibilities again. The first user might want to stay in contact or not. If he doesn't want to stay in contact the contact document can be deleted and the method is done. Otherwise we have to check if the second user wants to stay in contact too. Assuming that is true, the contact document is updated and the chatting can begin. Alternatively the document is deleted.

```js

if ((contact.verifiedByFirstUser == 1 || contact.verifiedBySecondUser == 1) && wishesToStayInContact) {
            ContactModel.update({
                        //updating query
} else {
            ContactModel.remove({
                        //removing query
            })
}

```

**The Chat Module:**

The chat module can be split up into two parts. While the first one provides necessary data, the second one is responsible for transmitting messages and initializing push notifications. Necessary data are the users, who can be talked to in the first place. Those requests are handled in the "getUsersCurrentlyPlayedWith" method. All contacts, in which the requesting user is involved in are fetched from the database. Then it is evaluated which is the userId of the other user. All other userIds are sent as an array back to the client. Data like the name or the profil picture of the chat partners are fetched in separate requests. 

Additionally data like the messages, which have already been sent between those two users are interesting for the client. Therefore we created the "getPreviousMessages" API. It simply takes the id of the requesting user and the id of his chat partner as arguments. Those arguments are passed into the contact collection of the database to find the proper contact. In this document the messages are stored as an array of JSON containing the message itself, a timestamp and a field for identifying which user is the author of this message.

Since users have only a decent amount of messages - 30 by default - to send in each chat, an API to request the messages left is necessary. This API takes the ids of the requesting user as well as of the chat partner, looks the proper data up in the database and sends the answer back to the client.

That leads us to the second part of the chat module. Most important here is the "sendMessage" method. The first steps of this method are to find the proper user, who wants to send the message and the contact that connects him to his chat partner. Then we have to check, if he still has a message left. Otherwise an error occurs.

```js
//...fetching data from database...
if (contact.firstUserId == _id) {
            if (contact.messagesLeftFirstUser > 0) {
                contact.messagesLeftFirstUser = contact.messagesLeftFirstUser - 1
            } else {
                res.send('-xxxxx')
                return
            }
}else{
//same with second userId
}
//...sending the message...
```

In case he still has enough messages left and no errors occur updating the database, a new request is executed to find the pushId of the user, that has to be notified. Finally the push notification is set up and sent. At the current state of development we only support push notifications to android users, because we didn't have a possibility to test this on an iOS device. Sending the push notification is done using the Google Cloud Messaging Service (GCM). Firstly the message object is created before it is filled with its payload and finally sent.

```js
//creating message and sender object
var push = new gcm.Message()
var sender = new gcm.Sender('AIzaSyA7nZKnoB8Gn1p8gqkR5avZYSwhrmlFxDU')

//settinf up the payload --> for example title, message, sound and further necassary information
var registrationIds = [user.pushId]
push.addData('message', message)
push.addData('title', 'Du hast eine neue Nachricht erhalten!')
push.addData('msgcnt', '1')
push.addData('soundname', 'beep.wav') 
push.addData('isMessage', true)
push.addData('userId', otherUserId)
push.timeToLive = 3000

//sending
sender.send(push, registrationIds, 4, function (result) {
            console.log(result)
            res.send('1')
})

```

In addition to those messages described above we added two more APIs, that use push notifications. They are meant to increase the user experience while sending a push as soon as a game starts and in case someone can't find his matching partner he can "push for help". Those APIs are realised in the methods "pushSearchStarted" and "sendStandardMessage".

**The Benefit Module:**

Benefits can be bougth by users, who played who-U enough to earn a decent amount of coins. With benefits the convenience of the user experience can be increased a bit. For example more messages can be sent or users, who were matched, can be skipped.

Firstly this module contains a method "getAllBenefits", which just fetches all the different benefit documents from the benefit collection out of the mongodb and returns them as an JSON array to the client. The answer contains data like the name, price, description and id of the benefits.

Secondly there are two methods in this module which handles the purchasing process of benefits and one, that handles the benefit effects. Why we needed two different methods for that is going to be explained in the following. Obviously there is the "buyItem" method. It is responsible for the purchasing of all benefits except upgrading the messagesleft. The reason is, that further information are needed for the lastly mentioned benefit and it isn't stored but immediately redeemed.

The first part of "buyItem" fetches the requesting user and the wished benefit from the different collections in the database. If the process was succesfull, the cost of the benefits are compared to amount of the user's coins. Actually this comparison is already done in the client, but we thought it to be clever to use some defensive programming here to avoid exploits, which can occur due to network latency or something else. 

```js
if (user.coins >= (item.price * req.body.count)) {
            user.coins = (user.coins - (Number(item.price) * Number(req.body.count)))
```

Finally in the third part the benefits array in the user model gets updated. We differentiate whether the bought item is a benefit, that the user had at least once before or not. Depending on that we either have to increase the counter or add a new benefit. A special one in this case is the more points pre game benefit because you immediately get 10 counts with one purchase of the benefit.

```js

//3 part

//checking it item alredy exists in the benefit array
var itemAlreadyExistsAtLeastOnce = false
for (var i = 0; i < user.benefits.length; i++) {
            if (user.benefits[i].BID == item.id) {
                        //checking if bought benefit is more points per game
                        if (user.benefits.id == 4) {
                                    user.benefits[i].count = user.benefits[i].count + 10
                                    itemAlreadyExistsAtLeastOnce = true
                        } else {
                                    user.benefits[i].count = user.benefits[i].count + 1
                                    itemAlreadyExistsAtLeastOnce = true
                        }
            }
}
//if benefit is new, add it to array
if (!itemAlreadyExistsAtLeastOnce) {
            user.benefits.push({
                        BID: item.id,
                        count: req.body.count
            })
}

```

Since we need additional data to update the message count we created a specific API for that purpose. It takes the userId of the user who buys the messages and the id of the user he wants to send the additional messages to. Afterwards a simple increasing update of the proper contact document is done in the database.

A little more complex is the redemption of the skip user benefit, which is the last method in this module. The complexity arise with the fact that the game document is created after the two players are matched. So the user can't skip his match before the game is created. Therefore we need the gameId to keep the game collection consistent when redeeming this benefit. That's what's actually done in the first method's part. The second part updates the requesting user's benefit count and sends the answer.


#Error Codes

**Standard error codes:**

* -4          : No User found with given Id 
* -100        : Error connecting to database while reading someting 
* -110        : Error connecting to database while saving something 
* -120        : Error connecting to database while deleting something 
* -400        : Error connecting to the server 
* -9999       : Not implemented yet

**Registration error codes**

* -2          : Mail already in use

**Login error codes**

* -3          : No User found because none existing with the credentials inserted

**Play error codes**

* -5          : No opponent found 
* -6          : Error creating a game 
* -10         : No games to rate 
* -41         : No User found while getting games to rate --> probably deleted

**Benefit error codes**

* -7          : No Item found with given Id 
* -9          : Not enough cash 
* -12         : No contact for those two users found 
* -13         : Game not found 
* -14         : Not enough Benefits bought

**UserData error codes** 

* -8          : Photo not found

**Chat error codes** 

* -11         : No games played 

Everything else.... What the fuck

