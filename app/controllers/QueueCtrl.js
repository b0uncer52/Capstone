'use strict';

app.controller('QueueCtrl', function($scope, $location, GameFactory, AuthFactory) {
    
    $scope.hiya = "we did it";

    GameFactory.getQueue()
    .then( response => {
        let data = response.data;
        if(Object.keys(data).length > 1) {
            let players = [];
            for(let d in data) {
                players.push(d);
            }
            GameFactory.createGame(players[0], players[1]);
        }
    });

    // $scope.makeUppercase = functions.database.ref('/games')
    // .onWrite(event => {
    //   // Grab the current value of what was written to the Realtime Database.
    //   const original = event.data.val();
    //   console.log('Uppercasing', event.params.pushId, original);
    //   const uppercase = original.toUpperCase();
    //   // You must return a Promise when performing asynchronous tasks inside a Functions such as
    //   // writing to the Firebase Realtime Database.
    //   // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
    //   return event.data.ref.parent.child('uppercase').set(uppercase);
    // });



});