var express = require('express');
var userRouter = express.Router();
var User = require('../models/user');
var passport = require('passport');
var Verify = require('./verify');

/* GET users listing. */
userRouter.route('/')
.get(Verify.verifyOrdinaryUser, function(req, res, next) {
  User.findOne({"_id": req.decoded._doc._id},{})
  .exec(function (err, user) {
        if(err) return next(err);
		
		if(user)
		{
			res.json(user);
		}
  });
});

//Update details of user.
userRouter.route('/:id')
.put(Verify.verifyOrdinaryUser, function(req,res,next){
	
	User.findByIdAndUpdate(req.params.id, {
        $set: req.body
    }, 
	function (err, user) {
        if (err) throw err;
        res.json(user);
    });
});

//Insert new user.
userRouter.route('/register')
.post(function(req, res) {	
    User.register(new User({ username : req.body.username }),
      req.body.password, function(err, user) {
        if (err) {
            return res.status(500).json({err: err});
        }
		
		if(req.body.name)
		{
			user.name = req.body.name;
		}
		
		if(req.body.email)
		{
			user.email = req.body.email;
		}
		
		if(req.body.address)
		{
			user.address = req.body.address;
		}
		
		if(req.body.mobileNo)
		{
			user.mobileNo = req.body.mobileNo;
		}
		
		if(req.body.accountNo)
		{
			user.accountNo = req.body.accountNo;
		}
		
		if(req.body.profilePicture)
		{
			user.profilePicture = req.body.profilePicture;
		}
		
		if(req.body.OauthId)
		{
			user.OauthId = req.body.OauthId;
		}
		
		if(req.body.OauthToken)
		{
			user.OauthToken = req.body.OauthToken;
		}
		
		user.save(function(err,user) {
			passport.authenticate('local')(req, res, function () {
				return res.status(200).json({status: 'Registration Successful!'});
			});
		});
    });
});

//Login user using passport.
userRouter.route('/login')
.post(function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        err: info
      });
    }
    req.logIn(user, function(err) {
      if (err) {
		  console.log(err);
        return res.status(500).json({
          err: 'Could not log in user'
        });
      }
        
      var token = Verify.getToken(user);
	  res.status(200).json({
        status: 'Login successful!',
        success: true,
		token: token
      });
    });
  })(req,res,next);
});

//User logout
userRouter.route('/logout')
.get(function(req, res) {
    req.logout();
	res.status(200).json({
    status: 'Bye!'
  });
});



module.exports = userRouter;
