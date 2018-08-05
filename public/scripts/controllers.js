'use strict';

angular.module('orkitchApp')

.controller('HeaderController', ['$scope', '$state', '$rootScope', 'ngDialog', 'producesFactory', 'AuthFactory', 'cartFactory', function($scope, $state, $rootScope, ngDialog, producesFactory, AuthFactory, cartFactory){
	$scope.loggedIn = false;
    $scope.username = '';
    $scope.cartCount = 0;
	$scope.cart = {};
	
	$scope.cart = cartFactory.loadCart();
	$scope.cartCount = $scope.cart.length;
		
    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    }
        
    $scope.openLogin = function () {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
    };
    
    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };
    
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();	
    });
        
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
    
	$scope.search = function(){
		$state.go('app.search');
	}
	
    $scope.stateis = function(curstate) {
       return $state.is(curstate);  
    };
	
	$rootScope.$on('cart:count', function () {
		$scope.cartCount = cartFactory.count;
	});
	
	$scope.DropdownCtrl = function() {
	  $scope.items = [
		'The first choice!',
		'And another choice for you.',
		'but wait! A third!'
	  ];

	  $scope.status = {
		isopen: false
	  };

	  $scope.toggled = function(open) {
		console.log('Dropdown is now: ', open);
	  };

	  $scope.toggleDropdown = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.status.isopen = !$scope.status.isopen;
	  };
	}
}])

.controller('IndexController', ['$scope', 'producesFactory', '$state', function($scope, producesFactory, $state){
	$scope.changeState = function(){
		$state.go('app.list');
	}
	
	$scope.latestProduce = producesFactory.latestProduce().query()
							.$promise.then(	
								function(response){									
									$scope.latestProduce = response;
								},
								function(response){
									$scope.message = "Error: " + response.status + " " + response.statusText;
								}
							);

	$scope.selectProduce = function(produceId)
	{
		$state.go('app.item', {id:produceId});
	}
}])

.controller('ListingController', ['$scope', 'producesFactory', '$state', function($scope, producesFactory, $state){
	$scope.selectItem = function(produce){
		$state.go('app.item', {id:produce._id});
	}
	
	$scope.produces = producesFactory.getProduces().query()
							.$promise.then(	
								function(response){
									$scope.produces = response;
								},
								function(response){
									$scope.message = "Error: " + response.status + " " + response.statusText;
								}
							);							
}])

.controller('SearchProduceController', ['$scope', 'producesFactory', function($scope, producesFactory){
	
	$scope.produces = producesFactory.searchProduce().query({name: $scope.searchText})
							.$promise.then(	
								function(response){
									$scope.produces = response;
								},
								function(response){
									$scope.message = "Error: " + response.status + " " + response.statusText;
								}
							);							
}])

