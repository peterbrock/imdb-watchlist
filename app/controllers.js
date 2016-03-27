'use strict';

angular.module('watchlistApp.controllers', []).controller('WatchlistController',
		[ '$http', '$log', '$scope', function($http, $log, $scope) {
			$scope.results = [];

            $scope.hideNoRelease = true;
            
			$log.debug('WatchlistController loaded.');
			
            var lastHeight;
            var resizeBackground = function() {
                
                var height = window.innerHeight || $(window).height();
                var width = window.innerWidth || $(window).width();
                
                //this is because iOS fires this event on scrolling (!)
                if (height != lastHeight) {
                    lastHeight = height;
                    $('#bg-content').css({'height':height,'width':width}); 
                }
            }
            
            function getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            
            $(window).resize(function() {
                resizeBackground();
            });
            
			$http({
				method : 'GET',
				url : 'api/watchlist'
			}).then(function(response) {
				$scope.results = response.data;
                
                //generate random background image
                var int = getRandomInt(1, 6);
                
                $("#bg-content").css("background-image", "url(/images/bg" + int + ".jpg)");
                $("#bg-content").fadeTo(2000, 0.85);
                
                resizeBackground();
                
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