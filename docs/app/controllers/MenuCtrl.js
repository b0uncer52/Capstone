'use strict';

app.controller('MenuCtrl', function($scope, $location, AuthFactory, $window, GameFactory) {

    $scope.queueUp = () => {
        GameFactory.joinQueue(AuthFactory.getUser())// read db.queue - if(data) { createGame(), delete db.queue} else {write db.queue}
        .then( data => {
            $location.url("/queue");
        });
    };

    $scope.logOut = () => {
        AuthFactory.logoutUser()
        .then( data => {
            console.log("logged out");
        }, error => {
            console.log("error occured on logout");
        });
    };

});