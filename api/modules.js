
var _moduleRepo = require('./../Repos/modulesRepo');
var _ = require('underscore');

exports.define = function(app , routes) {
    
    app.get('/api/modules/' , routes.Get_all_modul);
     app.get('/api/modules' , routes.Get_all_modul);
}


exports.Get_all_modul =function(req , res) {
    _moduleRepo.getmodules( function (docs) {
         var arr = new Array();
        _.each(docs , function (d) {
            arr.push(d.ModuleName);
        })
        res.send(arr);

    })
}

