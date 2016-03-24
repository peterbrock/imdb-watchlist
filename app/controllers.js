'use strict';

angular.module('watchlistApp.controllers', []).controller('WatchlistController',
		[ '$http', '$log', '$scope', function($http, $log, $scope) {
			$scope.locations = [];

			$log.debug('WatchlistController loaded.');
			
            /*
			$http({
				method : 'GET',
				url : 'api/deviceLocation'
			}).then(function(response) {
				$scope.locations = response.data;		
			}, function(response) {
				$log.error("Error occured! " + response);
			})
            */

		} ]);