
/**
 * @ngdoc directive
 * @name Main.directive:ticTacToeSpot
 * @restrict A
 *
 * @requires $rootScope
 * @requires Main.service:GameStatus
 * @requires Main.constant:T_MAIN
 *
 * @description
 *
 *    The tic-tac-toe game board spot.
 *    It contains the board visual logic.
 *
 */
angular.module('Main').directive('ticTacToeSpot', function ($rootScope, T_MAIN, GameStatus) {
  'use strict';
  return {
    restrict: 'A',
    template: '<div class="symbol-x ng-hide"><div class="diag1"></div><div class="diag2"></div></div><div class="symbol-o ng-hide"></div>',
    link: function (scope, elem) {

      // get the spot position
      var row = elem.parent().index(),
        col = elem.index();


      // when the spot is clicked
      elem.click(function () {

        // if it was not selected yet
        if (!elem.played) {
          elem.played = true;

          // set the correct symbol
          var symbolSelector = (GameStatus.currentPlayer === 'X' ? '.symbol-x' : '.symbol-o');
          elem.find(symbolSelector).removeClass('ng-hide').removeClass('transparent');

          // notify the move
          $rootScope.$broadcast('TTT-PLAYED', {
            player: GameStatus.currentPlayer,
            row: row,
            col: col
          });

          // switch the player
          GameStatus.switchPlayer();
        }

      });


      // when the user is hovering the spot
      elem.hover(
        function () {
          if (!elem.played) {
            // show a semi-transparent symbol
            var symbolSelector = (GameStatus.currentPlayer === 'X' ? '.symbol-x' : '.symbol-o');
            elem.find(symbolSelector).addClass('transparent').removeClass('ng-hide');
          }
        },
        function () {
          if (!elem.played) {
            // hide the symbol
            var symbolSelector = (GameStatus.currentPlayer === 'X' ? '.symbol-x' : '.symbol-o');
            elem.find(symbolSelector).removeClass('transparent').addClass('ng-hide');
          }
        });




      var listeners = [

        // when a user wins
        scope.$on('TTT-WIN', function (ev, data) {

          // prevents from selecting
          elem.played = true;

          // higlights the spot if part of the winning line
          if (
            (data.direction === 'row' && data.row === row) ||
            (data.direction === 'col' && data.col === col) ||
            (data.direction === 'diag1' && col === row) ||
            (data.direction === 'diag2' && col + row === 2)
          ) {
            elem.addClass('highlight');
          }
        }),

        // on reset, hides symbols and highlights
        scope.$on('TTT-RESET', function (ev, data) {
          elem.removeClass('highlight');
          elem.find('.symbol-x,.symbol-o').addClass('ng-hide');
          elem.played = '';
        }),

        // detach listeners
        scope.$on('$destroy', /* istanbul ignore next */ function () {
          angular.forEach(listeners, function (detach) {
            detach();
          });
        })
      ];


    }
  };
});