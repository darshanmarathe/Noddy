var passport =  require('passport')
	  , LocalStrategy = require('passport-local').Strategy
	  , _userRepo = require('./../Repos/userRepo');
var FacebookStrategy = require('passport-facebook').Strategy;

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

  passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : "1032374016884054",
        clientSecret    : "9f55d7c5674d973965e63f450fce98d2",
        callbackURL     : "http://localhost:3000/users/facebook/callback",
        scope :["email"]

    },

    // facebook will send back the token and profile
    function(token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            _userRepo.getuser(profile.emails[0].value, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser            = new {};

                    // set all of the facebook information in our user model
                    newUser.facebook.id    = profile.id; // set the users facebook id                   
                    newUser.facebook.token = token; // we will save the token that facebook provides to the user                    
                    newUser.FirstName  = profile.name.givenName ; // look at the passport user profile to see how names are returned
                    newUser.LastName = profile.name.familyName;
                    newUser.facebook.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                    // save our user to the database
                        _userRepo.insertUser(newUser);
                        return done(null, newUser);
                    
                }

            });
        });

    }));



passport.serializeUser(function(user, done) {
    

    done(null, user);
});

passport.deserializeUser(function(user, done) {


 done(false , user);});