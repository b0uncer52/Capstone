'use strict';

app.controller('GameCtrl', function($scope, $location, $interval) {

    $scope.yourTurn = false;

    let clockTick = () => {
        
    };

    let yourTurn = false;
    
    while(yourTurn) {
        $interval(clockTick(), 1000);
    }

    $scope.$watch(/*database-return value, function(newVal, oldVal) {} */);


});

