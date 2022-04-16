var express = require('express');
var router = express.Router();
var Points = require('../models/point');

// htttps://localhost:5000/points/
router.get('/', (req, res) => {
    res.send({"message" : "HEIL"});
});

module.exports = router