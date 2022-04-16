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
},
    {
        versionKey: false
    }
);

module.exports = mongoose.model('Point', pointSchema, 'Points');
