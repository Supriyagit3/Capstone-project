var express = require('express'),
	bodyparser = require('body-parser'),
	multer = require('multer'),
	upload = multer({dest: 'uploads/'}).single('file'),
	Verify = require('./verify');

var Produces = require('../models/produce');
var Types = require('../models/type.js');

var produceRouter = express.Router();

produceRouter.use(bodyparser.json());

produceRouter.route('/')
.get(function(req,res,next){
	Produces.find({"qtyAvailable":{"$gt":0}}).sort({"harvestDate":-1})
	.exec(function(err, produce){
		if(err) return next(err);
		res.json(produce);
	});
})

.post(Verify.verifyOrdinaryUser, function(req,res,next){	

	req.body.user = req.decoded._doc._id;
	Produces.create(req.body, function(err, produce){
		console.log(err);
		if(err) return next(err);
		console.log('Produce created');
		var id = produce._id;
		
		/*res.writeHead(200, {
            'Content-Type': 'text/plain'
        });*/
        res.end('Produces created with id: ' + id);
	});
	
	res.end('Produces created');
});

produceRouter.route('/user')
.get(Verify.verifyOrdinaryUser, function(req,res,next){
	Produces.find({"user": req.decoded._doc._id}).sort({"harvestDate":-1})
	.exec(function(err, produce){
		if(err) return next(err);
		
		res.json(produce);
	})
});

produceRouter.route('/saveImage')
.post(Verify.verifyOrdinaryUser, function(req,res,next){
	upload(req,res,function(err){
            if(err){
				console.log(err);
                 res.json({error_code:1,err_desc:err});
                 return;
            }
			console.log(req.file);
            res.json({error_code:0,err_desc:null});
	});
});

produceRouter.route('/latest')
.get(function(req,res,next){
	
	Produces.find({"qtyAvailable":{"$gt":0}}).sort({"harvestDate":-1}).limit(3)
	.exec(function(err, produce){
		if(err) return next(err);
		
		res.json(produce);
	})
});

produceRouter.route('/type')
.get(function(req,res,next){
	Types.find({})
	.exec(function(err, types){
		if(err) return next(err);
		
		res.json(types);
	})
});

produceRouter.route('/:produceId')
.get(function(req,res,next){
	Produces.find({"_id": req.params.produceId})
	.populate('user')
	.exec(function(err,produce){
		if(err) return next(err);
		
		res.json(produce);
	})
});

produceRouter.route('/:produceId')
.put(Verify.verifyOrdinaryUser, function(req,res,next){
	Produces.findOneAndUpdate({"_id": req.params.produceId, "user": req.decoded._doc._id},{
		 $set: req.body
    }, {
        new: true
    }, function (err, produce) {
        if (err) next(err);
        res.json(produce);
	});
})

.delete(Verify.verifyOrdinaryUser, function(req,res,next){
	Produces.findOneAndRemove({"_id": req.params.produceId, "user": req.decoded._doc._id}, function (err, resp) {        
	 if (err) next(err);
        res.json(resp);
    });
});

produceRouter.route('/:produceId/updtQty')
.put(Verify.verifyOrdinaryUser, function(req,res,next){
	console.log(req.body.qtyAvailable);
	Produces.findOneAndUpdate({"_id": req.params.produceId}, {qtyAvailable: req.body.qtyAvailable}, {
        new: false
    }, function (err, produce) {
        if (err) next(err);
        res.json('Quantity available updated');
	});
});

module.exports = produceRouter;