
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');


/*
Route dependencies
*/

var routes_index = require('./routes/index');
var routes_user = require('./routes/user');
var routes_members = require('./routes/members');



var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');

//Changed the default view engine to handlebar
//app.set('view engine', 'jade');
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



DefineRoughts(app , routes_index);
DefineRoughts(app , routes_user);
DefineRoughts(app , routes_members);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

function DefineRoughts (app , routes) {
	routes.define(app , routes);
}