const passport = require('passport');
const passportStrategy = require('passport-local').Strategy;
const users = require('./users.js');

const init = () => {

  passport.serializeUser( (user, done) => {
    done(null, JSON.stringify(user));
  });
  passport.deserializeUser( (userJson, done) => {
    done(null, JSON.parse(userJson) );
  });
  passport.use( new passportStrategy(
    { usernameField: 'username' },
    (username, password, done) => {
      const user  = users.getByName(username || '');
      if(!user){
        return done(null, false, { message: 'Name not found: ' + username });
      }else{
        return done(null, user);
      }
    }
  ) );

};

module.exports = {
  init: init,
};
