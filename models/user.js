const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        maxLength: 50,
        unique: true,
        match: /[a-z0-9\._%+!$&*=^|~#%{}/\-]+@([a-z0-9\-]+\.){1,}([a-z]{2,22})/
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    points: {
        type: Array,
        default: []
    }
},
    {
        versionKey: false
    }
);

module.exports = mongoose.model('User', UserSchema, 'Users');