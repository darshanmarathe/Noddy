
var _tagRepo = require('./../Repos/tagRepo');
var _ = require('underscore');

exports.define = function(app , routes) {
    
    app.get('/api/tags/' , routes.Get_all_Tags);
     app.get('/api/tags' , routes.Get_all_Tags);
}


exports.Get_all_Tags =function(req , res) {
    _tagRepo.getTags( function (docs) {
        var arr = new Array();
        _.each(docs , function (d) {
            arr.push(d.TagName);
        })
        res.send(arr);
    })
}

