'use strict';

app.factory("GameFactory", function($q, $http, FBCreds) {

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

    const createGame = (player1, player2) => {

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

    return{joinQueue, getStats, getQueue};
});