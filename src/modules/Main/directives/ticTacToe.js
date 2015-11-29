
/**
 * @ngdoc directive
 * @name Main.directive:ticTacToe
 * @restrict E
 *
 * @requires Main.constant:T_MAIN
 *
 * @description
 *
 *    The tic-tac-toe game board
 *
 */
angular.module('Main').directive('ticTacToe', function (T_MAIN) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: T_MAIN.MAIN_TICTACTOE
  };
});