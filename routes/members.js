
var passport =  require('passport');
var _userRepo = require('./../Repos/userRepo');

exports.mynodds =function(req , res) {

	console.log(req.isAuthenticated());
	if (!req.isAuthenticated()) {res.redirect('/')};
	_userRepo.getusers(function(users) {
		res.render('members/mynodds', { title: 'Noddy haan' , model : users  , user : req.user , layout : 'userLayout'} );
	});
	
}


exports.index =function(req , res) {
	// body...
}


exports.logout = function(req , res) {
	req.logout();
    res.redirect('/');
}

exports.define =  function(app , routes) {
	app.get('/members/', routes.index);
	app.get('/members/index', routes.index);
	app.get('/members/myNodds', routes.mynodds);
	app.get('/members/logout' ,  routes.logout)
}