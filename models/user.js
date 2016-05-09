'use strict';

var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true, lowercase: true},
    privateIdentity: {
        oauth: {type: String, required: true}
    }
});

var User = mongoose.model('User', userSchema);

module.exports = User;