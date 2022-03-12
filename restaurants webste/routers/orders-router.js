let express = require('express');
let router = express.Router();
let ObjectID = require('mongodb').ObjectId;

router.post('/', saveOrder);
router.get('/:orderId', sendOrder);

//gets the order from client and saves it in the db
function saveOrder(req, res){
    let order = req.body;  //order from the client

    //add a mongoid and username to the order object
    order._id = new ObjectID();
    order.username = req.session.username;

    //update orders array in mongodb
    req.app.locals.db.collection("users").updateOne({username: req.session.username}, {$push: {orders: order}}, function(err, result){
        if(err) {
            console.log(err);
            res.status(500).send("Error updating order in database");
            return;
        }
        //send the id of the restaurant so it can be redirected to that page
        res.status(200).json(order._id.toString());
    })
}

//get a specific profile from the db and send to pug
function sendOrder(req, res){
    //convert the requested id to mongo object id so it can be used to query the database
    let id;
    try{
        id = new ObjectID(req.params.orderId);
    }catch{
        res.status(404).send("Unknown ID")
        return
    }

    //find the order with the request id from the database
    req.app.locals.db.collection("users").findOne({"orders._id": id}, {projection: {orders:1, _id: 0, privacy: 1}}, function(err, result){
        if(err){
            res.status(500).send("Error querying databse for order");
            return;
        }
        if(!result){
            //send an error is the id is not in the database
            res.status(404).send("Unknown ID");
            return;
        }
        //only show the page if the user who placed the order is public or is the one requesting the order
        if(!result.privacy || (req.session.username === result.orders[0].username)){
            //get the exact order from array of orders
            let order = result.orders.filter(order => order._id.equals(id))[0];
            res.status(200).render('./pages/order', {order: order});
        } else{
            res.status(403).send("Forbidden.");
        }
    })
}

module.exports = router;