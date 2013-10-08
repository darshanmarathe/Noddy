var Datastore = require('nedb')
  , db = new Datastore({ filename: 'db/noddy.db', autoload: true });


exports.insertNodd = function(nodd) {
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
  	return db.find({}, function(err , docs) {
      
      onDone(docs);
     });
  }
  

  exports.DeleteNodd = function(id , onDone) {
  	
     db.remove({ _id: id }, {}, function (err, numRemoved) {
        onDone();
    });
  }
