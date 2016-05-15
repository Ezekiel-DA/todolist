'use strict';

var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true, lowercase: true},
    privateIdentity: {
        oauth: {type: String, required: true}
    },
    myTasks: [mongoose.Schema.ObjectId],
    fridge: {
        tasks: [mongoose.Schema.ObjectId]
    }
});

var User = mongoose.model('User', userSchema);

module.exports = User;