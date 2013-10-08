var passport =  require('passport')
	  , LocalStrategy = require('passport-local').Strategy
	  , _userRepo = require('./../Repos/userRepo');

passport.use(new LocalStrategy(
  function(username, password, done) {
  	_userRepo.getuser(username, function(user){
      console.log(user[0]);
  		if (user.length == 0) {

			   return done(null, false, { message: 'Incorrect username or password.' });
  		}else{
      
        if (user[0].Password.toString() == password) {
    			
          return done(null, user);
        }else{
          return done(null, false, { message: 'Incorrect username or password.' });
        }
  		}
  			
  	});

   		
   	

   
  }
));


passport.serializeUser(function(user, done) {
    done(null, user[0]._id);
});

passport.deserializeUser(function(id, done) {
  _userRepo.getuserByID(id , function(user) {
   
    done(null, user[0]._id);
  })
   			
});