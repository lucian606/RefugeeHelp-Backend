var express = require('express');
var router = express.Router();
var Points = require('../models/point');

// htttps://localhost:5000/points/
router.get('/', (req, res) => {
    try {
        Points.find().exec(
            (err, collection) => {
                if (err) {
                    console.log(err);
                }
                res.status(200);
                res.send(collection);
            }
        )
    } catch (err) {
        res.status(500).send('500');
    }
});

router.post('/', (req, res) => {
    let newEntryData = req.body;
    Points.create(newEntryData, (err, db) => {
        if (err) {
            res.status(400);
            res.send({"Message" : "Invalid body"});
        } else {
            res.status(200);
            res.send({"Message" : "Entry added"});
        }
    })
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