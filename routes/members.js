var passport = require('passport');
var _userRepo = require('./../Repos/userRepo');
var _noddRepo = require('./../Repos/noddRepo');
var _ = require('underscore');
exports.mynodds = function(req, res) {
 console.log(req.isAuthenticated());
    if (!req.isAuthenticated()) {
        res.redirect('/users/login');
        return;
    };
    _noddRepo.getNodds(req.user[0].Email, function(docs) {
        var count = 1;
        _.each(docs, function(item) {
            item.srno = count;
            count++;
        });
        res.render('members/mynodds', {
            title: 'Your nodds',
            model: docs,
            user: req.user[0],
            layout: 'userLayout'
        });
    })
}
exports.index = function(req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/users/login');
        return;
    };
    _noddRepo.getNodds(req.user[0].Email, function(docs) {
        var count = 1;
        _.each(docs, function(item) {
            item.srno = count;
            count++;
        });
        res.render('members/index', {
            title: 'Your nodds',
            model: docs,
            user: req.user[0],
            layout: 'userLayout'
        });
    })
}
exports.create = function(req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/users/login');
        return;
    };
    res.render('members/create', {
        title: 'Create your Nodd.',
        user: req.user[0],
        layout: 'userLayout'
    });
}
exports.createPost = function(req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/users/login');
        return;
    };
    var nodd = req.body.nodd;
    nodd.ownedBy = req.user[0].Email;
    nodd.updatedBy = req.user[0].Email;
    _noddRepo.insertNodd(nodd);
    res.redirect('members/index');
}
exports.logout = function(req, res) {
    req.logout();
    res.redirect('/');
}
exports.DeleteNodd = function(req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/users/login');
        return;
    };
    _noddRepo.DeleteNodd(req.params.id, function(_blog) {
        res.redirect('members/index');
    });
};
exports.EditNodd = function(req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/users/login');
        return;
    };
    _noddRepo.getNodd(req.params.id, function(Nodd) {
        res.render('members/edit', {
            title: 'Edit nodd',
            model: Nodd,
            user: req.user[0],
            layout: 'userLayout'
        });
    });
}
exports.UpdateNodd = function(req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/users/login');
        return;
    };
    var nodd = req.body.nodd;
    nodd.updatedBy = req.user[0].Email;
    _noddRepo.updateNodd(nodd, function() {
        res.redirect('members/index');
    });
}


exports.profile = function(req, res) {

    if (!req.isAuthenticated()) {
        res.redirect('/users/login');
        return;
    };

    res.render('members/profile', {
        title: 'Create your Nodd.',
        model: req.user[0],
        layout: 'userLayout'
    });
}

exports.define = function(app, routes) {
    app.get('/members/', routes.index);
    app.get('/members/index', routes.index);
    app.get('/members/create', routes.create);
    app.post('/members/create', routes.createPost);
    app.get('/memebers/DeleteNodd/:id', routes.DeleteNodd);
    app.get('/Memebers/DeleteNodd/:id', routes.DeleteNodd);
    app.get('/Memebers/Edit/:id', routes.EditNodd);
    app.post('/Memebers/Edit', routes.UpdateNodd);
    app.get('/members/mynodds', routes.mynodds);
    app.get('/members/logout', routes.logout)
    app.get('/members/profile', routes.profile);
}