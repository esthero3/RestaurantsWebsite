let express = require('express');
let router = express.Router();

router.get('/', getUsers);
router.post('/', savePrivacy);
router.get('/:userId', sendProfile);

//gets the users list from db and sends to pug to display 
function getUsers(req, res){
    let name = req.query.name;

    //get usernames and privacy settings from database
    req.app.locals.db.collection("users").find({}, {projection: {username:1, privacy: 1}}).toArray(function(err, result){
        if(err){
            res.status(500).send("Error querying databse");
            return;
        }
        let users = result;

        //if query parameter is given
        if(name){
            //get the user's username contains the query param, then ensure it is not private
            usersResult = users.filter(user => user.username.toLowerCase().includes(name.toLowerCase()));
            usersResult = usersResult.filter(user => !user.privacy);
        }else{
            //only public users
            usersResult = users.filter(user => !user.privacy);
        }
        res.status(200).render('./pages/users', {users: usersResult});
    })
}

//get a specific profile from the db and send to pug
function sendProfile(req, res){    
    //get users data from the database
    req.app.locals.db.collection("users").find().toArray(function(err, result){
        if(err){
            res.status(500).send("Error querying databse");
            return;
        }

        let users = result;
        //get user whose id mataches the requested id
        let reqProfile = users.filter(user => user._id.toString() === req.params.userId)[0];

        //send error if profile does not exist
        if(reqProfile == undefined){
            res.status(404).send("Profile does not exist");
            return;
        }
        //Is the requested profile the profile of the logged in user?
        let ownsProfile = reqProfile.username === req.session.username;

        //if the user is requesting for their own profile,
        if(ownsProfile){
            res.status(200).render('./pages/user', {user: reqProfile, owner: true});
        } else {
            //profile is private & the user reqesting for the profile does not own it 
            if(reqProfile.privacy){
                res.status(403).send("Forbidden");
            }else {
                //does not own the profile being request but that profile is public
                res.status(200).render('./pages/user', {user: reqProfile, owner: false});
            }
        }
    })
}

//updates the user's privacy field
function savePrivacy(req, res){
    let value = req.body.privacy === 'true'; //ensures it is a boolean not a string
    let username = req.session.username;

    if(typeof value !== undefined){ //make sure value is not undefined
        //update the user's privacy on the db
        req.app.locals.db.collection("users").updateOne({username: username}, { $set: {privacy: value}}, function(err, result){
            if(err) {
                res.status(500).send("Error updating database");
                return;
            }
            //redirect to page of users
            res.status(200).redirect(`/users/`);
        })
    }
}

module.exports = router;