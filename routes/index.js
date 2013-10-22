/*
 * GET home page.
 */

var _userRepo = require("./../Repos/userRepo");

exports.index = function(req, res) {
    if (req.isAuthenticated()) {
        res.render('index', {
            title: 'Welcome to Noddy - your node js stop',
            user: req.user[0],
            layout: 'userLayout'
        });
    }
    else {
        res.render('index', {
            title: 'Welcome to Noddy - your node js stop'
        });
    }
};

exports.about = function(req, res) {
    res.render('about', {
        title: 'About Node tricks'
    });
};

exports.contact = function(req, res) {
    res.render('contact', {
        title: 'Contact us..'
    })
}


exports.api = function(req, res) {
    res.render('apidoc', {
        title: 'Noddy Api documantation'
    })

}


exports.Profile = function(req, res) {
    _userRepo.getuser(req.params.id, function(user) {
        console.log(user);
        if (req.isAuthenticated()) {
            res.render('profile', {
                title: 'Welcome to Noddy - your node js stop',
                user: req.user[0],
                model: user[0],
                layout: 'userLayout'
            });
        }
        else {
            res.render('profile', {
                title: 'Welcome to Noddy - your node js stop',
                model: user[0]
            });
        }
    });

}

exports.define = function(app, routes) {
    app.get('/', routes.index);
    app.get('/api', routes.api)
    app.get('/index', routes.index);
    app.get('/about', routes.about);
    app.get('/contact', routes.contact);
    app.get('/Profile/:id', routes.Profile)
}