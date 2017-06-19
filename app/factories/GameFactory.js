'use strict';

app.factory("GameFactory", function($q, $http, FBCreds, moment, CardFactory) {

    let fbGameDb = firebase.database().ref('games');

    const joinQueue = joiner => {
        return $q((resolve, reject) => {
            let uid = JSON.stringify(joiner);
            $http.put(`${FBCreds.databaseURL}/queue/${joiner}.json`, uid)
            .then( resolve )
            .catch( reject );
        });
    };

    const removeFromQueue = player => {
        console.log(player, "hi hannah");
        return $q((resolve, reject) => {
            $http.delete(`${FBCreds.databaseURL}/queue/${player}.json`)
            .then( resolve )
            .catch( reject );
        });
    };

    const getStats = id => {
        return $q((resolve, reject) => {
            $http.get(`${FBCreds.databaseURL}/users/${id}.json`)
            .then( resolve )
            .catch( reject );
        });
    };

    const generateGoals = () => {
        let number1 = 0, number2 = 0;
        do {
            number1 = Math.floor(Math.random() * 18) + 13;
            number2 = Math.floor(Math.random() * 18) + 13;
        }
        while (number1 === number2);

        return [number1, number2];
    };

    const generateHands = () => {
        let cards = [];
        for(let i = 0; i < 6; i++) {
            cards.push(Math.floor(Math.random() * CardFactory.deckSize));
        }
        console.log(cards, "cards");
        return(cards);
    };

    const createGame = (player1, player2) => {
        let numbers = generateGoals();
        console.log(player1, player2);
        let times = {};
        times[player1] = 600;
        times[player2] = 600;
        let score = {};
        score[player1] = 0;
        score[player2] = 0;
        let whoseTurn;
        if(Math.random() < 0.5) {
            whoseTurn = player1.replace(/['"]+/g, '');
        } else {
            whoseTurn = player2.replace(/['"]+/g, '');
        }
        let x = Math.floor(Math.random() * 8) + 2;
        let createdTime = moment();
        let index = (new Date()).valueOf();
        let cards = generateHands();
        let hands = {};
        hands[player1] = [];
        hands[player2] = [];
        for(let i = 0; i < cards.length; i++) {
            if(i < 3) {
                hands[player1].push(cards[i]);
            } else {
                hands[player2].push(cards[i]);
            }
        }
        let game = {times, whoseTurn, x, score, createdTime, index, hands};
        game[player1] = numbers[0];
        game[player2] = numbers[1];
        console.log(game);

        return $q((resolve, reject) => {
            let newGame = JSON.stringify(game);
            $http.put(`${FBCreds.databaseURL}/games/${index}.json`, newGame)
            .then( (response) => {
                removeFromQueue(player1);
                removeFromQueue(player2);
                resolve(response);
            }).catch( reject );
        });
    };

    const getQueue = () => {
        return $q((resolve, reject) => {
            $http.get(`${FBCreds.databaseURL}/queue.json`)
            .then( resolve )
            .catch( reject );
        });
    };

    const getGame = gameId => {
        return $q((resolve, reject) => {
            $http.get(`${FBCreds.databaseURL}/games/${gameId}.json`)
            .then( resolve )
            .catch( reject );
        });
    };

    const updateGame = obj => {
        let gameObj = JSON.stringify(obj);
        return $q((resolve, reject) => {
            $http.put(`${FBCreds.databaseURL}/games/${obj.index}.json`, gameObj)
            .then( resolve )
            .catch( reject );
        });
    };

    return{joinQueue, getStats, getQueue, createGame, fbGameDb, removeFromQueue, getGame, updateGame};
}); 