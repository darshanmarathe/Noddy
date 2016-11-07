
var collections = ["modules"]
var mongojs = require("mongojs");
var ObjectId = mongojs.ObjectId;
var db = require("mongojs").connect(process.env.DBPATH, collections);


exports.insertModules = function (module, onDone) {
    console.log("module =>" + module)
    Private_getModule(module, function (_module) {

        if (_module == null || _module == undefined) {
            db.modules.save({ModuleName : module}, function (err, docInserted) {
                if (err) {
                    console.log(err);
                    return;
                };
                onDone(docInserted);
            });
        }
    });
}


exports.updateModule = function (module, onDone) {
    console.log("module =>" + module)
    var id = module._id;
    delete module._id;
    db.modules.update({ _id: ObjectId(id) }, { $set: module }, function (err) {

        onDone();
    });
}



//TODO :: Need to implement the user id 
exports.getmodules = function (onDone) {
    return db.modules.find({}, function (err, docs) {
        onDone(docs);
    });
}


exports.getModule = function (name, onDone) {
    return db.modules.find({ ModuleName: name }, function (err, docs) {
        onDone(docs[0]);

    });
}


exports.getModuleById = function (_id, onDone) {
    return db.modules.find({ _id: ObjectId(_id) }, function (err, docs) {
        onDone(docs[0]);

    });
}

function Private_getModule(module, onDone) {
    return db.modules.find({ ModuleName: module.ModuleName }, function (err, docs) {
        onDone(docs[0]);
    });
}


exports.DeleteModule = function (id, onDone) {

    db.modules.remove({ _id: ObjectId(id) }, true, function (err) {
        onDone();
    });
}
