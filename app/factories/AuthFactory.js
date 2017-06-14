"use strict";

app.factory("AuthFactory", function(){

    let currentUser = null;
    let provider = new firebase.auth.GoogleAuthProvider();

    let createUser = (userObj) => {
        return firebase.auth().createUserWithEmailAndPassword(userObj.email, userObj.password)
        .catch( function(error){
            console.log("error:", error.code, error.message);
        });
    };

    let logoutUser = () => {
        return firebase.auth().signOut();
    };

    let logInUser = (userObj) => {
        return firebase.auth().signInWithEmailAndPassword(userObj.email, userObj.password)
        .catch( function(error){
            console.log("error:", error.code, error.message);
        });
    };

    let authWithProvider= function(){
        return firebase.auth().signInWithPopup(provider);
    };
    
    let getUser = () => {
        return currentUser;
    };
    
    let isAuthenticated = function (){
        return new Promise ( (resolve, reject) => {
            firebase.auth().onAuthStateChanged( (user) => {
                if (user){
                    currentUser = user.uid;
                    resolve(true);
                }else {
                    resolve(false);
                }
            });
        });
    };

    return {getUser, logInUser, createUser, logoutUser, authWithProvider, isAuthenticated};
});