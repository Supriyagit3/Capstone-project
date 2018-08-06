'use strict';

angular.module('orkitchApp')
		.constant("baseURL","/")		
		.factory('producesFactory', ['$resource', 'baseURL', '$http', function($resource, baseURL, $http){
			var produceFac = {};
			
			//Get the 3 produces that have the latest harvest dates
			produceFac.latestProduce = function(){
				return $resource(baseURL + "produces/latest", null);
			}
			
			//Save the produce into database.
			produceFac.saveProduce = function(){
				return $resource(baseURL+"produces/", null, {'update':{method:'POST'}});
			}
			
			//Save produce image on the server.
			produceFac.saveImage = function(file){
				var fd = new FormData();
				fd.append('file', file);
				$http.post(baseURL+"produces/saveImage", fd, {
					transformRequest: angular.identity,
					headers: {'Content-Type': undefined}
				})
				.then(
					function(response){
						console.log('Success');
					},
					function(err){
						console.log(err);
					}
					
				);
			}
			
			//Get produce details using id
			produceFac.getProduceByID = function(){
				return $resource(baseURL+"produces/:id", null);
			}
			
			//Get all produces in the database that are quantity available more than zero.
			produceFac.getProduces = function(){
				return $resource(baseURL+"produces/", null);
			}
			
			//Get all the produces put for sale by the user.
			produceFac.getProducesForUser = function(){
				return $resource(baseURL+"produces/user", null);
			}
			
			//Search for a particular produce.
			produceFac.searchProduce = function(){				
				return $resource(baseURL+"search",{name: '@name'},{query: {method: 'GET', isArray: true}});
			}
			
			//Update available quantity for the produce.
			produceFac.updateQuantity = function(){
				return $resource(baseURL+"produces/:produceId/updtQty", {id: '@produceId'}, {'update': {method: 'PUT'}});
			}
			
			//Get all the types for the produce.
			produceFac.getTypes = function(){
				return $resource(baseURL+"produces/type", null);
			}
			
			//Save order made by user.
			produceFac.orderProduce = function(){
				return $resource(baseURL+"orders/", null, {'update': {method: 'POST'}});
			}
			
			//Get all the orders made by user.
			produceFac.getOrders = function(){
				return $resource(baseURL+"orders/", null);
			}
			return produceFac;
		}])
		
		.factory('reviewFactory', ['$resource', 'baseURL', function($resource, baseURL){
			var reviewFac = {};
			
			//Get review for a produce.
			reviewFac.getReviews = function(){
				return $resource(baseURL+"reviews/:produceId", null);
			}
			
			//Save review in database
			reviewFac.postReview = function(){
				return $resource(baseURL+"reviews/", null, {'update': {method: 'POST'}});
			}
			
			return reviewFac;
		}])
		
		//Functions related to localstorage.
		.factory('$localStorage', ['$window', function ($window) {
			return {
				store: function (key, value) {
					$window.localStorage[key] = value;
				},
				get: function (key, defaultValue) {
					return $window.localStorage[key] || defaultValue;
				},
				remove: function (key) {
					$window.localStorage.removeItem(key);
				},
				storeObject: function (key, value) {
					$window.localStorage[key] = JSON.stringify(value);
				},
				getObject: function (key, defaultValue) {
					return JSON.parse($window.localStorage[key] || defaultValue);
				}
			}
		}])
		
		.factory('AuthFactory', ['$resource', '$http', '$rootScope', '$window', 'baseURL', 'ngDialog', '$localStorage', function($resource, $http, $rootScope, $window, baseURL, ngDialog, $localStorage){
    
			var authFac = {};
			var TOKEN_KEY = 'Token';
			var isAuthenticated = false;
			var username = '';
			var authToken = undefined;
			
			//Get user credentials from localstorage.
		  function loadUserCredentials() {
			var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
			if (credentials.username != undefined) {
			  useCredentials(credentials);
			}
		  }
		 
			//Store user credentials in localstorage.
		  function storeUserCredentials(credentials) {
			$localStorage.storeObject(TOKEN_KEY, credentials);
			useCredentials(credentials);
		  }
		 
		  function useCredentials(credentials) {
			isAuthenticated = true;
			username = credentials.username;
			authToken = credentials.token;
		 
			// Set the token as header for http requests!
			$http.defaults.headers.common['x-access-token'] = authToken;
		  }
		 
		 //On user logout reset and remove user credentials from localstorage
		  function destroyUserCredentials() {
			authToken = undefined;
			username = '';
			isAuthenticated = false;
			$http.defaults.headers.common['x-access-token'] = authToken;
			$localStorage.remove(TOKEN_KEY);
		  }
			 
			 //Store user credentials and generate token.
			authFac.login = function(loginData) {
				
				$resource(baseURL + "users/login")
				.save(loginData,
				   function(response) {
					  storeUserCredentials({username:loginData.username, token: response.token});
					  $rootScope.$broadcast('login:Successful');
				   },
				   function(response){
					  isAuthenticated = false;
					
					  var message = '\
						<div class="ngdialog-message">\
						<div><h3>Login Unsuccessful</h3></div>' +
						  '<div><p>' +  response.data.err.message + '</p><p>' +
							response.data.err.name + '</p></div>' +
						'<div class="ngdialog-buttons">\
							<button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>\
						</div>'
					
						ngDialog.openConfirm({ template: message, plain: 'true'});
				   }
				
				);

			};
			
			authFac.logout = function() {
				$resource(baseURL + "users/logout").get(function(response){
				});
				destroyUserCredentials();
			};
			
			//Create new user.
			authFac.register = function(registerData) {
				
				$resource(baseURL + "users/register")
				.save(registerData,
				   function(response) {
					  authFac.login({username:registerData.username, password:registerData.password});
					if (registerData.rememberMe) {
						$localStorage.storeObject('userinfo',
							{username:registerData.username, password:registerData.password});
					}
				   
					  $rootScope.$broadcast('registration:Successful');
				   },
				   function(response){
					
					  var message = '\
						<div class="ngdialog-message">\
						<div><h3>Registration Unsuccessful</h3></div>' +
						  '<div><p>' +  response.data.err.message + 
						  '</p><p>' + response.data.err.name + '</p></div>';

						ngDialog.openConfirm({ template: message, plain: 'true'});

				   }
				
				);
			};
			
			authFac.isAuthenticated = function() {
				return isAuthenticated;
			};
			
			authFac.getUsername = function() {
				return username;  
			};

			loadUserCredentials();
			
			return authFac;
			
		}])

		.factory('cartFactory', ['$rootScope', '$localStorage', function($rootScope, $localStorage){
			var cartFac = {};
			var TOKEN_KEY = "cart";
			
			//Set cart item count and braodcast it to all modules.
			cartFac.setCount = function(count){
				cartFac.count = count;
				$rootScope.$broadcast('cart:count');
			}
			
			//store cart object in localstorage
			cartFac.storeCart = function(cartObj){
				$localStorage.storeObject(TOKEN_KEY, cartObj);
				cartFac.count = cartObj.length;
				$rootScope.$broadcast('cart:count');
			}
			
			//Get cart object from local storage.
			cartFac.loadCart = function(){
				return $localStorage.getObject(TOKEN_KEY,'[]');
			}
			
			//Remove cart object from localstorage.
			cartFac.removeCart = function(){
				$localStorage.remove(TOKEN_KEY);
				cartFac.count = 0;
				$rootScope.$broadcast('cart:count');
			}
			return cartFac;
		}])
		
		.factory('userFactory', ['$resource', 'baseURL', function($resource, baseURL){
			var userProfile = {};
			
			//Get user details from database.
			userProfile.getProfile = function(){
				var user = $resource(baseURL+"users/", null);
				console.log(user);
				return user;
			}
			
			//Update user details in the database.
			userProfile.updateProfile = function(){
				return $resource(baseURL + "users/:id", {id:'@id'}, {
				'update': {
					method: 'PUT'
				}
			});
			}
			return userProfile;
		}])
		
		//Upload image file into the server.
		.service('fileUpload', ['$http', function ($http) {
            this.uploadFileToUrl = function(file, uploadUrl){
               var fd = new FormData();
               fd.append('file', file);
			   
               $http.post(uploadUrl, fd, {
                  transformRequest: angular.identity,
                  headers: {'Content-Type': undefined}
               })
            
               .success(function(response){
				   console.log(response);
				   deffered.resolve(response);					
               })
            
               .error(function(msg){
				   console.log(msg);
               });
            }
		}])
;