
/*
 * GET home page.
 */

exports.index = function(req, res){
	if (req.isAuthenticated()) {
  res.render('index', { title: 'Welcome to Noddy - your node js stop' , layout : 'userLayout' });
	}else{
 res.render('index', { title: 'Welcome to Noddy - your node js stop' });
	}
};

exports.about = function(req, res){
  res.render('about', { title: 'About Node tricks' });
};


exports.define = function(app , routes) {
	app.get('/', routes.index);
	app.get('/index', routes.index);
	app.get('/about', routes.about);
}