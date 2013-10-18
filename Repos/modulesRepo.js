var databaseUrl = "sa:ds@ds053497.mongolab.com:53497/noddydb"; // "username:password@example.com/mydb"

var collections = ["modules"]
var mongojs = require("mongojs");
var ObjectId = mongojs.ObjectId;
var db = require("mongojs").connect(databaseUrl, collections);


exports.insertModules = function(module) {
    Private_getModule(module , function (_module) {
        if (_module == null || _module == undefined)
        {
        	db.modules.save(module, function(err) {
          		if (err) {
          			console.log(err);
          			return;
          		};
          		console.log("module Saved");
          	});
        }
    } );   
}



//TODO :: Need to implement the user id 
  exports.getmodules = function(onDone) {
  	return db.modules.find({}, function(err , docs) {
      onDone(docs);
     });
  }


  exports.getModule = function(name  , onDone) {
    return db.modules.find({ModuleName : name}, function(err , docs) {
          onDone(docs[0]);
          
     });
  }
  
  function Private_getModule(module  , onDone) {
    return db.modules.find({ModuleName : module.ModuleName}, function(err , docs) {
          onDone(docs[0]);
     });
  }
  

  exports.DeleteModule = function(id , onDone) {
  
     db.modules.remove({ModuleName : name}, true ,function (err) {
        onDone();
    });
  }
