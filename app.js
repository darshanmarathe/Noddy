/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var Config = require('./modules/mod_config')
Config.GetEnv("Dev")();
var MongoStore = require('connect-mongo')(express);
var hbs = require('hbs').__express;

var passport = require('passport');
var passportConfig = require('./modules/mod_passport')

/*
Route dependencies
*/

var routes_index = require('./routes/index');
var routes_user = require('./routes/user');
var routes_members = require('./routes/members');
var routes_nodds = require('./routes/nodds');
/*
API dependencies
*/
var api_nodd = require('./api/nodd');
var api_module = require('./api/modules');
var api_tags = require('./api/tags');

var app = express();



// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');

//Changed the default view engine to handlebar
//app.set('view engine', 'jade');
app.set('view engine', 'html');
app.engine('html', hbs);
app.use(express.static(path.join(__dirname, '/public')));

app.use(express.cookieParser());
app.use(express.session({
    secret: 'keyboard cat',
    cookie: {
        maxAge: 600000
    },
    store: new MongoStore({
        url: process.env.DBPATH
    })
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use('/public', express.static(__dirname + '/public'));
// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

DefineRoughts(app, routes_index);
DefineRoughts(app, routes_user);
DefineRoughts(app, routes_members);
DefineRoughts(app, routes_nodds);

//defineing roughts for api
DefineRoughts(app, api_nodd);
DefineRoughts(app, api_module);
DefineRoughts(app, api_tags);




app.use(function(req, res, next) {
    res.status(404);

    // respond with html page
    if (req.accepts('html')) {
        if (req.isAuthenticated()) {
            res.render('404', {
                user: req.user[0],
                layout: 'userLayout',
                url: req.url
            })
        }
        else {
            res.render('404', {
                url: req.url
            })
        }
        return;
    }

    // respond with json
    if (req.accepts('json')) {
        res.send({
            error: 'Not found'
        });
        return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not found');
})

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

function DefineRoughts(app, routes) {
    routes.define(app, routes);
}