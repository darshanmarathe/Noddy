var databaseUrl = "sa:ds@ds053497.mongolab.com:53497/noddydb"; // "username:password@example.com/mydb"

var collections = ["users", "nodds"]
var mongojs = require("mongojs");
var ObjectId = mongojs.ObjectId;
var db = require("mongojs").connect(databaseUrl, collections);
var _tagRepo = require("./../Repos/tagRepo");
var _moduleRepo = require("./../Repos/modulesRepo");


exports.insertNodd = function(nodd) {
nodd.CreatedOn = new Date();
nodd.UpdatedOn = new Date();
if (nodd.Tags != undefined || nodd.Tags !== "") {
    nodd.Tags = nodd.Tags.split(',');
       
    for (var i = 0; i < (nodd.Tags.length); i++) {
            var _tag = new Object();
            _tag.TagName = nodd.Tags[i];
            _tagRepo.insertTags(_tag);
    }
}

if (nodd.Modules != undefined || nodd.Modules !== "") {
    nodd.Modules = nodd.Modules.split(',');
      for (var i = 0; i < (nodd.Modules.length); i++) {
            var _module = new Object();
            _module.ModuleName = nodd.Modules[i];
            _moduleRepo.insertModules(_module);
    }
}

		db.nodds.save(nodd, function(err) {
  		if (err) {
  			console.log(err);
  			return;
  		};
  		console.log("nodd Saved");
  	});
}


//TODO :: Need to implement the user id 
  exports.getNodds = function(id  , onDone) {
  	return db.nodds.find({ownedBy : id}, function(err , docs) {
      onDone(docs);
     });
  }


  exports.getNodd = function(id  , onDone) {
    return db.nodds.find({_id: ObjectId(id)}, function(err , docs) {
      if (docs[0] != undefined) {
          if(typeof docs[0].Tags == Array )
            docs[0].Tags = docs[0].Tags.toString.join();
      }
       if (docs[0] != undefined) {
          if(typeof docs[0].Modules == Array )
            docs[0].Modules = docs[0].Modules.toString.join();
      }
      onDone(docs[0]);
     });
  }
  

  exports.DeleteNodd = function(id , onDone) {
  
     db.nodds.remove({ _id: ObjectId(id) }, true ,function (err) {
        onDone();
    });
  }

exports.updateNodd  = function(nodd , onDone) {
    nodd.UpdatedOn = new Date();
    var id  = nodd._id;
   if (nodd.Tags != undefined || nodd.Tags !== "") {
    nodd.Tags = nodd.Tags.split(',');

for (var i = 0; i < (nodd.Tags.length); i++) {
    
        var _tag = new Object();
        _tag.TagName = nodd.Tags[i];
        _tagRepo.insertTags(_tag);
}
        

   }
    if (nodd.Modules != undefined || nodd.Modules !== "") {
    nodd.Modules = nodd.Modules.split(',');
        for (var i = 0; i < (nodd.Modules.length); i++) {
            var _module = new Object();
            _module.ModuleName = nodd.Modules[i];
            _moduleRepo.insertModules(_module);
    }   
    
   }
    delete nodd._id; 
     db.nodds.update( { _id: ObjectId(id) },{$set: nodd}, function (err) {
  
    onDone();
});
}



exports.Get_Nodds_By_Tag = function (tag , onDone){
 
    var regex = new RegExp(["^",tag,"$"].join(""),"i");
 db.nodds.find({Tags : regex } , function (err , docs) {
   
     onDone(docs)
 });
 }
 
 
 exports.Get_Nodds_By_Module = function (module , onDone){
 
    var regex = new RegExp(["^",module,"$"].join(""),"i");
 db.nodds.find({Modules : regex } , function (err , docs) {
   
     onDone(docs)
 });
 }