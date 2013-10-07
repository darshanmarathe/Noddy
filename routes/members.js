
var passport =  require('passport');
var _userRepo = require('./../Repos/userRepo');

exports.mynodds =function(req , res) {

	
	if (!req.isAuthenticated()) {res.redirect('/')};
	_userRepo.getusers(function(users) {
		res.render('members/mynodds', { title: 'Noddy haan' , model : users  , user : req.user , layout : 'userLayout'} );
	});
	
}


exports.index =function(req , res) {
	if (!req.isAuthenticated()) {res.redirect('/')};
		res.render('members/index', { title: 'Your Dashboard.' ,  layout : 'userLayout'} );
	
}

exports.create = function(req , res) {
	
	if (!req.isAuthenticated()) {res.redirect('/')};
		res.render('members/create', { title: 'Create your Nodd.' ,  layout : 'userLayout'} );
	
	
}

exports.createPost = function(req , res) {
	// body...
}

exports.logout = function(req , res) {
	req.logout();
    res.redirect('/');
}

exports.define =  function(app , routes) {
	app.get('/members/', routes.index);
	
	app.get('/members/index', routes.index);

	app.get('/members/create', routes.create);
	app.post('/members/create', routes.createPost);
	
	
	app.get('/members/mynodds', routes.mynodds);
	
	app.get('/members/logout' ,  routes.logout)
}