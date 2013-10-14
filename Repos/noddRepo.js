var databaseUrl = "sa:ds@ds053497.mongolab.com:53497/noddydb"; // "username:password@example.com/mydb"

var collections = ["users", "nodds"]
var mongojs = require("mongojs");
var ObjectId = mongojs.ObjectId;
var db = require("mongojs").connect(databaseUrl, collections);


exports.insertNodd = function(nodd) {
nodd.CreatedOn = new Date();
nodd.UpdatedOn = new Date();
console.log(nodd);

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
    return db.nodds.find({_id: ObjectId(id)  }, function(err , docs) {
      
      onDone(docs[0]);
     });
  }
  

  exports.DeleteNodd = function(id , onDone) {
  	console.log(id);
     db.nodds.remove({ _id: ObjectId(id) }, true ,function (err) {
        onDone();
    });
  }

exports.updateNodd  = function(nodd , onDone) {
    nodd.UpdatedOn = new Date();
    console.log(nodd);
     db.nodds.update({ _id: ObjectId(nodd._id) },{$set :nodd}, function (err) {
  
    onDone();
});
}