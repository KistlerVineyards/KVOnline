"use strict";
var path = require('path');
var fs = require('fs');
var bodyParser = require('body-parser');
var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
var def = require('./artifacts/definitions');
var messages = require('./artifacts/messages');
var express = require('express');
var app = express();

app.set('messages', messages);
app.set('def', def);
app.set('config', config);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(express.static(path.join(__dirname, 'public')));

var router = require('./artifacts/router');
app.use(router);
router.init(app);

process.env.NODE_ENV = config.env;

//for cross domain
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, Accept, Content-Type, Authorization, Content-Length, X-Requested-With, Access-Control-Allow-Origin,x-access-token');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
};
app.use(allowCrossDomain);

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public','index1.html'));
    //res.render(path.join(__dirname, 'public/index1.html'));
});

var server = app.listen(process.env.PORT || config.port, function () {
    console.log(messages.messExpressServerRunning + config.port);
});

app.use(function (err, req, res, next) {
    if (err) {
        if (err.hasOwnProperty('body')) {
            var error = new def.NError(err.status, err.message, err.body);
            err = error;
        }
    }
    else {
        err = new def.NError(404, messages.errUrlNotFound, messages.messUrlNotFoundDetails);
    }
    next(err);
});
//development error handler
if (process.env.NODE_ENV === 'development') {
    app.use(function (err, req, res, next) {
        console.log(messages.errDevError);
        if (!res.finished) {
            res.status(err.status || 500);
            res.json({ error: err });
        }
    });
}
//production error handler
app.use(function (err, req, res, next) {
    console.log(messages.errProdError);
    //if (err.message) { delete err.message; }
    //if (err.details) { delete err.details; }
    if (!res.finished) {
        res.status(err.status || 500);
        res.json({ error: err });
    }
});
