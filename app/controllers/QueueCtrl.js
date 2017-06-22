'use strict';

app.controller('QueueCtrl', function($scope, $interval, $location, $window, GameFactory, AuthFactory, $firebaseArray) {
    
    let now = (new Date()).valueOf(); 
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

    $scope.waiting = "Waiting for opponent";

    let j = 1;
    $scope.picture1 = j;
    $scope.picture2 = j;

    let fadeInPic = () => {
        $scope.picture1 = j;
        $('#frontimg').fadeIn(2000);
    };

    let rotateBackground = () => {
        $('#frontimg').fadeOut(0);
        $scope.picture2 = j;
        j++;
        if(j > 7) {j = 1;}
        let t = $interval(fadeInPic, 1000, 1);
    };

    let i = 0;
    let changeText = () => {
        if(i == 3) { 
            i = 0;
            $scope.waiting = "Waiting for opponent";
        } else {
            i++;
            $scope.waiting += ".";
        }
    };

    let textCycler = $interval(changeText, 1000);
    let slider = $interval(rotateBackground, 3000);

    $window.onbeforeunload =  $scope.onExit;
    $window.onclose = $scope.onExit;
    
    $scope.$on('$locationChangeSuccess', (event, next, current) => {
        GameFactory.removeFromQueue(AuthFactory.getUser());
    });

    $firebaseArray(GameFactory.fbGameDb).$loaded().then(() => {  //looks for new game to be created once queue fills
		GameFactory.fbGameDb.on('child_added', (x) => {
	 		let data = x.val();
            console.log(data);
            if(now < data.index && data[AuthFactory.getUser()]) {
                console.log(data);
                $location.url(`/game/${data.index}`);
            }
		});
	});

});