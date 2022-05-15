const { v4: uuidv4 } = require('uuid');
const express = require('express');
const router = express.Router();
const Users = require('../models/user');

const pino = require('pino');
const pretty = require('pino-pretty');
const pinoLoki = require('pino-loki');

const options = {
    hostname: 'http://loki:3100',
    applicationTag: 'backend',
    timeout:3000,
    silenceErrors:false 
}

const streams = [
    { level: 'info', stream: pretty() },
    { level: 'info', stream: pinoLoki.createWriteStreamSync(options) },
];

let logger = pino({level:'info'}, pino.multistream(streams));

//http://localhost:5000/users
router.get('/', (req, res) => {
    try {
        Users.find({}).then(users => {
            logger.info({tags: {collection:"users",operation:"get",status:"success"}});
            res.send(users);
        });
    } catch (err) {
        logger.info({tags: {collection:"users",operation:"get",status:"error"}});
        console.log(err);
        res.status(500);
        res.send({"Message" : "Error getting users"});
    }
});

//http://localhost:5000/users/role/:email
router.get('/role/:email', (req, res) => {
    try {
        Users.findOne({email : req.params.email}).then(user => {
            logger.info({tags: {collection:"users",operation:"get",status:"success"}});
            res.send(user.role);
        });
    } catch (err) {
        console.log(err);
        logger.info({tags: {collection:"users",operation:"get",status:"error"}});
        res.status(500);
        res.send({"Message" : "Error getting user"});
    }
});

//http://localhost:5000/users/points/:email
router.get('/points/:email', (req, res) => {
    try {
        Users.findOne({email : req.params.email}).then(user => {
            logger.info({tags: {collection:"users",operation:"get",status:"success"}});
            res.send(user.points);
        });
    } catch (err) {
        logger.info({tags: {collection:"users",operation:"get",status:"error"}});
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
            logger.info({tags: {collection:"users",operation:"post",status:"error"}});
            res.status(400);
            res.send({"Message" : "Invalid body"});
        } else {
            logger.info({tags: {collection:"users",operation:"post",status:"success"}});
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
                logger.info({tags: {collection:"users",operation:"delete",status:"error"}});
                res.status(404);
                res.send({"Message" : "User not found"});
            } else {
                logger.info({tags: {collection:"users",operation:"delete",status:"success"}});
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
        logger.info({tags: {collection:"users",operation:"put",status:"error"}});
        res.status(400);
        res.send({"Message" : "Invalid body"});
    }
    Users.findOneAndUpdate({email: email}, {$set: {role: role}}, (err, success) => {
        if (!success) {
            logger.info({tags: {collection:"users",operation:"put",status:"error"}});
            res.status(404);
            res.send({"Message" : "User not found"});
        } else {
            logger.info({tags: {collection:"users",operation:"put",status:"success"}});
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
        logger.info({tags: {collection:"users",operation:"post",status:"error"}});
        console.log("invalid body");
        res.status(400);
        res.send({"Message" : "Please fill all fields"});
    }
    else if (isNaN(lat) || isNaN(lng)) {
        logger.info({tags: {collection:"users",operation:"post",status:"error"}});
        console.log("lat or lng is not a number");
        res.status(400);
        res.send({"Message" : "Latitude or Longitude is not a number"});
    }
    else if (lat < -90 || lat > 90) {
        logger.info({tags: {collection:"users",operation:"post",status:"error"}});
        console.log("lat is not in range");
        res.status(400);
        res.send({"Message" : "Latitude is not in range -90 to 90"});
    }
    else if (lng < -180 || lng > 180) {
        logger.info({tags: {collection:"users",operation:"post",status:"error"}});
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
                logger.info({tags: {collection:"users",operation:"post",status:"error"}});
                res.status(404);
                res.send({"Message" : "User not found"});
            } else {
                logger.info({tags: {collection:"users",operation:"post",status:"success"}});
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
        logger.info({tags: {collection:"users",operation:"delete",status:"error"}});
        res.status(400);
        res.send({"Message" : "Invalid body"});
    }
    Users.findOneAndUpdate({email: email}, {$pull: {points: {id: id}}}, (err, success) => {
        if (!success) {
            logger.info({tags: {collection:"users",operation:"delete",status:"error"}});
            res.status(404);
            res.send({"Message" : "User not found"});
        } else {
            logger.info({tags: {collection:"users",operation:"delete",status:"success"}});
            res.status(200);
            res.send({"Message" : "Point deleted from user"});
        }
    });
});

module.exports = router;