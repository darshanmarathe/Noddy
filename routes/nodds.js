
var _noddRepo = require('./../Repos/noddRepo');

exports.define = function(app, roughts) {

    app.get('/nodds/search/:id', roughts.Search);
    app.get('/nodds/search/tags/:id' , roughts.SearchByTag)
    app.get('/nodds/search/modules/:id' , roughts.SearchByModule)
}


exports.Search = function(req, res) {
  _noddRepo.Get_Nodds_By_Text(req.params.id , function (docs) {
        

    if (req.isAuthenticated()) {
        res.render('nodds/search', {
            title: 'Search',
            searchString : req.params.id,
            model : docs,
            layout: 'userLayout'
        });
        
    }
    else {
        res.render('nodds/search', {
            title: 'Search',
            model : docs,
            searchString : req.params.id
        });
        console.log(req.params.id);
    }
    })
}


exports.SearchByTag = function(req  , res){
    _noddRepo.Get_Nodds_By_Tag(req.params.id , function (docs) {
         if (req.isAuthenticated()) {
        res.render('nodds/search', {
            title: 'Search',
            searchString : req.params.id,
            model : docs,
            layout: 'userLayout'
        });
        
    }
    else {
        res.render('nodds/search', {
            title: 'Search',
            model : docs,
            searchString : req.params.id
        });
        console.log(req.params.id);
    }
    })
 }


exports.SearchByModule = function (req , res) {
   _noddRepo.Get_Nodds_By_Module(req.params.id , function (docs) {
           if (req.isAuthenticated()) {
        res.render('nodds/search', {
            title: 'Search',
            searchString : req.params.id,
            model : docs,
            layout: 'userLayout'
        });
        
    }
    else {
        res.render('nodds/search', {
            title: 'Search',
            model : docs,
            searchString : req.params.id
        });
        console.log(req.params.id);
    }
    })

}

