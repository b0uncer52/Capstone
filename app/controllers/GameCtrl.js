'use strict';

app.controller('GameCtrl', function($scope, $location, $interval, $routeParams, $firebaseArray, GameFactory, AuthFactory, CardFactory) {

    var uid = AuthFactory.getUser();
    $scope.uid = uid;
   
    $scope.yourTurn = false;
    $scope.selected = false;
    $scope.yourHand = [];
    $scope.selectedCard = null;
   

    let addToHand = card => {
        $scope.yourHand.push(card.data);
    };

    let removeFromHand = card => {
        let index = $scope.game.hands[uid].indexOf(Number(card.i));
        $scope.game.hands[uid].splice(index, 1);
    };

    let drawCards = card => {
        CardFactory.getCard(card)
        .then( addToHand );
    };

    $scope.highlightCard = card => {
        $scope.selected = false;
        $scope.selectedCard = card;
    };

    $scope.myTurn = () => {
        $scope.yourTurn = true;  // destroy this later
    };

    $scope.selectCard = (card) => {
        $scope.selected = true;
        $scope.selectedCard = card;
    };

    let gameState = data => {
        if(data.whoseTurn == uid) {
            $scope.yourTurn = true;
        } else { $scope.yourTurn = false;}
        console.log("data", data);
        if(data.times[$scope.opp] <= 0 || data.times[uid] <= 0) {
            console.log("outta time");
        }
        if(data.playedCards && data.playedCards.length >= 20) {
            console.log("game!");
        }
        $scope.yourHand = [];
        for(let d in data.hands[uid]) {
            drawCards(data.hands[uid][d]);
        }
    };

    let runTheNumbers = () => {
        let x = $scope.game.x;
        let cards = $scope.game.playedCards;
        for(let i = 0; i < cards.length; i++) {
            console.log(x, "start");
            x %= cards[i].r;
            console.log(x, "remainder");
            x *= cards[i].m;
            console.log(x, "multiply");
            x = Math.round(x / cards[i].d);
            console.log(x, "divide");
            x += Number(cards[i].a);
            console.log(x, "add");
            x -= Number(cards[i].s);
            console.log(x, "sub");
            x %= CardFactory.max;
            if(x < 0) {x = 0;}
            if(x == $scope.game.opp) {
                $scope.score.opp += 1;
            } else if(x == $scope.game.uid) {
                $scope.score.uid += 1;
            }
        }
        if($scope.game.x == $scope.game.opp) {
            $scope.score.opp += 2;
        } else if($scope.game.x == $scope.game.uid) {
            $scope.score.uid += 2;
        }
        $scope.game.x = x;
    };

    $scope.playCard = (card) => {
        $scope.selectedCard = null;
        $scope.selected = false;
        if($scope.game.playedCards === undefined) {
            $scope.game.playedCards = [];
        }
        $scope.game.playedCards.push(card);
        runTheNumbers();
        // $scope.game.whoseTurn = $scope.opp;
        removeFromHand(card);
        let newCard = Math.floor(Math.random() * CardFactory.deckSize);
        $scope.game.hands[uid].push(newCard);
        drawCards(newCard);
        GameFactory.updateGame($scope.game);
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
   // $interval(clockTick, 1000);

    let route = $routeParams.gameId;

    $firebaseArray(firebase.database().ref(`games/${route}`)).$loaded().then(() => {  //looks for new game to be created once queue fills
		firebase.database().ref(`games`).on('child_changed', (x) => {
	 		$scope.game = x.val();
            gameState($scope.game);
            console.log($scope.game);
		});
	});
});

