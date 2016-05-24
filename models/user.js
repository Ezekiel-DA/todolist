'use strict';

var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    username: {type: String, required: true},
    email: {type: String, required: true, unique: true, lowercase: true},
    privateIdentity: {
        oauth: {type: String, required: true, unique:true}
    },
    myTasks: [{type: mongoose.Schema.ObjectId, ref: 'Task'}],
    fridge: {
        friends: [{type: mongoose.Schema.ObjectId, ref: 'User'}],
        tasks: [{type: mongoose.Schema.ObjectId, ref: 'Task'}]
    }
});

var User = mongoose.model('User', userSchema);

module.exports = User;