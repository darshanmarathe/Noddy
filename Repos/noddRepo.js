var databaseUrl = "sa:ds@ds053497.mongolab.com:53497/noddydb"; // "username:password@example.com/mydb"

var collections = ["users", "nodds"]
var mongojs = require("mongojs");
var ObjectId = mongojs.ObjectId;
var db = require("mongojs").connect(databaseUrl, collections);
var _tagRepo = require("./../Repos/tagRepo");


exports.insertNodd = function(nodd) {
nodd.CreatedOn = new Date();
nodd.UpdatedOn = new Date();
if (nodd.Tags != undefined || nodd.Tags !== "") {
    nodd.Tags = nodd.Tags.split(',');
    for(Tag in nodd.Tags){
        _tagRepo.insertTags(Tag);
    }
}

if (nodd.Modules != undefined || nodd.Modules !== "") {
    nodd.Modules = nodd.Modules.split(',');
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
   }
    if (nodd.Modules != undefined || nodd.Modules !== "") {
    nodd.Modules = nodd.Modules.split(',');
   }
    delete nodd._id; 
     db.nodds.update( { _id: ObjectId(id) },{$set: nodd}, function (err) {
  
    onDone();
});
}