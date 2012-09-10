/*******************************************************************************
*                                                                              *
*      __           __                                                         *
*     /\ \__       /\ \__                           __                         *
*     \ \ ,_\    __\ \ ,_\  _ __   ___     ___ ___ /\_\    ___     ___         *
*      \ \ \/  /'__`\ \ \/ /\`'__\/ __`\ /' __` __`\/\ \ /' _ `\  / __`\       *
*       \ \ \_/\  __/\ \ \_\ \ \//\ \L\ \/\ \/\ \/\ \ \ \/\ \/\ \/\ \L\ \      *
*        \ \__\ \____\\ \__\\ \_\\ \____/\ \_\ \_\ \_\ \_\ \_\ \_\ \____/      *
*         \/__/\/____/ \/__/ \/_/ \/___/  \/_/\/_/\/_/\/_/\/_/\/_/\/___/       *
*                                                                              *
*     Created by:                                                              *
*                                                                              *
*     Nate Goldman                                                             *
*     Sean Harvey                                                              *
*     Chan Park                                                                *
*                                                                              *
*******************************************************************************/

/*
 * dependencies
*******************************************************************************/

/* server */
var express = require('express')
  , routes  = require('./routes')
  , app     = express()

/* authentication */
  , crypto        = require('crypto')
  , passport      = require('passport')
  , LocalStrategy = require('passport-local').Strategy

/* connect middleware */
  , partials = require('express-partials')
  , assets   = require('connect-assets')
  , flash    = require('connect-flash')

/* database connections */
  , cradle  = require('cradle')
  , conn    = new cradle.Connection(process.env.COUCH_DB || '127.0.0.1:5984')
  , authDb  = conn.database('auth');

/*
 * server configuration
*******************************************************************************/

app
  .set('port', process.env.PORT || 3000)
  .set('views', __dirname + '/views')
  .set('view engine', 'ejs')
  .use(express.favicon())
  .use(express.bodyParser())
  .use(express.methodOverride())
  .use(express.cookieParser('roar'))
  .use(express.session({secret : 'secrets'}))
  .use(flash())
  .use(express.staticCache())
  .use(express.static(__dirname + '/public'))
  .use(partials())
  .use(assets())
  .use(passport.initialize())
  .use(passport.session())
  .configure('development', function(){
    app.use(express.logger('dev'))
      .use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  })
  .configure('production', function(){
    app.use(express.logger())
      .use(express.errorHandler());
  })
  .use(app.router);

/*
 * auth configuration
*******************************************************************************/

// Looks for user in the DB
function findByUsername(username, fn){
  // Look in the 'byUsername' view for the given username
  authDb.view('user/byUsername', {key: username}, function(err, res) {
    if(err || !res.length) return fn(null, null);
    fn(null, res[0].value);
  });
};

function checkUser(user, cb){
  authDb.view('user/byUsername', {key: user}, function(err, result) {
    if(result.length > 0){ cb(false); } else { cb(true); };
  });
};

// Password hash
function getHash(passwd, cb){
  crypto.pbkdf2(passwd, "deSalt", 2048, 40, cb);
};

// Simple check to see if user is loggedin, if not point them to /login
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.flash('error','You must be logged in to see that page');
  res.redirect('/login');
};

passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  findByUsername(username, function (err, user) {
    done(err, user);
  });
});

// Passport config
passport.use(new LocalStrategy(
  function(username, password, done){
    findByUsername(username, function(err, user){
      if(err){ return done(err); };
      // If the given username wasn't found notify user username doesn't exist
      if(!user){
        return done(null, false, {
          message: 'Username "' + username + '" doesn\'t exist'
        });
      };

      // If the give password doesn't match the username notify user their
      // password was incorrect
      getHash(password, function(err, key){
        if(err || key !== user.password) {
          return done(null, false, {
            message: 'Password didn\'t match'
          });
        }
        return done(null, user);
      });
    });
  }
));

/*
 * basic routes
*******************************************************************************/

app.get('/', function(req, res){
  if (req.isAuthenticated()) {
    res.render('dashboard', {
      path: req.url,
      user: req.user ? req.user.username : null,
      auth: req.isAuthenticated(),
      messages: null
    });
  } else {
    res.render('index', {
      path: req.url,
      user: req.user ? req.user.username : null,
      auth: req.isAuthenticated(),
      messages: null
    });
  }
});

/*
 * auth routes
*******************************************************************************/

app.get('/login', function(req, res){
  res.render('login', {
    path: req.url,
    user: req.user,
    auth: req.isAuthenticated(),
    messages: req.flash('error')
  });
});

// Login Biz
app.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  function(req, res) {
    res.redirect('/');
  }
);

app.get('/register', function(req, res){
  res.render('register', {
    path: req.url,
    auth: req.isAuthenticated(),
    user: req.user ? req.user.username : null,
    messages: req.flash('error')
  });
});

// Registration
app.post('/register', function(req, res){
  var user = req.body.username;
  var email = req.body.email;
  var pass = req.body.password;
  var errors = 0;

  if(!user){
    req.flash('error', 'Please enter a username');
    errors ++;
  }

  if(!email){
    req.flash('error', 'Please enter an email address');
    errors++;
  }

  if(!pass){
    req.flash('error', 'Please enter a password');
    errors++;
  }

  if(user) {
    checkUser(user, function(auth){
      if(auth === false){
        req.flash('error', 'Username "'+ user +'" already taken.\n');
        errors++;
      } else if(auth === true && !errors) {
        getHash(pass, function(err, hash){
          authDb.save({
            username: user,
            password: hash,
            email: email
          }, function(err, result) {
            if(err) throw err;
            res.redirect('/login');
          });
        });
      };
      if(errors > 0){ res.redirect('/register'); }
    });
  } else {
    res.redirect('/register');
  };
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

/*
 * game routes
*******************************************************************************/

app.get('/1p', ensureAuthenticated, function(req, res){
  res.render('1p', {
    name: 'Tetromino | 1P',
    path: req.url,
    user: req.user ? req.user.username : null,
    auth: req.isAuthenticated(),
    messages: null
  });
});

app.get('/2p', ensureAuthenticated, function(req, res){
  res.render('2p', {
    name: 'Tetromino | 2P',
    path: req.url,
    user: req.user ? req.user.username : null,
    auth: req.isAuthenticated(),
    messages: null
  });
});

/*
 * http & socket server initializers
*******************************************************************************/

/* listen up son */
var server = app.listen(app.get('port'), function(){
  var hello = [
    'Tetromino server',
    '\nport: ' + app.get('port'),
    '\nenv:  ' + app.settings.env
  ];
  console.log(hello[0], hello[1], hello[2]);
});

/* fake user */
var user = {
  name: 'Chuck'
}

/* game (socket) server */
var game = require('./game').listen(server, user);
