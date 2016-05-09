'use strict';

var mongoose = require('mongoose');

var taskSchema = new mongoose.Schema({
    title: {type: String, maxlength: 140, required: true},
    description: {type: String},
    done: {type: Boolean, required: true, default: false}
});

var Task = mongoose.model('Task', taskSchema);

module.exports = Task;