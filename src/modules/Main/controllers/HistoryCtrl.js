
/**
 * @ngdoc controller
 * @name Main.controller:HistoryCtrl
 *
 * @requires $scope
 * @requires $localStorage
 *
 * @description
 *
 *    The controller for the history view. Loads data from the localstorage
 *
 */
angular.module('Main').controller('HistoryCtrl', function ($scope, $localStorage) {

  // fetch the history from localstorage
  $scope.history = $localStorage.history;



});