'use strict';

app.controller('StatsCtrl', function($scope, $location, GameFactory, AuthFactory) {

    GameFactory.getStats(AuthFactory.getUser())
    .then((profile) => {
        console.log(profile);
        $scope.stats = profile.data;
        if($scope.stats === null) {
            $scope.message = "No stats yet...";
        }
    }, (error) => {
        $scope.message = "Error retrieving stats";
    });

    $scope.editProfile = () => {
        GameFactory.editProfile($scope.stats);
    };
});