
var _tagRepo = require('./../Repos/tagRepo');
var _ = require('underscore');

exports.define = function(app , routes) {
    
    app.get('/api/tags/' , routes.Get_all_Tags);
     app.get('/api/tags/full' , routes.Get_all_Tags_full);
     app.get('/api/tag/:id' , routes.Get_Tag_ById);
     app.delete('/api/tag/:id' , routes.Delete_Tag_ById);
      app.post('/api/tags' , routes.Create_Tag);
      app.put('/api/tags' , routes.Update_Tag);
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
exports.Update_Tag = function (req, res) {
        _tagRepo.updateTag(req.body.tag, function (docs) {
        res.send(docs);
    })
}

exports.Create_Tag = function (req, res) {
    _tagRepo.insertTags(req.body.TagName, function (docs) {
        res.send(docs); 
    })
}

exports.Delete_Tag_ById = function (req, res) {
    _tagRepo.DeleteTagById(req.params.id, function (docs) {
        res.send("sucess");
    })
}

exports.Get_Tag_ById = function (req, res) {
    _tagRepo.getTagById(req.params.id, function (docs) {
        res.send(docs);
    })
}

exports.Get_all_Tags_full =function(req , res) {
    _tagRepo.getTags( function (docs) {
       
        res.send(docs);
    })
}
