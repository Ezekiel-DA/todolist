'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var httpStatus = require('http-status');
var mongoose = require('mongoose');
mongoose.Promise = Promise;

mongoose.connect('mongodb://localhost/todoList');

var taskSchema = mongoose.Schema({
    title: {type: String, maxlength: 140, required: true},
    description: {type: String},
    done: {type: Boolean, required: true, default: false}
});

var Task = mongoose.model('Task', taskSchema);

var app = express();
app.use(bodyParser.json());

var apiRouter = express.Router();
apiRouter.get('/tasks', (req, res) => {
    Task.find().then(tasks => {
        res.send(tasks);
    });
});

apiRouter.post('/task', (req, res) => {
    if (!req.body.title) { // title is mandatory
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }       
    var task = new Task(req.body); // mongoose will take care of filtering only the info that fits the schema
    task.save().then(task => {
        res.sendStatus(httpStatus.CREATED);
    }).catch(err => {
        res.send(httpStatus.INTERNAL_SERVER_ERROR);
    });    
});
apiRouter.route('/task/:id')
.get((req, res) => {
    Task.findById(req.params.id).exec()
    .then(task => {
        res.send(task);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    });
})
.patch((req, res) => {
    Task.findByIdAndUpdate(req.params.id, req.body).exec()
    .then(task => {
        res.send(task);
    })
    .catch(err => {
        console.log(err);
        res.send(httpStatus.INTERNAL_SERVER_ERROR);
    });
}).delete((req, res) => {
    Task.remove({_id: req.params.id}).exec()
    .then(() => {
        res.sendStatus(httpStatus.OK);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
    });
});

app.use('/api', apiRouter);

app.listen(3000);