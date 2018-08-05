'use strict';

/**
 *
 * Main module of the application.
 */
angular.module('orkitchApp', ['ui.router','ngResource','ngDialog'])
  .config(function ($stateProvider, $urlRouterProvider) {
	  $urlRouterProvider.otherwise('/');
    
      $stateProvider
        
        // HOME STATES AND NESTED VIEWS ========================================
        .state('app', {
            url: '/',
             views: {                    
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/main.html',
                        controller  : 'IndexController'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }
                }
        })
		
		// route for the listing page
		.state('app.list', {
			url:'/list',
			views: {
				'content@': {
					templateUrl : 'views/Listing.html',
					controller  : 'ListingController'                  
				}
			}
		})
		
		.state('app.search', {
			url:'views/Listing.html',
			views: {
				'content@': {
					templateUrl : 'views/Listing.html',
					controller  : 'SearchProduceController'                  
				}
			}
		})
		
		.state('app.item', {
			url:'list/item/:id',
			views: {
				'content@': {
					templateUrl : 'views/Item.html',
					controller  : 'ProduceController'                  
				}
			}
		})
		
		.state('app.cart', {
			url:'cart',
			views: {
				'content@': {
					templateUrl : 'views/cart.html',
					controller  : 'CartController'                  
				}
			}
		})
		
		.state('app.payment', {
			url:'payment',
			views: {
				'content@': {
					templateUrl : 'views/paymentGtway.html',
					controller  : 'PaymentController'                  
				}
			}
		})
		
		.state('app.sell', {
			url:'sell',
			views: {
				'content@': {
					templateUrl : 'views/SellProduce.html',
					controller  : 'SellProduceController'                  
				}
			}
		})
		
		.state('app.aboutus', {
			url:'aboutus',
			views: {
				'content@': {
					templateUrl : 'views/about.html',
					controller  : ''                  
				}
			}
		})
		
		.state('app.profile', {
			url:'profile',
			views: {
				'content@': {
					templateUrl : 'views/userProfile.html',
					controller  : 'UserProfileController'                  
				}
			}
		})
		
		.state('app.orders', {
			url:'orders',
			views: {
				'content@': {
					templateUrl : 'views/orders.html',
					controller  : 'OrdersController'                  
				}
			}
		})
		
		.state('app.sellerHistory', {
			url:'sellerHistory',
			views: {
				'content@': {
					templateUrl : 'views/sellerHistory.html',
					controller  : 'SellProduceController'                  
				}
			}
		})
  });
