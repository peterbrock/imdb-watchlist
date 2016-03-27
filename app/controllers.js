'use strict';

angular.module('watchlistApp.controllers', []).controller('WatchlistController',
		[ '$http', '$log', '$scope', function($http, $log, $scope) {
			$scope.results = [];

            $scope.hideNoRelease = true;
            
			$log.debug('WatchlistController loaded.');
			
			$http({
				method : 'GET',
				url : 'api/watchlist'
			}).then(function(response) {
				$scope.results = response.data;
			}, function(response) {
				$log.error("Error occured! " + response);
			})
            
            $scope.shouldHideFilm = function(film) {
                return (!film.releaseDate && $scope.hideNoRelease);
            }
            
            $scope.getFilmReleaseStyle = function(film) {
                if (film.releaseDate) {
                    return "watchlist-film-release";
                } else {
                    return "watchlist-film-norelease";
                }
            }
            
            $scope.getFilmRelease = function(film) {
                
                if (film.releaseDate) {
                    return moment(film.releaseDate).format("Do MMMM YYYY");
                } else {
                    return "Released or No Release Date";
                }
            }
            
            $scope.getUserCircleStyle = function(user) {
                
                var userName = user.name;
                var style;
                
                if (userName == "Pete") style = "pete-bg";
                if (userName == "Paul") style = "paul-bg";
                if (userName == "Mark") style = "danforth-bg";
                if (userName == "Fearn") style = "fearn-bg";
                
                return "user-circle watchlist-user-circle " + style;
            };
            
            $scope.getUserCircleName = function(user) {
                
                var userName = user.name;
                var character;
                
                if (userName == "Pete") character = "J";
                if (userName == "Paul") character = "P";
                if (userName == "Mark") character = "M";
                if (userName == "Fearn") character = "F";
                
                return character;
            }

		} ]);