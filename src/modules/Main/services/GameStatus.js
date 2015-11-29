
/**
 * @ngdoc service
 * @name Main.service:GameStatus
 *
 * @requires $rootScope
 * @requires $localStorage
 *
 * @description
 *
 *    The GameStatus service keeps all the game internal data
 *    and broadcasts events when a player wins, or there is a draw.
 *
 */
angular.module('Main').service('GameStatus', function ($rootScope, $localStorage){
  'use strict';


  $localStorage.history = $localStorage.history || [];

  var me = {

    // true when players can play, false otherwise
    ready: true,

    // a turn counter
    turn: 0,

    // loads the payers names from the local storage, or sets default names
    playerData: $localStorage.playerData || {
      X: { symbol: 'X', name: 'Player X' },
      O: { symbol: 'O', name: 'Player O' }
    },

    // a matrix to keep track of the board status
    matrix: [['','',''],['','',''],['','','']],

    // the current player symbol ( X or O )
    currentPlayer: 'X',


    /**
     * @ngdoc method
     * @methodOf Main.service:GameStatus
     * @name reset
     * @param {object} playerData the data of the 2 players
     * @param {object} playerData.X the X player data
     * @param {string} playerData.X.name the X player name
     * @param {object} playerData.O the O player data
     * @param {string} playerData.O.name the O player name
     *
     * @description The method resets the game status to start a new round.
     */
    reset: function (playerData) {
      playerData.X.symbol = 'X';
      playerData.O.symbol = 'O';
      me.matrix = [['','',''],['','',''],['','','']];
      me.playerData = playerData;
      $localStorage.playerData = playerData;
      me.currentPlayer = 'X';
      me.ready = true;
      me.turn = 0;
      $rootScope.$broadcast('TTT-RESET');
    },


    /**
     * @ngdoc method
     * @methodOf Main.service:GameStatus
     * @name switchPlayer
     * @description Switch the player.
     */
    switchPlayer: function () {
      if (me.ready) {
        me.currentPlayer = (me.currentPlayer === 'X' ? 'O' : 'X');
        $rootScope.$broadcast('TTT-SWITCH-PLAYER', me.playerData[me.currentPlayer]);
      }
    },

    /**
     * @ngdoc method
     * @methodOf Main.service:GameStatus
     * @name getCurrentPlayer
     * @return {object} the current player
     * @description Return the current player
     */
    getCurrentPlayer: function () {
      return me.playerData[me.currentPlayer];
    },


    /**
     * @ngdoc method
     * @methodOf Main.service:GameStatus
     * @name play
     * @param {object} move the move data
     * @param {number} move.row the row of the selected spot
     * @param {number} move.col the column of the selected spot
     * @param {string} move.player the player who made the move
     *
     * @description Checks if the player wins or if there is a draw,
     * and broadcasts an event accordingly
     */
    play: function (move) {

      if (me.matrix[move.row][move.col] !== '') {
        throw 'Cannot play an already played spot!';
      }

      me.turn += 1;

      me.matrix[move.row][move.col] = move.player;

      var i,
        winRow = true,
        winCol = true,
        winDiag1 = (move.row === move.col),
        winDiag2 = (move.row + move.col === 2);

      // check if the player won
      for (i = 0; i < 3; ++i) {

        // check row
        if (winRow && me.matrix[move.row][i] !== move.player) {
          winRow = false;
        }

        // check column
        if (winCol && me.matrix[i][move.col] !== move.player) {
          winCol = false;
        }

        // check diagonal 1
        if (winDiag1 && me.matrix[i][i] !== move.player) {
          winDiag1 = false;
        }

        // check diagonal 2
        if (winDiag2 && me.matrix[i][2 - i] !== move.player) {
          winDiag2 = false;
        }

      }

      if (winRow || winCol || winDiag1 || winDiag2) {

        // the current user wins
        $rootScope.$broadcast('TTT-WIN', {
          player: move.player,
          playerName: me.playerData[move.player].name,
          row: move.row,
          col: move.col,
          direction: (winRow ? 'row' : (winCol ? 'col' : (winDiag1 ? 'diag1' : 'diag2')))
        });

        // save data in the history
        $localStorage.history.unshift({
          result: 'win',
          players: me.playerData,
          winner: move.player,
          date: new Date()
        });

        me.ready = false;

      } else if (me.turn === 9) {

        // it was the last possible turn, the round is draw
        $rootScope.$broadcast('TTT-DRAW');
        me.ready = false;

        // save data in the history
        $localStorage.history.unshift({
          result: 'draw',
          players: me.playerData,
          date: new Date()
        });
      }

    }

  };

  return me;

});