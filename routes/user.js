/*
 * GET users listing.
 */

var passport =  require('passport');
var _userRepo = require('./../Repos/userRepo');

exports.signup = function(req, res){
	if (req.isAuthenticated()) {
		res.render('users/signup', { title: 'You are already logged in' , layout: "userLayout" , islooged : req.isAuthenticated()});
		};
  res.render('users/signup', { title: 'Welcome to Noddy - your node js stop' });
};


exports.signupPost =function(req , res) {
	
	var user = req.body.user;
	delete user.ConfPassword;
	_userRepo.insertUser(user);
	res.redirect('users/login');
}


exports.login = function(req, res) {
 	res.render('users/login', { title: 'Welcome to Noddy - your node js stop'  });
}


exports.signIn = function(req, res) {
 	res.render('users/signin', { title: 'Welcome to Noddy - your node js stop' , layout: "userLayout" });
}




exports.define =   function(app, routes) {
	app.get('/users/signup', routes.signup);
	app.post('/users/signup' , routes.signupPost)
	app.get('/users/signIn' , routes.signIn);
	app.get('/users/login' , routes.login);
	app.post('/users/signin',
  	passport.authenticate('local', { successRedirect: '/members/index',
                                   failureRedirect: '/users/login' }));
}