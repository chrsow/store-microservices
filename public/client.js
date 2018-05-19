(function(){
	var app = angular.module('store', ['products', 'cart', 'reviews', 'ngRoute']);

	// configure our routes
	app.config(function($routeProvider) {
      $routeProvider

      // route for the home page
      .when('/', {
          templateUrl  : 'products/store.html',
					controller   : 'productController',
					controllerAs : 'store'
      })

      // route for the about page
      .when('/cart', {
          templateUrl  : 'cart/cart.html',
          controller   : 'cartController',
					controllerAs : 'cartCtrl'
      })
  });

	app.run(function(cart) {
	  cart.load();
	});

	app.controller("HeaderController", function($http, $rootScope, $scope){
		var client = this;
		$rootScope.client = client;
		client.isAuth = localStorage.getItem('user') || false;
		$rootScope.cartCount = 0;
		$http.get(cartApi + '/api/cart/count').success(function(res){
			$rootScope.cartCount = res.count;
		});

		// Login & Register
		this.username = '';
		this.password = '';

		this.login = function() {
			$http.post(authApi + '/api/auth/login', {username: this.username, password: this.password}).success(function(res){
				if(res.success){
					// sessionStorage.user= angular.toJson({user: res.message});
					localStorage.setItem('user',res.message);
					client.isAuth = true;
				}
			});
		}

		this.register = function() {
			$http.post(authApi + '/api/auth/register', {username: this.username, password: this.password}).success(function(res){
				if(res.success){
					
				}
			});
		}
	});

	app.directive('storeHeader', function(){
		return {
			restrict: 'E',
			templateUrl: 'store-header.html',
			controller: 'HeaderController',
			controllerAs: 'headerCtrl'
		}
	});

})();
