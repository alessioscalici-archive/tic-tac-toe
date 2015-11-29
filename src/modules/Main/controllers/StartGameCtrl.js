
/**
 * @ngdoc controller
 * @name Main.controller:StartGameCtrl
 *
 * @requires $scope
 * @requires $state
 * @requires Main.service:GameStatus
 *
 * @description
 *
 *    The controller for the Start game view.
 *
 */
angular.module('Main').controller('StartGameCtrl', function ($scope, $state, GameStatus) {


  /**
   * @ngdoc method
   * @methodOf Main.controller:StartGameCtrl
   * @name startGame
   * @description Reset the game status and goes to the game view.
   */
  $scope.startGame = function () {
    GameStatus.reset($scope.formData);
    $state.go('game');
  };



  // ===================== INIT =================== //

  // initializes the form with the previously used names (if any)
  $scope.formData = GameStatus.playerData;


});