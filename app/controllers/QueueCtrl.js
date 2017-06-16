'use strict';

app.controller('QueueCtrl', function($scope, $location, $window, GameFactory, AuthFactory, $firebaseArray, moment) {
    
    let now = (new Date()).valueOf(); //don't really need moment as of now
    console.log(now);

    GameFactory.getQueue()  //checks to see if queue has 2 people in it, makes game if so
    .then( response => {
        let data = response.data;
        if(data !== null && data !== undefined) {
            if(Object.keys(data).length > 1) {
                let players = [];
                for(let d in data) {
                    players.push(d);
                }
                GameFactory.createGame(players[0], players[1]);
            }
        }
    });

    $scope.onExit = function() {
        console.log("hiya");
        GameFactory.removeFromQueue(AuthFactory.getUser());
    };

    $window.onbeforeunload =  $scope.onExit;
    $window.onclose = $scope.onExit;
    
    $scope.$on('$locationChangeSuccess', (event, next, current) => {
        console.log(event, next, current);
        // if (current.match("\/yourCurrentRoute")) {
        //     var answer = true;
        //     if (!answer) {
        //         event.preventDefault();
        //     }else{
                GameFactory.removeFromQueue(AuthFactory.getUser());
            // }
        // }
    });

    $firebaseArray(GameFactory.fbGameDb).$loaded().then(() => {  //looks for new game to be created once queue fills
		GameFactory.fbGameDb.on('child_added', (x) => {
	 		let data = x.val();
            if(now < data.index) {
                console.log(data);
                $location.url(`/game/${data.index}`);
            }
		});
	});

});