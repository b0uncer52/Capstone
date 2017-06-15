"use strict";

const app = angular.module('GameApp', ['ngRoute', 'firebase', 'angularMoment']);

let isAuth = (AuthFactory) => new Promise ( (resolve,reject) => {
        AuthFactory.isAuthenticated()
        .then( (userExists) => {
            if(userExists){
                console.log("Authenticated, go ahead");
                resolve();
            } else{
                console.log("Authentication rejected");
                reject();
            }
        });
    });


app.config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'partials/login.html',
        controller: 'AuthCtrl'
    }).when('/login', {
        templateUrl: 'partials/login.html',
        controller: 'AuthCtrl'
    }).when('/menu', {
        templateUrl: 'partials/menu.html',
        controller: 'MenuCtrl',
        resolve: {isAuth}
    }).when('/about', {
        templateUrl: 'partials/about.html',
        controller: 'AboutCtrl',
        resolve: {isAuth}
    }).when('/stats', {
        templateUrl: 'partials/stats.html',
        controller: 'StatsCtrl',
        resolve: {isAuth}
    }).when('/queue', {
        templateUrl: 'partials/queue.html',
        controller: 'QueueCtrl',
        resolve: {isAuth}
    }).when('/game/:gameId', {
        templateUrl: 'partials/battlefield.html',
        controller: 'GameCtrl',
        resolve: {isAuth}
    }).otherwise('/login');
});

app.run(($location, FBCreds) => {
    let creds = FBCreds;
    let authConfig = {
        apiKey: creds.apiKey,
        authDomain: creds.authDomain,
        databaseURL: creds.databaseURL
    };

    firebase.initializeApp(authConfig);
});