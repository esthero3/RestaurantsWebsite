let express = require('express');
let session = require('express-session');
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let MongoDBStore = require('connect-mongodb-session')(session);
let app = express();
let path = require('path');

//session store
let store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/sessionStore',
    collection: 'sessions'
})

//routers
let usersRouter = require('./routers/users-router');
let ordersRouter = require('./routers/orders-router');

//globals
app.locals.db; 

//middleware
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: false,
    store: store
}));

//routes
app.use(exposeSession);
app.get(['/', '/home'], (req,res) => res.render('./pages/home'));
app.get('/login', (req, res) => res.render('./pages/login'));
app.post('/login', login);
app.get('/logout', logout);
app.get('/register', (req, res) => res.render('./pages/register'));
app.post('/register', register);
app.get('/orderform', orderForm);
app.use('/users', usersRouter);
app.use('/orders', ordersRouter);


//prevents session from being lost during redirects
function exposeSession(req, res, next){
    if(req.session) res.locals.session = req.session;
    //console.log(req.session);
    next();
}

//log user in
function login(req, res){
    if(req.session.loggedIn){
        res.status(403).send("Already logged in");
        return;
    }

    //get the input username and password
    let username = req.body.username;
    let password = req.body.password;

    //query database to get usernames and passwords
    app.locals.db.collection("users").find({}, {projection: {username:1, password: 1}}).toArray(function(err, result){
        if(err){
            res.status(500).send("Error querying databse");
            return;
        }
        let usernames = result;

        //find the user from database that matches the input user.
        let user = usernames.find(user => user.username.toLowerCase() === username.toLowerCase());

        //username is not registered
        if(user === undefined){
            //send a param to pug to display error alert
            res.status(401).render('./pages/login', {message: "username"});
            return;
        } 

        //username is registered and the password is correct. Log em in
        if(user.password === password){
            username = username.toLowerCase();
            req.session.loggedIn = true;
            req.session.username = username;
            req.session.userId = user._id;
            res.locals.session = req.session;
            res.status(200).redirect('/home');
        }else{
            //password incorrect
            res.status(401).render('./pages/login', {message: "password"});
        }
    })
}

//log user out
function logout(req, res){
    //reset the sesion and take them to the home page
    if(req.session.loggedIn){
		req.session.loggedIn = false;
        req.session.username = undefined;
        req.session.userId = undefined;
        res.locals.session = req.session;
		res.status(200).redirect('/home');
	}else{
		res.status(401).send("You cannot log out because you aren't logged in.");
	}
}

//register user
function register(req, res){
    let username = req.body.username;
    let password = req.body.password;

    //ensure fields are given
    if(username.length == 0 || password.length == 0){
        //if field is empty, send a message through pug
        res.status(406).render('./pages/register', {message: "empty"});
        return;
    }

    //query database to get usernames
    app.locals.db.collection("users").distinct("username", {}, function(err, result){
        if(err){
            res.status(500).send("Error querying databse");
            return;
        }
        let usernames = result;

        //check is the username already exists (case insensitive)
        let exists = usernames.filter(name => name.toLowerCase() === username.toLowerCase())[0];
        
        //if the username already exists, send an error message through pug
        if(exists){
            res.status(409).render('./pages/register', {message: "duplicate"});
        }else{
            username = username.toLowerCase();
            let user = {
                username: username,
                password: password,
                privacy: false,
                orders: []
            }
            app.locals.db.collection("users").insertOne(user, function(err2, result2){
                if(err2){
                    res.status(500).send("Error adding user to databse.");
                    return;
                }
                //log in user
                req.session.loggedIn = true;
                req.session.username = username;
                req.session.userId = result2.insertedId;  //the object id that mongo created
                res.locals.session = req.session;

                //go to profile page
                res.status(200).redirect(`/users/${req.session.userId}`);
            })
        }
    })
}

function orderForm(req, res){
    if(req.session.loggedIn){
        res.status(200).render('./pages/orderform');
    }else{
        res.status(401).send("Unauthorized. You have to be logged in");
    }
}

//connect to database
MongoClient.connect("mongodb://localhost:27017/", function(err, client) {
    if(err) throw err;

    //Get the database
    app.locals.db = client.db('a4');

    //start server
    app.listen(3000);
    console.log("Server listening at http://localhost:3000");
})