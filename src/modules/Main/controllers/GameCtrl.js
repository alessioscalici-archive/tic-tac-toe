
/**
 * @ngdoc controller
 * @name Main.controller:GameCtrl
 *
 * @requires $scope
 * @requires Main.service:GameStatus
 *
 * @description
 *
 *    The controller for the game view.
 *
 */
angular.module('Main').controller('GameCtrl', function ($scope, GameStatus) {


  // updates the status message shown in the status bar
  var updateStatusMessage = function () {
    $scope.statusMessage = $scope.currentPlayer.name + ', is your turn!';
  };


  // ===================== INIT =================== //

  $scope.currentPlayer = GameStatus.getCurrentPlayer();
  updateStatusMessage();


  // ===================== LISTENERS =================== //

  var listeners = [

    // when a user makes a move, calls the game service
    $scope.$on('TTT-PLAYED', function (ev, data) {
      GameStatus.play(data);
    }),

    // when a player wins, change the status message and show the buttons
    $scope.$on('TTT-WIN', function (ev, data) {
      $scope.statusMessage = data.playerName + ' wins!';
      $scope.showMenu = true;
      $scope.$digest();
    }),

    // when there is a draw, change the status message and show the buttons
    $scope.$on('TTT-DRAW', function (ev, data) {
      $scope.statusMessage = 'Draw!';
      $scope.showMenu = true;
      $scope.$digest();
    }),

    $scope.$on('TTT-SWITCH-PLAYER', function (ev, data) {
      $scope.currentPlayer = data;
      updateStatusMessage();
      $scope.$digest();
    }),

    // detach the listeners on scope destroy
    $scope.$on('$destroy', /* istanbul ignore next */ function () {
      angular.forEach(listeners, function (detach) {
        detach();
      });
    })
  ];
  


});