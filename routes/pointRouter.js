var express = require('express');
var router = express.Router();
var Points = require('../models/point');

// htttps://localhost:5000/points/
router.get('/', (req, res) => {
    try {
        Points.find({}).then( points => {
            console.log("points: " + points);
            res.send(points);
        });
    } catch (err) {
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
        res.status(400);
        res.send({"Message" : "Please fill all fields"});
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
    let newEntryData = req.body;
    Points.create(newEntryData, (err, db) => {
        if (err) {
            console.log(err);
            res.status(400);
            res.send({"Message" : "Invalid body"});
        } else {
            console.log("created");
            res.status(200);
            res.send({"Message" : "Entry added"});
        }
    })
});

router.delete('/:id', (req, res) => {
    const id = req.params.id;
    Points.findByIdAndDelete(id, (err, db) => {
        if (err) {
            console.log(err);
            res.status(400);
            res.send({"Message" : "Invalid id"});
        } else {
            console.log("deleted");
            console.log(db);
            res.status(200);
            res.send({"Message" : "Entry deleted"});
        }
    });
});

router.delete('/', (req, res) => {
    Points.findOneAndDelete({title : req.body.title}, (err, removeSuccess) => {
        if (err) {
            console.log(err);
        }
        if (!removeSuccess) {
            res.status(404);
            console.log(`No entry with the name:${req.body.title}`);
            res.send({"Message" : `No entry with the name:${req.body.title}`});
        } else {
            res.status(200);
            res.send({"Message" : "Entry deleted"});
        }
     })
});

router.put('/', (req, res) => {

});

module.exports = router