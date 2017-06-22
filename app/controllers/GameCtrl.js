'use strict';

app.controller('GameCtrl', function($scope, $location, $interval, $routeParams, $firebaseArray, GameFactory, AuthFactory, CardFactory) {

    var uid = AuthFactory.getUser();
    $scope.uid = uid;
   
    $scope.yourTurn = false;
    $scope.selected = false;
    $scope.yourHand = [];
    $scope.selectedCard = null;
    let timer;
   

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

    $scope.selectCard = (card) => {
        $scope.selected = true;
        $scope.selectedCard = card;
    };

    let timeResult = times => {
        if(times[$scope.opp] < 1 ) {
            $scope.game.winner = uid;
            GameFactory.updateGame($scope.game);
        }
    };

    let scoreResult = score => {
        if(score[uid] > score[$scope.opp]) {
            $scope.game.winner = uid;
            GameFactory.updateGame($scope.game);
        }
    };

    let clockTick = () => {
        let id = $scope.game.whoseTurn;
        $scope.game.times[id]--;
        if($scope.game.times[id] <= 0) {
            GameFactory.updateGame($scope.game);
        }
    };   

    let gameState = data => {
        $scope.yourHand = [];
        for(let d in data.hands[uid]) {
            drawCards(data.hands[uid][d]);
        }
        if(data.winner) {
            $interval.cancel(timer);
            if($scope.game.winner == uid) {
                console.log("you won!");
                GameFactory.updateRecords();
            }else {
                console.log("you lost!");
            }
            return;
        }
        $interval.cancel(timer);
        timer = $interval(clockTick, 1000); 
        console.log("data", data);
        if(data.times[$scope.opp] <= 0 || data.times[uid] <= 0) {
            timeResult(data.times);
        }
        if(data.playedCards && data.playedCards.length >= 10) {
            scoreResult(data.score);
        }
    };

    let runTheNumbers = () => {
        let x = $scope.game.x;
        let cards = $scope.game.playedCards;
        for(let i = 0; i < cards.length; i++) {
            x *= cards[i].m;
            x += Number(cards[i].a);
            x -= Number(cards[i].s);
            x %= CardFactory.max;
            if(x < 0) {x = 0;}
            if(x == $scope.game[$scope.opp]) {
                console.log(x, $scope.game[$scope.opp]);
                $scope.game.score[$scope.opp] += 1;
            } else if(x == $scope.game[uid]) {
                console.log(x, $scope.game[uid]);
                $scope.game.score[uid] += 1;
            }
            cards[i].x = x;
        }
        if(x == $scope.game[$scope.opp]) {
            console.log(x, $scope.game[$scope.opp]);
            $scope.game.score[$scope.opp] += 2;
        } else if(x == $scope.game[uid]) {
            console.log(x, $scope.game[uid]);
            $scope.game.score[uid] += 2;
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
        $scope.game.whoseTurn = $scope.opp;
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
        GameFactory.getProfile({"uid": uid});
        GameFactory.getOpponent($scope.opp);
        gameState($scope.game);
        console.log($scope.game);
    }); 

    let route = $routeParams.gameId;

    $firebaseArray(firebase.database().ref(`games/${route}`)).$loaded().then(() => {  //looks for new game to be created once queue fills
		firebase.database().ref(`games/`).on('child_changed', x => {
	 		$scope.game = x.val();
             console.log(x.val(), "x");
            gameState($scope.game);
		});
	});
});

