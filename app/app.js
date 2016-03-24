'use strict';

(function() {
	var app = angular.module('watchlistApp', [ 
		'watchlistApp.controllers',
		'ngRoute']);

	app.config(function($routeProvider) {
		$routeProvider.when("/", {
			templateUrl : "watchlist.html",
			controller : "WatchlistController",
			controllerAs : "watchlistCtrl"
		})
	});

})();