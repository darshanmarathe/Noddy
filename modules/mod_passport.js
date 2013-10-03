var passport =  require('passport')
	  , LocalStrategy = require('passport-local').Strategy
	  , _userRepo = require('./../Repos/userRepo');

passport.use(new LocalStrategy(
  function(username, password, done) {
  	_userRepo.getuser(username, function(user){
  		if (user == null) {

			return done(null, false, { message: 'Incorrect username or password.' });
  		}else{
  			return done(null, user);
  		}
  			
  	});

   		
   	

   
  }
));


passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(id, done) {
   _userRepo.getuserByID(id, function(user){
  		if (user != null) {
   			done(null, user);
   		}
   	});

});