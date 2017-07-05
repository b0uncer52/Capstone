'use strict';

app.controller('AboutCtrl', function($scope, $location, CardFactory) {

    $scope.cards = [];

    let LoadCard = card => {
        $scope.cards.push(card.data);
    };

    for(let i = 0; i < CardFactory.deckSize; i++) {
        CardFactory.getCard(i)
        .then( LoadCard );
    }

});