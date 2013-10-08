var Datastore = require('nedb')
  , db = new Datastore({ filename: 'db/noddy.nodds.db', autoload: true });


exports.insertNodd = function(nodd) {
console.log(nodd);
		db.insert(nodd, function(err) {
  		if (err) {
  			console.log(err);
  			return;
  		};
  		console.log("nodd Saved");
  	});
}


//TODO :: Need to implement the user id 
  exports.getNodds = function(id  , onDone) {
  	return db.find({ownedBy : id}, function(err , docs) {
      
      onDone(docs);
     });
  }


  exports.getNodd = function(id  , onDone) {
    return db.find({_id  : id }, function(err , docs) {
      
      onDone(docs[0]);
     });
  }
  

  exports.DeleteNodd = function(id , onDone) {
  	
     db.remove({ _id: id }, {}, function (err, numRemoved) {
        onDone();
    });
  }

exports.updateNodd  = function(nodd , onDone) {
  db.update({ _id: nodd._id }, nodd, {}, function (err, numReplaced) {
  
    onDone();
});
}