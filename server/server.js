'use strict';

var express = require('express');
var http = require('http');
var https = require('https');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var httpStatus = require('http-status');
var mongoose = require('mongoose');
var Task = require('../models/task');
var User = require('../models/user');
var fs = require('fs');
var GitKitClient = require('gitkitclient');
var morgan = require('morgan');

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/todoList');

var gitkitClient = new GitKitClient(JSON.parse(fs.readFileSync('./server/gitkit-server-config.json')));

function requireHTTPS(req, res, next) {
    if (!req.secure) {
        return res.redirect('https://'+req.get('host') + req.url);
    }
    next();
}

var app = express();
app.use(morgan('combined'));
//app.use(requireHTTPS);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('static'));

app.get('/callback', renderLoginCBPage);
app.post('/callback', renderLoginCBPage);

function renderLoginCBPage(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(new Buffer(fs.readFileSync('./static/gitkit-widget.html')).toString().replace('%%postBody%%', encodeURIComponent(req.body || '')));
}

app.get('/user', (req, res) => {
    if (req.cookies.gtoken) {
        gitkitClient.verifyGitkitToken(req.cookies.gtoken, (err, res) => {
            console.log(err);
            console.log(res);
        });
    }
    res.send(httpStatus.INTERNAL_SERVER_ERROR);
});

var apiRouter = express.Router();
apiRouter.get('/tasks', (req, res) => {
    Task.find().sort('done').then(tasks => {
        res.send(tasks);
    });
});

apiRouter.post('/task', (req, res) => {
    if (!req.body.title) { // title is mandatory
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }       
    var task = new Task(req.body); // mongoose will take care of filtering only the info that fits the schema
    task.save().then(task => {
        res.send(httpStatus.CREATED, task);
    }).catch(err => {
        console.log(err);
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
    Task.findByIdAndUpdate(req.params.id, req.body, {new: true}).exec()
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

http.createServer(app).listen(80);
// https.createServer({
//     key: fs.readFileSync('./server/private/key.pem'),
//     cert: fs.readFileSync('./server/private/cert.pem')
// }, app).listen(443);