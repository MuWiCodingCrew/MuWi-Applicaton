﻿'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');
var flash = require('connect-flash');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var session = require('express-session');
var expressValidator = require('express-validator');

mongoose.connect('mongodb://mongo-muwi:27017/loginapp');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');
var media = require('./routes/media');

var global = require('./global.js');

var app = express();

// view engine setup
app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

//Passport init
app.use(passport.initialize());
app.use(passport.session());

//Express Validator
app.use(expressValidator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.')
		, root    = namespace.shift()
		, formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg   : msg,
			value : value
		};
	}
}));

//Connect Flash
app.use(flash());

//Global Vars
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/media', media);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', 3000);

var server = app.listen(app.get('port'), function () {
	global.loggedUser = '';
    console.log('Express server listening on port ' + server.address().port);
});
