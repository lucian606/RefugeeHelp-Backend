const express = require('express');
const router = express.Router();
const Users = require('../models/user');

"http://localhost:5000/users"
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

router.get('/:email', (req, res) => {
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
    const email = req.body.email;
    const lat = req.body.lat;
    const lng = req.body.lng;
    const icon = req.body.icon;
    const title = req.body.title;
    const description = req.body.description;
    if (!email || !lat || !lng || !icon || !title || !description) {
        res.status(400);
        res.send({"Message" : "Invalid body"});
    }
    const point = {lat: lat, lng: lng, icon: icon, title: title, description: description};
    Users.findOneAndUpdate({email: email}, {$push: {points: point}}, (err, success) => {
        if (!success) {
            res.status(404);
            res.send({"Message" : "User not found"});
        } else {
            res.status(200);
            res.send({"Message" : "Point added to user"});
        }
    });    
});

router.delete('/points', (req, res) => {
    const email = req.body.email;
    const title = req.body.title;
    if (!email || !title) {
        res.status(400);
        res.send({"Message" : "Invalid body"});
    }
    Users.findOneAndUpdate({email: email}, {$pull: {points: {title: title}}}, (err, success) => {
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