'use strict';

app.factory("CardFactory", function($q, $http, FBCreds) {

    let max = 32;
    let deckSize = 15;

    const getCard = cardId => {
        return $q((resolve, reject) => {
            $http.get(`${FBCreds.databaseURL}/cards/${cardId}.json`)
            .then( resolve )
            .catch( reject );
        });
    };

    return {getCard, max, deckSize};

});