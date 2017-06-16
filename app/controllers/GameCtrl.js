'use strict';

app.controller('GameCtrl', function($scope, $location, $interval, $routeParams, $firebaseArray, GameFactory, AuthFactory, CardFactory) {

    var uid = AuthFactory.getUser();
    let deckSize = 15;
    $scope.uid = uid;
   
    $scope.yourTurn = false;
    $scope.selected = false;
    $scope.yourHand = [];
    $scope.selectedCard = null;
   

    let addToHand = (card) => {
        $scope.yourHand.push(card.data);
        console.log($scope.yourHand, "yourHand");
    };

    let drawCards = (card) => {
        CardFactory.getCard(card)
        .then( addToHand );
    };

    $scope.highlightCard = (card) => {
        $scope.selected = false;
        $scope.selectedCard = card;
    };

    $scope.selectCard = (card) => {
        $scope.selected = true;
        $scope.selectedCard = card;
    };

    let gameState = (data) => {
        if(data.whoseTurn == uid) {
            $scope.yourTurn = true;
        } else { $scope.yourTurn = false;}
        $scope.yourHand = [];
        for(let d in data.hands[uid]) {
            drawCards(data.hands[uid][d]);
        }
        console.log($scope.yourHand);
    };

    $scope.playCard = (card) => {
        console.log(card);
        $scope.selectedCard = null;
        $scope.selected = false;
    };

    GameFactory.getGame($routeParams.gameId)
    .then( response => {
        $scope.game = response.data;
        for(let people in $scope.game.score) {
            if(people !== uid) { $scope.opp = people;}
        }
        gameState($scope.game);
        console.log($scope.game);
    });
    
    let clockTick = () => {
        console.log("hi");
    };

    let yourTurn = false;
    
        // $interval(clockTick, 1000);

    let route = $routeParams.gameId;

    $firebaseArray(firebase.database().ref(`games/`)).$loaded().then(() => {  //looks for new game to be created once queue fills
		firebase.database().ref(`games`).on('child_changed', (x) => {
	 		$scope.game = x.val();
            gameState($scope.game);
            console.log($scope.game);
		});
	});
});

