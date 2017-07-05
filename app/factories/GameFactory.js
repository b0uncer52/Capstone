'use strict';

app.factory("GameFactory", function($q, $http, FBCreds, CardFactory) {

    let fbGameDb = firebase.database().ref('games');
    let profile = {};
    let opponent = {};

    const editProfile = (editedProfile) => {
        let newProfile = JSON.stringify(editedProfile);
        $http.patch(`${FBCreds.databaseURL}/profiles/${editedProfile.uid}.json`, newProfile)
        .then( response => {
            console.log(response, "editProfile");
        });
    };

    const getOpponent = id => {
        $http.get(`${FBCreds.databaseURL}/profiles/${id}.json`)
        .then( response => {
            opponent = response.data;
        });
    };

    const getProfile = data => {
        $http.get(`${FBCreds.databaseURL}/profiles/${data.uid}.json`)
        .then( response => {
            if(response.data === null) {
                newProfile(data);
            } else {
                profile = {
                    uid: response.data.uid,
                    photo: response.data.photoURL,
                    email: response.data.email,
                    name: response.data.displayName,
                    rating: response.data.rating,
                    wins: response.data.wins,
                    losses: response.data.losses
                };
            }
        });
    };

    const newProfile = data => {
        profile = {
            uid: data.uid,
            photo: data.photoURL,
            email: data.email,
            name: data.displayName,
            rating: 1000,
            wins: 0,
            losses: 0
        };
        let obj = JSON.stringify(profile);
        $http.put(`${FBCreds.databaseURL}/profiles/${data.uid}.json`, obj);
    };

    const joinQueue = joiner => {
        return $q((resolve, reject) => {
            let uid = JSON.stringify(joiner);
            $http.put(`${FBCreds.databaseURL}/queue/${joiner}.json`, uid)
            .then( resolve )
            .catch( reject );
        });
    };

    const removeFromQueue = player => {
        return $q((resolve, reject) => {
            $http.delete(`${FBCreds.databaseURL}/queue/${player}.json`)
            .then( resolve )
            .catch( reject );
        });
    };

    const getStats = id => {
        return $q((resolve, reject) => {
            $http.get(`${FBCreds.databaseURL}/profiles/${id}.json`)
            .then( resolve )
            .catch( reject );
        });
    };

    const generateGoals = () => {
        let number1 = 0, number2 = 0;
        do {
            number1 = Math.floor(Math.random() * 8) + 11;
            number2 = Math.floor(Math.random() * 8) + 11;
        }
        while (number1 === number2);

        return [number1, number2];
    };

    const generateHands = () => {
        let cards = [];
        for(let i = 0; i < 6; i++) {
            cards.push(Math.floor(Math.random() * CardFactory.deckSize));
        }
        return(cards);
    };

    const createGame = (player1, player2) => {
        let numbers = generateGoals();
        let times = {};
        times[player1] = 300;
        times[player2] = 300;
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
        let game = {times, whoseTurn, x, score, index, hands};
        game[player1] = numbers[0];
        game[player2] = numbers[1];

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

    const updateRecords = () => {
        let caseU = Math.pow(10, profile.rating/400);
        let caseO = Math.pow(10, opponent.rating/400);
        let total = caseU + caseO;
        let k = Math.floor(32 * (1 - caseU / total));
        profile.rating += k;
        profile.wins++;
        opponent.rating -= k;
        opponent.losses++;
        editProfile(profile);
        editProfile(opponent);
    };

    return{joinQueue, getStats, getQueue, createGame, fbGameDb, 
    removeFromQueue, getGame, updateGame, getProfile, editProfile,
    profile, opponent, getOpponent, updateRecords};
}); 