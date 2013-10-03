/*
 * GET users listing.
 */

var passport =  require('passport');
var _userRepo = require('./../Repos/userRepo');

exports.signup = function(req, res){
	if (req.isAuthenticated()) {
		res.render('users/signup', { title: 'Darn you are already logged in' , layout: "userLayout" });
		};
  res.render('users/signup', { title: 'Welcome to Noddy - your node js stop' , layout: "userLayout" });
};


exports.signupPost =function(req , res) {
	var user = req.body.user;
	_userRepo.insertUser(user);
	res.redirect('users/signin');
}

exports.signIn = function(req, res) {
 	res.render('users/signin', { title: 'Welcome to Noddy - your node js stop' , layout: "userLayout" });
}


exports.signInPost = function(req, res) {
 	res.send("Sign in process still to be created");	
}

exports.define =   function(app, routes) {
	app.get('/users/signup', routes.signup);
	app.post('/users/signup' , routes.signupPost)
	app.get('/users/signIn' , routes.signIn);
	
	app.post('/users/signin',
  	passport.authenticate('local', { successRedirect: '/members/mynodds',
                                   failureRedirect: '/' }));
}