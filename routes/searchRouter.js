var express = require('express'),
	bodyparser = require('body-parser');
	
var Produces = require('../models/produce');

var searchRouter = express.Router();

searchRouter.use(bodyparser.json());

searchRouter.route('/:name')
.get(function(req,res,next){
	console.log('here');
	Produces.find({"name": req.params.name})
	.exec(function(err, produceList){
		if(err) {console.log("Error: "+err); return next(err)};
		console.log("Produces = "+produceList);
		res.json(produceList);
	})
});

module.exports = searchRouter;
