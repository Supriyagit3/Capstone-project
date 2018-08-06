'use strict';

angular.module('orkitchApp')

.controller('HeaderController', ['$scope', '$state', '$rootScope', 'ngDialog', 'producesFactory', 'AuthFactory', 'cartFactory', function($scope, $state, $rootScope, ngDialog, producesFactory, AuthFactory, cartFactory){
	$scope.loggedIn = false;
    $scope.username = '';
    $scope.cartCount = 0;
	$scope.cart = {};
	
	//Load cart for the user.
	$scope.cart = cartFactory.loadCart();
	$scope.cartCount = $scope.cart.length;
	
	//Check if user has logged in from the credentials stored in local storage.
    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    }
    
    
    $scope.openLogin = function () {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
    };
    
	//Logout user
    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };
    
	//On successfull login set loggedIn to true and get username
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();	
    });
        
	//On successfull registration set loggedIn to true and get username
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
    
    $scope.stateis = function(curstate) {
       return $state.is(curstate);  
    };
	
	//Get cart count from localstorage
	$rootScope.$on('cart:count', function () {
		$scope.cartCount = cartFactory.count;
	});	
}])

.controller('IndexController', ['$scope', 'producesFactory', '$state', function($scope, producesFactory, $state){
	$scope.changeState = function(){
		$state.go('app.list');
	}
	
	//Get the top 3 produces added recently.
	$scope.latestProduce = producesFactory.latestProduce().query()
							.$promise.then(	
								function(response){									
									$scope.latestProduce = response;
								},
								function(response){
									$scope.message = "Error: " + response.status + " " + response.statusText;
								}
							);
	
	//View the complete item details.
	$scope.selectProduce = function(produceId)
	{
		$state.go('app.item', {id:produceId});
	}
}])

.controller('ListingController', ['$scope', 'producesFactory', '$state', function($scope, producesFactory, $state){
	$scope.selectItem = function(produce){
		$state.go('app.item', {id:produce._id});
	}
	
	//Get all the produces that are available.
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
	cart = cartFactory.loadCart(); //Load the items into the cart array from localstorage.
	var reviews = new Array();
	$scope.disableBuyer = false;
	
	//Get the details of a produces when user selects from the list.
	$scope.produce = producesFactory.getProduceByID().query({id: $stateParams.id})
					.$promise.then(
						function(response){
							$scope.produce = response[0];
							
							//Seller cannot have option to buy.
							if(AuthFactory.isAuthenticated() && AuthFactory.getUsername() == $scope.produce.user.username)
							{
								$scope.disableBuyer = true;
							}
							
							$scope.message = "";
							
							//Get all the reviews for the produce.
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
	
		//Produce gets added to cart array.
	$scope.AddToCart = function(){	
		$scope.message = "";
		
		//Check if user is logged in.
		if(!AuthFactory.isAuthenticated())
		{
			ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
			return;
		}
		
		//Check is quantity is empty or zero
		if($scope.buyQty == "kg" || $scope.buyQty == '0')
		{
			$scope.message = "Please enter quantity to buy";
			return;
		}
		
		//Check if quantity is more than available quantity.
		if((parseInt($scope.buyQty) > parseInt($scope.produce.qtyAvailable)) || $scope.buyQty == null)
		{
			$scope.message = "Quantity cannot be more than available quantity";
			return;
		}
		
		//Update quantity available.
		$scope.produce.qtyAvailable -= $scope.buyQty;
		
		//Create cart object.
		var cartObj = { 
						produceId: $scope.produce._id,
						produceName: $scope.produce.name,
						price: $scope.produce.price,
						quantity: $scope.buyQty,
						qtyAvailable : $scope.produce.qtyAvailable,
						orderDate: Date.now(),
						deliveryCharges: 50
					  }
		//Push cart object into cart array.
		cart.push(cartObj);	
		
		$scope.cart = cart;
		$scope.message = "Added to cart";
		$scope.proceedToChkOut = true;
		cartFactory.setCount(cart.length);
		cartFactory.storeCart(cart); //Store cart in localstorage.
	}
		
	//Function called when user submits a review.		
	$scope.submitReview = function () {
                
				//Check if user has logged in.
				if(!AuthFactory.isAuthenticated())
				{
					ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
					return;
				}
				
				$scope.myreview.date = new Date().toISOString();
				$scope.myreview.produceId = $scope.produce._id;

				
				//Push review object into reviews array.				
				$scope.reviews.push($scope.myreview);
				//Add review into database.
				reviewFactory.postReview().update($scope.myreview);
				
				//Clear review form.
				$scope.reviewForm.$setPristine();                
				$scope.myreview = {rating:"5", comment:"", date:""};
				
            }
	
}])

.controller('SellProduceController', ['$scope', 'producesFactory', 'fileUpload', 'AuthFactory', 'ngDialog', function($scope, producesFactory, fileUpload, AuthFactory, ngDialog){
		var produceJson = {};
		
		//Get the types of produce from the database.
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
		
		//Add produce into the database.
		$scope.submitProduce = function(){
			
			//Check if user has logged in.
			if(!AuthFactory.isAuthenticated())
			{
				ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
				return;
			}
			
			//Create produce object.
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
			
			//Save produce into the database.
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
			
			
			//Store the produce image.
			if(typeof($scope.imageFile) != 'undefined')
			{
				producesFactory.saveImage($scope.imageFile);
				$scope.imageFile = '';
				document.getElementById('image_file').value = null;
			}
		}
		
		//Get all the produce put for sale by the user.
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

	//Get logged in user information from localstorage.
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
	//Logging in the user.
    $scope.doLogin = function() {
        if($scope.rememberMe)
           $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData);

        ngDialog.close();
    };
            
	//Open register modal.
    $scope.openRegister = function () {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterController" });
    };
    
}])

.controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {
    
    $scope.register={};
    $scope.loginData={};
    
	//Register user.
    $scope.doRegister = function() {
        console.log('Doing registration', $scope.registration);

        AuthFactory.register($scope.registration);
        
        ngDialog.close();
    };
}])

.controller('UserProfileController', ['$scope', 'userFactory', 'producesFactory', function($scope, userFactory, producesFactory){
	
	//Get user details from database.
	$scope.userProfile = userFactory.getProfile().get()
	.$promise.then(
		function(response){
			$scope.userProfile = response;
		},
		function(response){
			$scope.message = "Error: " + response.status + " " + response.statusText;
		}
	);
	
	//Update user details in the database.
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
}])

.controller('CartController', ['$scope', '$state', 'cartFactory', function($scope, $state, cartFactory){
	//Load cart from the localstorage.
	$scope.cart = cartFactory.loadCart();
	$scope.total = 0;
	
	//Count the total number of items in the cart.
	for(var i = 0; i< $scope.cart.length; i++)
	{
		$scope.total += $scope.cart[i].price * $scope.cart[i].quantity;
	}
	
	//Function removes item from the cart.
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
	
	//Go to payment gateway.
	$scope.pay = function(){
		
		$state.go('app.payment');
	}
}])

.controller('PaymentController', ['$scope', '$state', 'cartFactory', 'producesFactory', function($scope, $state, cartFactory, producesFactory){
	$scope.showErrMsg = false;
	
	$scope.reDirect = function(){
		$state.go('app');		
	}
	
	var cart = cartFactory.loadCart();	
	
	//Upon payment order get added in the database.
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
		
		//Get the orders placed by the user.
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
