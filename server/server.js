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
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/todoList');

var gitkitClient = new GitKitClient(JSON.parse(fs.readFileSync('./server/gitkit-server-config.json')));
var nodemailerMailgun = nodemailer.createTransport(mg(JSON.parse(fs.readFileSync('./server/private/mailgun_api.json'))));

function requireHTTPS(req, res, next) {
    if (!req.secure) {
        return res.redirect('https://'+req.get('host').replace('8000', '4430') + req.url);
    }
    next();
}

function requireAuthenticatedUser(req, res, next) {
    if (req.cookies.gtoken) {
        gitkitClient.verifyGitkitToken(req.cookies.gtoken, (err, id) => {
            if (!err) {
                User.findOneAndUpdate(
                    {'privateIdentity.oauth': id.user_id},
                    {$set: {
                        'username': id.display_name,
                        'email': id.email
                    }},
                    {'new': true, upsert: true, runValidators: true}
                ).then(user => {
                    req.user = user;
                    next();
                }) 
                .catch(err => {
                    console.log(err);
                    throw(err);
                });
            }
            else {
                console.log('gtoken invalid, redirecting.');
                res.redirect('//'+req.get('host')+'/callback?mode=select');
            }            
        });
    }
    else {
        console.log('gtoken missing, redirecting.');
        res.redirect('//'+req.get('host')+'/callback?mode=select');    
    }
}

function renderLoginCBPage(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(new Buffer(fs.readFileSync('./static/gitkit-widget.html')).toString().replace('%%postBody%%', encodeURIComponent(req.body || '')));
}

// function handleMail(req, res) {
//     app.disable('etag');
//     gitkitClient.getOobResult(req.body, req.ip, req.cookies.gtoken, function(err, resp) {
//     if (err) {
//         console.log('Error: ' + JSON.stringify(err));
//     }
//     else {
//         var forgottenPwdEmail = JSON.parse(fs.readFileSync('./email_templates/lostPwd.json'));
//         forgottenPwdEmail.to = '';
//         //forgottenPwdEmail.html += '';
//         console.log();
//         nodemailerMailgun.sendMail();
//         console.log('Send email: ' + JSON.stringify(resp));
//     }
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/html');
//     res.end(resp.responseBody);
//     });
// }

var app = express();
app.disable('x-powered-by');
app.use(requireHTTPS);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/callback', renderLoginCBPage);
app.post('/callback', renderLoginCBPage);
//app.get('/sendmail', handleMail);

app.use(requireAuthenticatedUser);
app.use(express.static('static'));

app.get('/user', (req, res) => {
    res.send(req.user);
});

var apiRouter = express.Router();
apiRouter.get('/tasks', (req, res) => {
    req.user.populate({
        path: 'myTasks',
        options : { sort: {'done': -1} }
    }).execPopulate()
    .then(user => {
        return res.send(user.myTasks);
    }).catch(console.log.bind(console));
});

apiRouter.post('/task', (req, res) => {
    if (!req.body.title) { // title is mandatory
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }       
    var task = new Task(req.body); // mongoose will take care of filtering only the info that fits the schema
    return task.save().then(task => {
        req.user.myTasks.push(task._id);
        return req.user.save();
    }).then(user => res.send(httpStatus.CREATED, task))         
    .catch(err => {
        console.log(err);
        res.send(httpStatus.INTERNAL_SERVER_ERROR);
    });    
});
apiRouter.route('/task/:id')
// .get((req, res) => {
//     Task.findById(req.params.id).exec()
//     .then(task => {
//         res.send(task);
//     })
//     .catch(err => {
//         console.log(err);
//         res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
//     });
// })
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
    var posInMyTasks = req.user.myTasks.indexOf(req.params.id);
    var posInFridgeTasks = req.user.fridge.tasks.indexOf(req.params.id);
    if (posInMyTasks !== -1) {
        req.user.myTasks.splice(posInMyTasks, 1);
    }
    else if (posInFridgeTasks !== -1) {
        req.user.fridge.tasks.splice(posInFridgeTasks, 1);
        // TODO : handle deletion for other users !
    }
    else { // task not present in this users' private or fridge tasks; cancel request
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }
    req.user.save();
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

http.createServer(app).listen(8000);
https.createServer({
    key: fs.readFileSync('./server/private/key.pem'),
    cert: fs.readFileSync('./server/private/cert.pem')
}, app).listen(4430);