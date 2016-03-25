'use strict'
var assert = require('assert');
var request = require('request');
var cheerio = require('cheerio');

var processReleaseDates = function(callback, filmMap) {
    
    var releaseUrl = 'http://www.imdb.com/calendar/?region=gb&ref_=ttrel_rel_26';
    request(releaseUrl, function(error, response, html){

        if (!error) {

            var $ = cheerio.load(html);
            
            for (var i = 0; i < Object.keys(filmMap).length; i++) {
                
                var filmId = Object.keys(filmMap)[i];
                var film = filmMap[filmId];

                var attribute = 'a[href="/title/'+filmId+'/"]';
                if ($(attribute).length > 0) {
                    
                    //if theres more than 1, its likely an early release for a film festival - so take the last one. This is probably dangerous!
                    film.releaseDate = $(attribute).last().parent().parent().prev().text();
                }
            }
        }

        var result = filmMap;
        callback(result);  
    })  
}

var processWatchlists = function(callback, watchlists) {
    
    console.log('got the following results: ' + JSON.stringify(watchlists));
    
    var filmMap = {};
    for (var i = 0; i < watchlists.length; i++) {
        
        var watchListResult = watchlists[i];
        var name = watchListResult.name;
        var id = watchListResult.userId;
        
        for (var j = 0; j < watchListResult.results.length; j++) {
            
            var film = watchListResult.results[j];
            var filmTitle = film.title;
            var filmId = film.id;
            
            if (filmId in filmMap) {
                filmMap[filmId].users.push({"name":name, "id": id});
            } else {
                filmMap[filmId] = {"filmTitle" : filmTitle, "users": [{"name": name, "id": id}]};
            }
        }
    }
    
    //can now iterate through filmMap getting the UK release date and appending to the results.
    processReleaseDates(callback, filmMap);
}

exports.watchlist = function(callback) {

    var userIds = [{"name": "Pete", "id": 'ur62921299'}, 
                   {"name": "Maxwell", "id": 'ur62921299'}];
    
    var numberOfWatchlists = userIds.length;
    var numberOfWatchlistsReturned = 0;
    var results = [];
    
    for (var i = 0; i < numberOfWatchlists; i++) {
        
        //we need to create a 'function scope' now so that our name and userId variables aren't overwritten. This is funky!
        (function (i) {
            var name = userIds[i].name;
            var userId = userIds[i].id;

            console.log('name = ' + name + ' id = ' + userId);

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

                if (numberOfWatchlistsReturned == numberOfWatchlists) {
                    //do callback
                    processWatchlists(callback, results);
                }
            })
        })(i); //this line ends our anon function declaration then calls it with 'i'
    }
};
    
    
    /*
    var url = 'http://www.imdb.com/user/ur62921299/watchlist';

    var json = [];
    
    request(url, function(error, response, html){

        if(!error){
            
            var $ = cheerio.load(html);
            
            $('.lister-item-header').filter(function(){

                var data = $(this);
                
                var title = data.find('a').text();
                var url = data.find('a').attr('href');
                var id = url.substr(7, 9);
                
                console.log(title + " " + id );
                
                var element = {"title": title, "id":id};
                json.push(element);
            })
            
            again(json);
        }
    })

    var result = {"pete" : "hello"};
 	callback(result);

};

*/





/*
var again = function(json) {
  
    for (var i = 0; i < json.length; i++) {
        
        var element = json[i];
        
        var release_url = 'http://www.imdb.com/title/' + element.id + '/releaseinfo?ref_=tt_dt_dt';
                request(release_url, function(error, response, html) {
                    
                    var $ = cheerio.load(html);
                    console.log(element.title + ' ' + element.id + ' ' + $("a:contains(UK)").parent().next().text());
                })
        
    }
}
*/

    /*
    //now make another request
                //var release_url = 'http://www.imdb.com/calendar/?region=gb&ref_=ttrel_rel_26';
                var release_url = 'http://www.imdb.com/title/' + id + '/releaseinfo?ref_=tt_dt_dt';
                request(url, function(error2, response2, html2) {
                    
                    var $ = cheerio.load(html2);
                    console.log($("a:contains(UK)").parent().next().text());
                })
                */