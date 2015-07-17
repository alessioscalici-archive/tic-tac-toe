angular.module('Main').config(function ($stateProvider, $urlRouterProvider, T_MAIN) {
	'use strict';
	

	$urlRouterProvider
		.otherwise("/meta");


	$stateProvider
		.state('meta', {
			url: "/meta",
			templateUrl: T_MAIN.SAMPLE_META,
			controller: 'MetaCtrl'
		})
	;


});