.controller('ProduceController', ['$scope', 'ngDialog', '$stateParams', 'producesFactory', 'reviewFactory', 'AuthFactory', 'cartFactory', function($scope, ngDialog, $stateParams, producesFactory, reviewFactory, AuthFactory, cartFactory){
	$scope.proceedToChkOut = false;
	$scope.message = "";
	var cart = new Array();
	cart = cartFactory.loadCart();
	var reviews = new Array();
	$scope.disableBuyer = false;
	
	$scope.produce = producesFactory.getProduceByID().query({id: $stateParams.id})
					.$promise.then(
						function(response){
							$scope.produce = response[0];
							
							if(AuthFactory.isAuthenticated() && AuthFactory.getUsername() == $scope.produce.user.username)
							{
								$scope.disableBuyer = true;
							}
							
							$scope.message = "";
							
							$scope.reviews = reviewFactory.getReviews().query({produceId: $scope.produce._id})
								.$promise.then(
									function(reviewResponse){
										
										$scope.reviews = reviewResponse;
									},
									function(reviewResponse){
										
										$scope.message = "Error: " + reviewResponse.status + " " + reviewResponse.statusText;
									}
							);
						},
						function(response){
							$scope.message = "Error: " + response.status + " " + response.statusText;
						}						
					);
					
	$scope.AddToCart = function(){	
		$scope.message = "";
		
		if(!AuthFactory.isAuthenticated())
		{
			ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
			return;
		}
		
		if($scope.buyQty == "kg" || $scope.buyQty == '0')
		{
			$scope.message = "Please enter quantity to buy";
			return;
		}
		
		if((parseInt($scope.buyQty) > parseInt($scope.produce.qtyAvailable)) || $scope.buyQty == null)
		{
			$scope.message = "Quantity cannot be more than available quantity";
			return;
		}
		
		$scope.produce.qtyAvailable -= $scope.buyQty;
		
		var cartObj = { 
						produceId: $scope.produce._id,
						produceName: $scope.produce.name,
						price: $scope.produce.price,
						quantity: $scope.buyQty,
						qtyAvailable : $scope.produce.qtyAvailable,
						orderDate: Date.now(),
						deliveryCharges: 50
					  }
		
		cart.push(cartObj);	
		
		$scope.cart = cart;
		$scope.message = "Added to cart";
		$scope.proceedToChkOut = true;
		cartFactory.setCount(cart.length);
		cartFactory.storeCart(cart);
	}
		
					
	$scope.submitReview = function () {
                
				if(!AuthFactory.isAuthenticated())
				{
					ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
					return;
				}
				
				//Step 2: This is how you record the date
				//"The date property of your JavaScript object holding the comment" = new Date().toISOString();
				$scope.myreview.date = new Date().toISOString();
				$scope.myreview.produceId = $scope.produce._id;

				
				// Step 3: Push your comment into the dish's comment array
				
				$scope.reviews.push($scope.myreview);
				console.log($scope.myreview);
				reviewFactory.postReview().update($scope.myreview);
				
				$scope.reviewForm.$setPristine();                
				$scope.myreview = {rating:"5", comment:"", date:""};
				
            }
	
}])

.controller('SellProduceController', ['$scope', 'producesFactory', 'fileUpload', 'AuthFactory', 'ngDialog', function($scope, producesFactory, fileUpload, AuthFactory, ngDialog){
		var produceJson = {};
		
		
		$scope.types = producesFactory.getTypes().query()
						.$promise.then(	
							function(response){
								$scope.types = response;
								$scope.type = $scope.types[0];
							},
							function(response){
								$scope.message = "Error: " + response.status + " " + response.statusText;
							}
						);
		
		$scope.submitProduce = function(){
			if(!AuthFactory.isAuthenticated())
			{
				ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
				return;
			}
			
			produceJson = {
				"type": $scope.type._id,
				"name": $scope.name, 
				"price": $scope.price, 
				"quantity": $scope.quantity,
				"qtyAvailable": $scope.quantity,
				"harvestDate": $scope.harvestDate,
				"description": $scope.description,
				"images": $scope.imageFile
			}
			
			var result = producesFactory.saveProduce().update(produceJson)
				.$promise.then(	
							function(response){								
								$scope.message = "Item added successfully";	
								$scope.type = $scope.types[0];
								$scope.name = $scope.price = $scope.quantity = $scope.harvestDate = $scope.description = '';
								$scope.produceForm.$setPristine();								
							},
							function(response){
								$scope.errMessage = "Error: " + response.status + " " + response.statusText;
							}
						);
			
			
			if(typeof($scope.imageFile) != 'undefined')
			{
				producesFactory.saveImage($scope.imageFile);
				$scope.imageFile = '';
				document.getElementById('image_file').value = null;
			}
		}
		
		$scope.sellHistory = producesFactory.getProducesForUser().query()
			.$promise.then(
				function(response){
					$scope.sellHistory = response;
					for(var i = 0; i < $scope.sellHistory.length; i++)
					{
						$scope.sellHistory[i].harvestDate = new Date($scope.sellHistory[i].harvestDate).toDateString();
						
					}
				},
				function(response){
					$scope.message = "Error: " + response.status + " " + response.statusText;
				}
			);
}])


