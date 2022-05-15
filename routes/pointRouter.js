var express = require('express');
var router = express.Router();
var Points = require('../models/point');

const pino = require('pino');
const pretty = require('pino-pretty');
const pinoLoki = require('pino-loki');

const options = {
    hostname: 'http://loki:3100',
    applicationTag: 'backend',
    timeout:3000,
    silenceErrors:false 
};

const streams = [
    { level: 'info', stream: pretty() },
    { level: 'info', stream: pinoLoki.createWriteStreamSync(options) },
];

let logger = pino({level:'info'}, pino.multistream(streams));


// htttps://localhost:5000/points/
router.get('/', (req, res) => {
    try {
        Points.find({}).then( points => {
            console.log("points: " + points);
            res.send(points);
        });
        logger.info({tags: {collection:"points",operation:"get",status:"success"}});
    } catch (err) {
        logger.info({tags: {collection:"points",operation:"get",status:"error"}});
        res.status(500).send('500');
    }
});

router.post('/', (req, res) => {
    const email = req.body.authorEmail;
    const lat = req.body.lat;
    const lng = req.body.lng;
    const icon = req.body.icon;
    const title = req.body.title;
    const description = req.body.description;
    if (!email || !lat || !lng || !title || !description) {
        console.log("invalid body");
        logger.info({tags: {collection:"points",operation:"get",status:"error"}});
        res.status(400);
        res.send({"Message" : "Please fill all fields"});
    }
    else if (isNaN(lat) || isNaN(lng)) {
        console.log("lat or lng is not a number");
        logger.info({tags: {collection:"points",operation:"post",status:"error"}});
        res.status(400);
        res.send({"Message" : "Latitude or Longitude is not a number"});
    }
    else if (lat < -90 || lat > 90) {
        console.log("lat is not in range");
        logger.info({tags: {collection:"points",operation:"post",status:"error"}});
        res.status(400);
        res.send({"Message" : "Latitude is not in range -90 to 90"});
    }
    else if (lng < -180 || lng > 180) {
        logger.info({tags: {collection:"points",operation:"post",status:"error"}});
        console.log("lng is not in range");
        res.status(400);
        res.send({"Message" : "Longitude is not in range -180 to 180"});
    }
    let newEntryData = req.body;
    Points.create(newEntryData, (err, db) => {
        if (err) {
            logger.info({tags: {collection:"points",operation:"post",status:"error"}});
            console.log(err);
            res.status(400);
            res.send({"Message" : "Invalid body"});
        } else {
            logger.info({tags: {collection:"points",operation:"post",status:"success"}});
            console.log("created");
            res.status(200);
            res.send({"Message" : "Entry added"});
            // TODO send to rabbitmq
        }
    })
});

router.delete('/:id', (req, res) => {
    const id = req.params.id;
    Points.findByIdAndDelete(id, (err, db) => {
        if (err) {
            logger.info({tags: {collection:"points",operation:"delete",status:"error"}});
            console.log(err);
            res.status(400);
            res.send({"Message" : "Invalid id"});
        } else {
            console.log("deleted");
            logger.info({tags: {collection:"points",operation:"delete",status:"success"}});
            console.log(db);
            res.status(200);
            res.send({"Message" : "Entry deleted"});
        }
    });
});

router.delete('/', (req, res) => {
    Points.findOneAndDelete({title : req.body.title}, (err, removeSuccess) => {
        if (err) {
            logger.info({tags: {collection:"points",operation:"delete",status:"error"}});
            console.log(err);
        }
        if (!removeSuccess) {
            logger.info({tags: {collection:"points",operation:"delete",status:"error"}});
            res.status(404);
            console.log(`No entry with the name:${req.body.title}`);
            res.send({"Message" : `No entry with the name:${req.body.title}`});
        } else {
            logger.info({tags: {collection:"points",operation:"delete",status:"success"}});
            res.status(200);
            res.send({"Message" : "Entry deleted"});
        }
     })
});

router.put('/', (req, res) => {

});

module.exports = router