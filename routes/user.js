
/*
 * GET users listing.
 */

exports.signup = function(req, res){
  res.render('users/signup', { title: 'Welcome to Noddy - your node js stop' , layout: "userLayout" });
};


exports.signIn = function(req, res) {
 	res.render('users/signin', { title: 'Welcome to Noddy - your node js stop' , layout: "userLayout" });
}


exports.signInPost = function(req, res) {
 	res.send("Sign in process still to be created");	
}

exports.define =   function(app, routes) {
	app.get('/users/signup', routes.signup);
	app.get('/users/signIn' , routes.signIn);
	app.post('/users/signin' , routes.signInPost);
}