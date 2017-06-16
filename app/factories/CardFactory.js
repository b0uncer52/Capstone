'use strict';

app.factory("CardFactory", function($q, $http, FBCreds) {

    const getCard = cardId => {
        return $q((resolve, reject) => {
            console.log(cardId, "got to this one");
            $http.get(`${FBCreds.databaseURL}/cards/${cardId}.json`)
            .then( resolve )
            .catch( reject );
        });
    };

    
    return {getCard};

});