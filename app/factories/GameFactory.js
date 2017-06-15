'use strict';

app.factory("GameFactory", function($q, $http, FBCreds, moment) {

    let fbGameDb = firebase.database().ref('games');

    const joinQueue = joiner => {
        return $q((resolve, reject) => {
            let uid = JSON.stringify(joiner);
            $http.put(`${FBCreds.databaseURL}/queue/${uid}.json`, uid)
            .then( (response) => {
                resolve(response);
            }).catch( (error) => {
                reject(error);
            });
        });
    };

    const getStats = id => {
        return $q((resolve, reject) => {
            $http.get(`${FBCreds.databaseURL}/users/${id}.json`)
            .then( (response) => {
                resolve(response);
            }).catch( (error) => {
                reject(error);
            });
        });
    };

    const generateGoals = () => {
        let number1 = 0, number2 = 0;
        do {
            number1 = Math.floor(Math.random() * 115) + 13;
            number2 = Math.floor(Math.random() * 115) + 13;
        }
        while (number1 === number2);

        return [number1, number2];
    };

    const removeFromQueue = player => {
        return $q((resolve, reject) => {
            $http.delete(`${FBCreds.databaseURL}/queue/${player}.json`)
            .then( (response) => {
                resolve(response);
            }).catch( (error) => {
                reject(error);
            });
        });
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
        let game = {times, whoseTurn, x, score, createdTime, index};
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
            }).catch( (error) => {
                reject(error);
            });
        });
    };

    const getQueue = () => {
        return $q((resolve, reject) => {
            $http.get(`${FBCreds.databaseURL}/queue.json`)
            .then( (response) => {
                resolve(response);
            }).catch( (error) => {
                reject(error);
            });
        });
    };

    return{joinQueue, getStats, getQueue, createGame, fbGameDb, removeFromQueue};
}); 