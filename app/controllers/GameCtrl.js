'use strict';

app.controller('GameCtrl', function($scope, $location, $interval, $routeParams, $firebaseArray, GameFactory, AuthFactory, CardFactory) {

    var uid = AuthFactory.getUser();
    $scope.uid = uid;
   
    $scope.yourTurn = false;
    $scope.selected = false;
    $scope.yourHand = [];
    $scope.selectedCard = null;
    $scope.endMsg = "";
    $scope.myTime = {};
    $scope.oTime = {};
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
        parseTime();
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
                $scope.endMsg = "you won!";
                GameFactory.updateRecords();
            }else {
                $scope.endMsg = "you lost!";
            }
            return;
        }
        $interval.cancel(timer);
        timer = $interval(clockTick, 1000); 
        parseTime();
        if(data.times[$scope.opp] <= 0 || data.times[uid] <= 0) {
            timeResult(data.times);
        }
        if(data.playedCards && data.playedCards.length >= 10) {
            scoreResult(data.score);
        }
    };

    let parseTime = () => {
        $scope.myTime.minutes = Math.floor($scope.game.times[$scope.uid] / 60);
        $scope.myTime.seconds = $scope.game.times[$scope.uid] % 60;
        if($scope.myTime.seconds < 10) {
            $scope.myTime.seconds = "0" + $scope.myTime.seconds;
        }
        $scope.oTime.minutes = Math.floor($scope.game.times[$scope.opp] / 60);
        $scope.oTime.seconds = $scope.game.times[$scope.opp] % 60;
        if($scope.oTime.seconds < 10) {
            $scope.oTime.seconds = "0" + $scope.oTime.seconds;
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
                $scope.fade();
                $scope.game.score[$scope.opp] += 1;
            } else if(x == $scope.game[uid]) {
                $scope.fade();
                $scope.game.score[uid] += 1;
            }
            cards[i].x = x;
        }
        if(x == $scope.game[$scope.opp]) {
            $scope.fade();
            $scope.game.score[$scope.opp] += 2;
        } else if(x == $scope.game[uid]) {
            $scope.fade();
            $scope.game.score[uid] += 2;
        }
        $scope.game.x = x;
    };

    $scope.fade = () => {
        $(".scorePop").fadeIn(0);
        $(".scorePop").fadeOut(3000);
        $(".scorePop").css("fontSize", "20px");
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
    }); 

    let route = $routeParams.gameId;

    $firebaseArray(firebase.database().ref(`games/${route}`)).$loaded().then(() => {  //looks for new game to be created once queue fills
		firebase.database().ref(`games/`).on('child_changed', x => {
	 		$scope.game = x.val();
            gameState($scope.game);
		});
	});
});

