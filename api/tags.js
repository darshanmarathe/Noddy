
var _tagRepo = require('./../Repos/tagRepo');
var _ = require('underscore');

exports.define = function(app , routes) {
    
    app.get('/api/tags/' , routes.Get_all_Tags);
    
}


exports.Get_all_Tags =function(req , res) {
    _tagRepo.getTags( function (docs) {
        res.send(docs);
    })
}

