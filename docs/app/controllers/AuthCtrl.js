"use strict";

app.controller('AuthCtrl', function ($scope, $window, AuthFactory, GameFactory, $location) {

    $scope.account = {
        email: "",
        password: ""
    };

    if (AuthFactory.isAuthenticated()) {
        AuthFactory.logoutUser();
    }

    $scope.register = (registerUser) => {
        AuthFactory.createUser(registerUser)
        .then((userData) => {$scope.logIn(registerUser);});
    };

    $scope.logIn = (loginStuff) => {
        AuthFactory.logInUser(loginStuff)
        .then( (didLogin) => {
            GameFactory.getProfile(didLogin);
            $location.url("/menu");
            $scope.$apply();
        });
    };

    $scope.loginGoogle = () => {
        AuthFactory.authWithProvider()
        .then(function (result) {
            var user = result.user.uid;
            GameFactory.getProfile(result.user);
            $location.url("/menu");
            $scope.$apply();
        }).catch(function (error) {
            console.log("error:", error.code, error.message);            
        });
    };
});