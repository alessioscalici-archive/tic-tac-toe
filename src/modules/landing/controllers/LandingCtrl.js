/**
 * @ngdoc controller
 * @name edudocApp.controller:LandingCtrl
 *
 * @requires $scope
 * @requires _meta.constant:M
 *
 *
 * @description 
 * 
 * This is the controller of the landing page. It will manage the sign up and log in templates
 *
 * 
 */

angular.module('edudocApp').controller('LandingCtrl', function ($scope, Auth){
  "use strict";

  $scope.formData = {
    // email : '',
    // firstName : '',
    // lastName : '',
    // userType : '',
    // password : '',
    // confirmPassword : ''
  };


  var postLogin = function(resp) {

    if (Math.floor(resp.status / 100) === 2) {

      window.alert('login successful');
    } else {
      
      window.alert('login error');
    }
    console.log('IMPLEMENT error messages and redirect'); // FIXME error messages 
  };


  $scope.signup = function() {
    Auth.signup($scope.formData)
      .then(postLogin, postLogin);
  };


  $scope.login = function() {
     Auth.login($scope.formData)
      .then(postLogin, postLogin);
  };

  $scope.logout = function() {
     Auth.logout()
      .then(function(){
        window.alert ('Logout successful');
      }, function(){
        window.alert ('Logout error');
      });
  };

  
});