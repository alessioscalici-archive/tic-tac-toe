/**
 * @ngdoc object
 * @name Main.config:route
 *
 * @requires $stateProvider
 * @requires $urlRouterProvider
 * @requires Main.constant:T_MAIN
 *
 * @description
 *
 *    Here is the router configuration, all the application state definitions.
 *
 */
angular.module('Main').config(function ($stateProvider, $urlRouterProvider, T_MAIN) {
	'use strict';
	
  // default url
	$urlRouterProvider
		.otherwise("/startgame");


	$stateProvider

    .state('startgame', {
      url: "/startgame",
      templateUrl: T_MAIN.MAIN_STARTGAME,
      controller: 'StartGameCtrl'
    })

		.state('game', {
			url: "/game",
			templateUrl: T_MAIN.MAIN_GAME,
			controller: 'GameCtrl'
		})

    .state('history', {
      url: "/history",
      templateUrl: T_MAIN.MAIN_HISTORY,
      controller: 'HistoryCtrl'
    })
	;


});