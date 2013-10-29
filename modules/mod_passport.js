var passport =  require('passport')
	  , LocalStrategy = require('passport-local').Strategy
	  , _userRepo = require('./../Repos/userRepo');

passport.use(new LocalStrategy(
  function(username, password, done) {
  	_userRepo.getuser(username, function(user){
 
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
    

    done(null, user);
});

passport.deserializeUser(function(user, done) {


 done(false , user);});