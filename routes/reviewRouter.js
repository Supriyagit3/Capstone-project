var express = require('express'),
	bodyparser = require('body-parser'),
	Verify = require('./verify');
	
var Reviews = require('../models/review');

var reviewRouter = express.Router();

/*reviewRouter.route('/')
.post(Verify.verifyOrdinaryUser, function(req,res,next){
	console.log(req);
	req.body.userId = req.decoded._doc._id;
	Reviews.create(req.body,function(err, review){
		console.log(err);
		if(err) return next(err);
		
		console.log('Review created');
		res.json(review);
	});
});*/


reviewRouter.route('/')
.post(Verify.verifyOrdinaryUser, function(req,res,next){
	console.log(req.decoded._doc._id);
	req.body.user = req.decoded._doc._id;
	Reviews.create(req.body,function(err, review){
		console.log(err);
		if(err) return next(err);
		
		console.log('Review created');
		res.json(review);
	});
});

reviewRouter.route('/:produceId')
.get(function(req,res,next){
	Reviews.find({produceId: req.params.produceId})
	.populate('user')
	.exec(function(err, review){
		if(err) return next(err);
		
		res.json(review);
	});
});

module.exports = reviewRouter;