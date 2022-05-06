const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
    lat : {
        type: Number,
        required: true
    },
    lng : {
        type: Number,
        required: true
    },
    icon : {
        type: String
    },
    title : {
        type: String,
        required: true,
        unique: true
    },
    description : {
        type: String,
        required: true
    },
    authorEmail: {
        type: String,
        required: true,
        maxLength: 50,
        match: /[a-z0-9\._%+!$&*=^|~#%{}/\-]+@([a-z0-9\-]+\.){1,}([a-z]{2,22})/
    },
},
    {
        versionKey: false
    }
);

module.exports = mongoose.model('Point', pointSchema, 'Points');
