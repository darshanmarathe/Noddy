
var _noddRepo = require('./../Repos/noddRepo');
var _ = require('underscore');

exports.define = function(app , routes) {
    
    app.get('/api/nodds/Tags/:id' , routes.Search_By_Tag);
     app.get('/api/nodds/Modules/:id' , routes.Search_By_Module)
}


exports.Search_By_Tag =function(req , res) {
    _noddRepo.Get_Nodds_By_Tag(req.params.id , function (docs) {
        res.send(docs);
    })
}


exports.Search_By_Module = function (req , res) {
    _noddRepo.Get_Nodds_By_Module(req.params.id , function (docs) {
        res.send(docs);
    })
}