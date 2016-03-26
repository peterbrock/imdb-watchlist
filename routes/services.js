'use strict'
var assert = require('assert');
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');

var prepareResults = function(callback, filmMap) {
    
    //finally, we want to remove from the hashmap (that was for processing purposes) and just return a JSON array... which we'll sort by release date!
    var results = [];
    for (var j = 0; j < Object.keys(filmMap).length; j++) {

        var filmId = Object.keys(filmMap)[j];
        var film = filmMap[filmId];
        results.push(film);
    }

    //sort array
    function compareDates(a, b) {
        
        function compareTitles(a, b) {
            if (a.filmTitle < b.filmTitle) { 
                return -1;
            }
            if(a.filmTitle > b.filmTitle) {
                return 1;
            }
            return 0;
        }
        
        //check if releaseDate exists for a and b... this is horrible, probably a better way but I'm being lazy
        if (!a.hasOwnProperty("releaseDate") && !b.hasOwnProperty("releaseDate")) {
            return compareTitles(a,b);
        } else if (!a.hasOwnProperty("releaseDate")) {
            return 1;
        } else if (!b.hasOwnProperty("releaseDate")) {
            return -1;
        }
        
        //ok we've made it this far, they've both got titles!
        var dateResult = a.releaseDate.diff(b.releaseDate);
        
        //noo! they're the same! return an alpha comparison instead
        if (dateResult == 0) {
            return compareTitles(a,b);
        }
        
        return dateResult;
    }

    results.sort(compareDates);
    
    callback(results);
    
}

var processReleaseDates = function(callback, filmMap) {
    
    var releaseUrl = 'http://www.imdb.com/calendar/?region=gb&ref_=ttrel_rel_26';
    request(releaseUrl, function(error, response, html){

        if (!error) {

            var $ = cheerio.load(html);
            
            //for all the keys in the film map
            for (var i = 0; i < Object.keys(filmMap).length; i++) {
                
                var filmId = Object.keys(filmMap)[i];
                var film = filmMap[filmId];

                //look for the anchor tag with our film ID
                var attribute = 'a[href="/title/'+filmId+'/"]';
                if ($(attribute).length > 0) {
                    
                    //if theres more than 1, its likely an early release for a film festival - so take the last one. This is probably dangerous!
                    var releaseDate = $(attribute).last().parent().parent().prev().text();
                    var momentDate = moment(releaseDate, "DD-MMMM-YYYY");
                    
                    film.releaseDate = momentDate;
                }
            }
        }
        
        prepareResults(callback, filmMap);
    })  
}

var processWatchlists = function(callback, watchlists) {
    
    console.log('got the following results: ' + JSON.stringify(watchlists));
    
    var filmMap = {};
    //iterate through each watchlist
    for (var i = 0; i < watchlists.length; i++) {
        
        var watchListResult = watchlists[i];
        var name = watchListResult.name;
        var id = watchListResult.userId;
        
        //for each film in this user's watchlist
        for (var j = 0; j < watchListResult.results.length; j++) {
            
            //get the filmTitle and IMDB ID
            var film = watchListResult.results[j];
            var filmTitle = film.title;
            var filmId = film.id;
            
            //get to the map if it's not already in, with the user that selected it
            if (filmId in filmMap) {
                filmMap[filmId].users.push({"name":name, "id": id});
            } else {
                //note, we're keying on filmId but also adding it into the object - thats because we'll remove these from the hashmap later before sending
                filmMap[filmId] = {"filmTitle" : filmTitle, "filmId" : filmId, "users": [{"name": name, "id": id}]};
            }
        }
    }
    
    //can now iterate through filmMap getting the UK release date and appending to the results.
    processReleaseDates(callback, filmMap);
}

exports.watchlist = function(callback) {

    //userIds are hardcoded at the moment - could be saved in Mongo though?
    var userIds = [{"name": "Pete", "id": 'ur62921299'}, 
                   {"name": "Maxwell", "id": 'ur62921299'}];
    
    var numberOfWatchlists = userIds.length;
    var numberOfWatchlistsReturned = 0;
    var results = [];
    
    //for each user, retrieve their watchlist
    for (var i = 0; i < numberOfWatchlists; i++) {
        
        //we need to create a 'function scope' now so that our name and userId variables aren't overwritten. This is funky!
        (function (i) {
            
            var name = userIds[i].name;
            var userId = userIds[i].id;

            console.log('watchlist for name = ' + name + ' id = ' + userId);

            var watchlistUrl = 'http://www.imdb.com/user/' + userId + '/watchlist';
            request(watchlistUrl, function(error, response, html){

                numberOfWatchlistsReturned += 1;
                console.log('Watchlist ' + numberOfWatchlistsReturned + ' out of ' + numberOfWatchlists + ' returned');

                var watchlistResult = {"name": name, "userId" : userId, "results": []};

                if (!error) {

                    //process results
                    var $ = cheerio.load(html);
                    $('.lister-item-header').filter(function(){
                        var data = $(this);
                        var title = data.find('a').text();
                        var url = data.find('a').attr('href');
                        var id = url.substr(7, 9);

                        var element = {"title": title, "id":id};

                        watchlistResult.results.push(element);
                    })
                }

                results.push(watchlistResult);

                //we'll have multiple of these requests going, so only head to the callback when we're the last request
                if (numberOfWatchlistsReturned == numberOfWatchlists) {
                    processWatchlists(callback, results);
                }
            })
        })(i); //this line ends our anon function declaration then calls it with 'i'
    }
};