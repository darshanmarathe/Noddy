/**
 * Module dependencies.
 */

const express = require('express');
const http = require('http');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon')
const Config = require('./modules/mod_config')
const logger = require('morgan');
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const router = express.Router();
const errorHandler = require('errorhandler')
Config.GetEnv("DEV")();

const MongoStore = require('connect-mongo')(session);
const hbs = require('hbs').__express;
const passport = require('passport');
const passportConfig = require('./modules/mod_passport')

/*
Route dependencies
*/

const routes_index = require('./routes/index');
const routes_user = require('./routes/user');
const routes_members = require('./routes/members');
const routes_nodds = require('./routes/nodds');
/*
API routes dependencies
*/
const api_nodd = require('./api/nodd');
const api_module = require('./api/modules');
const api_tags = require('./api/tags');

const app = express();



// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');

//Changed the default view engine to handlebar
//app.set('view engine', 'jade');
app.set('view engine', 'html');
app.engine('html', hbs);
app.use(express.static(path.join(__dirname, '/public')));

app.use(cookieParser());

app.use(session({
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

app.use(logger('dev'));
app.use(bodyParser());
app.use(methodOverride());

app.use('/public', express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
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