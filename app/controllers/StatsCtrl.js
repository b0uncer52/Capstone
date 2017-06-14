'use strict';

app.controller('StatsCtrl', function($scope, $location, GameFactory, AuthFactory) {

    GameFactory.getStats(AuthFactory.getUser())
    .then((data) => {
        $scope.stats = data.data;
        if($scope.stats === null) {
            $scope.message = "No stats yet...";
        }
    }, (error) => {
        $scope.message = "Error retrieving stats";
    });
});