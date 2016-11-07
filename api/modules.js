
var _moduleRepo = require('./../Repos/modulesRepo');
var _ = require('underscore');

exports.define = function (app, routes) {

    app.get('/api/modules/', routes.Get_all_modul);
    app.get('/api/modules/full', routes.Get_all_module_full);
    app.get('/api/module/:id', routes.Get_Module_By_Id);
    app.delete('/api/module/:id', routes.Delete_Module_By_Id);
    app.post('/api/modules', routes.Create_Module)
    app.put('/api/modules' , routes.Update_Module)
}

exports.Create_Module = function (req, res) {
    _moduleRepo.insertModules(req.body.ModuleName, function (docs) {
        res.send(docs); 
    })
}

exports.Update_Module = function (req, res) {
    console.log(req.body.module);
    _moduleRepo.updateModule(req.body.module, function (docs) {
        res.send(docs);
    })
}




exports.Get_all_modul = function (req, res) {
    _moduleRepo.getmodules(function (docs) {
        var arr = new Array();
        _.each(docs, function (d) {
            arr.push(d.ModuleName);
        })
        res.send(arr);

    })
}


exports.Get_all_module_full = function (req, res) {
    _moduleRepo.getmodules(function (docs) {
        res.send(docs);
    })
}



exports.Get_Module_By_Id = function (req, res) {
    _moduleRepo.getModuleById(req.params.id, function (docs) {
        res.send(docs);
    })
}


exports.Delete_Module_By_Id = function (req, res) {
    _moduleRepo.DeleteModule(req.params.id, function (docs) {
        res.send("Success");
    })
}