.controller('LoginController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory',  function ($scope, ngDialog, $localStorage, AuthFactory, cartFactory) {

    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
    $scope.doLogin = function() {
        if($scope.rememberMe)
           $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData);

        ngDialog.close();
    };
            
    $scope.openRegister = function () {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterController" });
    };
    
}])

.controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {
    
    $scope.register={};
    $scope.loginData={};
    
    $scope.doRegister = function() {
        console.log('Doing registration', $scope.registration);

        AuthFactory.register($scope.registration);
        
        ngDialog.close();
    };
}])

.controller('UserProfileController', ['$scope', 'userFactory', 'producesFactory', function($scope, userFactory, producesFactory){
	
	$scope.userProfile = userFactory.getProfile().get()
	.$promise.then(
		function(response){
			$scope.userProfile = response;
		},
		function(response){
			$scope.message = "Error: " + response.status + " " + response.statusText;
		}
	);
	
	$scope.updateUserProfile = function(){
				var updateRes = userFactory.updateProfile().update({id:$scope.userProfile._id}, $scope.userProfile)
							.$promise.then(
								function(response){
									updateRes = response;	
									$scope.message = "Successfully updated";
								},
								function(response){
									$scope.errMessage = "Error: " + response.status + " " + response.statusText;
								}
							);
			}
	
	/*$scope.sellHistory = producesFactory.getProducesForUser().query()
	.$promise.then(
		function(response){
			$scope.sellHistory = response;
		},
		function(response){
			$scope.message = "Error: " + response.status + " " + response.statusText;
		}
	);
	
	$scope.buyHistory = orderFactory.getOrdersForUser().query()
	.$promise.then(
		function(response){
			$scope.buyHistory = response;
		},
		function(response){
			$scope.message = "Error: " + response.status + " " + response.statusText;
		}
	);*/
}])

.controller('CartController', ['$scope', '$state', 'cartFactory', function($scope, $state, cartFactory){
	$scope.cart = cartFactory.loadCart();
	$scope.total = 0;
	
	for(var i = 0; i< $scope.cart.length; i++)
	{
		$scope.total += $scope.cart[i].price * $scope.cart[i].quantity;
	}
	
	$scope.remove = function(produceId)
	{
		for(var i= 0; i< $scope.cart.length; i++)
		{
			if($scope.cart[i].produceId == produceId)
			{
				$scope.total -= $scope.cart[i].price * $scope.cart[i].quantity;	
				$scope.cart.splice(i, 1);		
									
				cartFactory.storeCart($scope.cart);
			}
		}
	}
	
	$scope.pay = function(){
		
		$state.go('app.payment');
	}
}])

.controller('PaymentController', ['$scope', '$state', 'cartFactory', 'producesFactory', function($scope, $state, cartFactory, producesFactory){
	$scope.showErrMsg = false;
	
	$scope.reDirect = function(){
		$state.go('app');		
	}
	
	//setInterval(reDirect, 10000);
	var cart = cartFactory.loadCart();	
	
	var result = producesFactory.orderProduce().update(null, cart)
				.$promise.then
				(
					function(response){
						cartFactory.removeCart();
					},
					function(response){
						$scope.showErrMsg = true
						$scope.errMessage = "Error: " + response.status + " " + response.statusText;
					}
				);
}])

.controller('OrdersController', ['$scope', 'producesFactory', function($scope, producesFactory){
		
		$scope.orders = producesFactory.getOrders().query()
						.$promise.then
						(
							function(response){
								$scope.orders = response;
								for(var i=0; i < $scope.orders.length; i++)
								{
									$scope.orders[i].orderDate = new Date($scope.orders[i].orderDate).toDateString();
									if($scope.orders[i].status == 0)
										$scope.orders[i].status = "Order placed";
									else if($scope.orders[i].status == 1)
										$scope.orders[i].status = "Dispatched";
									else if($scope.orders[i].status == 2)
										$scope.orders[i].status = "Delivered";
								}
							},
							function(response){
								console.log("Error: "+response.message);
							}
						);
		
}])
;
