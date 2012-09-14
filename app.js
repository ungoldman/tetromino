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
}

function checkUser(user, cb){
  authDb.view('user/byUsername', {key: user}, function(err, result) {
    if(result.length > 0){ cb(false); } else { cb(true); };
  });
}

function addScore(user, score, cb){
  authDb.view('user/byUsername', {key: user}, function(err, result) {
    if(result.length > 0){ cb(result); } else { cb(null); };
  });
};

function getHighScores(cb){
  authDb.view('byHighScore/byHighScore', function(err, result) {
    var allHighScores = [];
    result.forEach(function(row){
      var user = {
        username : row.username,
        highscore: row.highscore
      };
      allHighScores.push(user);
    });
     cb(allHighScores);
  });
};

// Password hash
function getHash(passwd, cb){
  crypto.pbkdf2(passwd, "deSalt", 2048, 40, cb);
}

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
 * pre-verb actions
*******************************************************************************/

// loads some useful local variables
function loadAuthentication(req, res, next) {
  res.locals({
    name: 'Tetromino',
    currentPath: req.url,
    currentUser: req.user ? req.user.username : null,
    authenticated: req.isAuthenticated()
  })
  next();
}

// Simple check to see if user is loggedin, if not point them to /login
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();

  req.flash('error','You must be logged in to see that page');
  res.redirect('/');
}

/*
 * global logic
*******************************************************************************/

app.all('*', loadAuthentication);

/*
 * basic routes
*******************************************************************************/

app.get('/', function(req, res){
  res.render('index', {
    name: 'Tetromino',
    messages: req.flash('error')
  });
});

/*
 * auth routes
*******************************************************************************/

app.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/',
    failureFlash: true
  }),
  function(req, res) {
    res.redirect('/');
  }
);

app.post('/register', function(req, res){
  var user   = req.body.username
    , email  = req.body.email
    , pass   = req.body.password
    , errors = 0;

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

  if(!!user && !!email && !!pass) {
    checkUser(user, function(auth){
      if (auth === false) {
        req.flash('error', 'Username "'+ user +'" already taken.\n');
        errors++;
      } else if (auth === true && !errors) {
        getHash(pass, function(err, hash){
          authDb.save({
            username: user,
            password: hash,
            email: email,
            highscore : null
          },
          function(err, result) {
            if(err) throw err;
            req.flash('error', 'Registration successful! You still gotta login though :P');
            res.redirect('/');
          });
        });
      };
      if (errors > 0) {
        res.redirect('/');
      }
    });
  } else {
    res.redirect('/');
  }
});

app.post('/score', function(req, res){
  var username = req.user.username;
  var score = req.body.score;

  // Grab users data from db
  addScore(username, score, function(result){
    var highScore = result[0].value.highscore;
    var id = result[0].value._id;
    // Set our newHighScore check var to false initially
    var newHighScore = false;
    // Make sure a null value wasn't set in the db or has no value set
    if(highScore != null){
      // If the current index is less than the score from the most
      // recent game set that index equal to the new score and break
      if(parseInt(highScore) < parseInt(score)){
        authDb.merge(id, { highscore : score }, function(err, status) {
          if (!err) res.send('OK');
          else res.send('ERROR');
        });
      }
    // If our user has no high score record then we'll just save thier highscore
    } else {
        authDb.merge(id, { highscore : score }, function(err, status) {
          if (!err) res.send('OK');
          else res.send('ERROR');
        });
    };

  });
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

/*
 * game routes
*******************************************************************************/

app.get('/1p', function(req, res){
  res.render('canvas', {
    name: 'Tetromino | 1P',
    javascripts: ['client']
  });
});

app.get('/*p', ensureAuthenticated, function(req, res){
  res.render('canvas', {
    name: 'Tetromino | *P',
    javascripts: ['client']
  });
});

app.get('/scores', function(req, res){
  getHighScores(function(allHighScores){
    res.render('scores', {
      scores: allHighScores
    });
  });
});

/*
 * http & socket server initializers
*******************************************************************************/

/* listen up son */
var server = app.listen(app.get('port'), function(){
  var hello = [
    'Tetromino server',
    '\nport : ' + app.get('port'),
    '\nenv  : ' + app.settings.env,
    '\nlistening...'
  ];
  console.log(hello[0], hello[1], hello[2], hello[3]);
});

/* game (socket) server */
var game = require('./game').listen(server);
