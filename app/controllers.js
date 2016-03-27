'use strict';

angular.module('watchlistApp.controllers', []).controller('WatchlistController',
		[ '$http', '$log', '$scope', function($http, $log, $scope) {
			$scope.results = [];

			$log.debug('WatchlistController loaded.');
			
			$http({
				method : 'GET',
				url : 'api/watchlist'
			}).then(function(response) {
				$scope.results = response.data;		
			}, function(response) {
				$log.error("Error occured! " + response);
			})
            

		} ]);