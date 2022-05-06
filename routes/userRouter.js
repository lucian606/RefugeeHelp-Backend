const { v4: uuidv4 } = require('uuid');
const express = require('express');
const router = express.Router();
const Users = require('../models/user');

//http://localhost:5000/users
router.get('/', (req, res) => {
    try {
        Users.find({}).then(users => {
            res.send(users);
        });
    } catch (err) {
        console.log(err);
        res.status(500);
        res.send({"Message" : "Error getting users"});
    }
});

//http://localhost:5000/users/role/:email
router.get('/role/:email', (req, res) => {
    try {
        Users.findOne({email : req.params.email}).then(user => {
            res.send(user.role);
        });
    } catch (err) {
        console.log(err);
        res.status(500);
        res.send({"Message" : "Error getting user"});
    }
});

//http://localhost:5000/users/points/:email
router.get('/points/:email', (req, res) => {
    try {
        Users.findOne({email : req.params.email}).then(user => {
            res.send(user.points);
        });
    } catch (err) {
        console.log(err);
        res.status(500);
        res.send({"Message" : "Error getting user"});
    }
});

// router.post('/points', (req, res) => {
//     try {
//         Users.findOne({email : req.body.authorEmail}).then(user => {
//             user.points.push(req.body);
//             user.save();
//             res.send(user);
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(500);
//         res.send({"Message" : "Error getting user"});
//     }
// });

router.post('/', (req, res) => {
    const userBody = req.body;
    console.log("registering user: " + userBody.email);
    console.log(userBody);
    Users.create(userBody, (err, db) => {
        if (err) {
            res.status(400);
            res.send({"Message" : "Invalid body"});
        } else {
            res.status(201);
            res.send({"Message" : "User added"});
        }
    });
});

router.delete('/', (req, res) => {
    const email = req.body.email;
    if (!email) {
        res.status(400);
        res.send({"Message" : "Invalid body"});
    } else {
        Users.findOneAndDelete({email: email}, (err, success) => {
            if (!success) {
                res.status(404);
                res.send({"Message" : "User not found"});
            } else {
                res.status(200);
                res.send({"Message" : "User deleted"});
            }
        });
    }
});

router.put('/', (req, res) => {
    const email = req.body.email;
    const role = req.body.role;
    if (!email || !role) {
        res.status(400);
        res.send({"Message" : "Invalid body"});
    }
    Users.findOneAndUpdate({email: email}, {$set: {role: role}}, (err, success) => {
        if (!success) {
            res.status(404);
            res.send({"Message" : "User not found"});
        } else {
            res.status(200);
            res.send({"Message" : "User updated"});
        }
    });
});

router.post('/points', (req, res) => {
    console.log("adding points");
    const email = req.body.authorEmail;
    const lat = req.body.lat;
    const lng = req.body.lng;
    const icon = req.body.icon;
    const title = req.body.title;
    const description = req.body.description;
    if (!email || !lat || !lng || !title || !description) {
        console.log("invalid body");
        res.status(400);
        res.send({"Message" : "Invalid body"});
    }
    else if (isNaN(lat) || isNaN(lng)) {
        console.log("lat or lng is not a number");
        res.status(400);
        res.send({"Message" : "Latitude or Longitude is not a number"});
    }
    else if (lat < -90 || lat > 90) {
        console.log("lat is not in range");
        res.status(400);
        res.send({"Message" : "Latitude is not in range -90 to 90"});
    }
    else if (lng < -180 || lng > 180) {
        console.log("lng is not in range");
        res.status(400);
        res.send({"Message" : "Longitude is not in range -180 to 180"});
    }
    else {
        console.log("why is this not working?");
        const id = uuidv4();
        const point = {lat: lat, id: id, lng: lng, title: title, description: description, authorEmail: email};
        Users.findOneAndUpdate({email: email}, {$push: {points: point}}, (err, success) => {
            if (!success) {
                res.status(404);
                res.send({"Message" : "User not found"});
            } else {
                res.status(200);
                res.send({"Message" : "Point added to user"});
            }
        }); 
    }
});

router.delete('/points', (req, res) => {
    const email = req.body.email;
    const id = req.body.id;
    if (!email || !id) {
        res.status(400);
        res.send({"Message" : "Invalid body"});
    }
    Users.findOneAndUpdate({email: email}, {$pull: {points: {id: id}}}, (err, success) => {
        if (!success) {
            res.status(404);
            res.send({"Message" : "User not found"});
        } else {
            res.status(200);
            res.send({"Message" : "Point deleted from user"});
        }
    });
});

module.exports = router;