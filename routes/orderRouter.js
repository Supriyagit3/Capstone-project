var express = require('express'),
	bodyparser = require('body-parser'),
	Verify = require('./verify');

var Orders = require('../models/order');
var Produces = require('../models/produce');

var orderRouter = express.Router();

orderRouter.route('/')
.post(Verify.verifyOrdinaryUser, function(req,res,next){
	var orders = req.body;
	
	for(var i = 0; i < orders.length; i++)
	{
		orders[i].userId = req.decoded._doc._id;
		orders[i].status = 0;
		console.log(orders[i]);
		Orders.create(orders[i],function(err, order){
			if(err) return next(err);				
		});
		Produces.findOneAndUpdate({"_id": orders[i].produceId}, {qtyAvailable: orders[i].qtyAvailable}, {
			new: false
		}, function (err, produce) {
			if (err) next(err);
		});
	}
	
	res.send('Order successfully added');
	
})

.get(Verify.verifyOrdinaryUser, function(req,res,next){
	Orders.find({"userId": req.decoded._doc._id}).sort("-orderDate")
	.populate('produceId')
	.exec(function(err, order){
		
		if(err) return next(err);
		
		res.json(order);
	});	
})
;

module.exports = orderRouter;