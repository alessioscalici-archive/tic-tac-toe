angular.module('main').config(function ($stateProvider, $urlRouterProvider, T_MAIN) {
	'use strict';
	
	// For any unmatched url, redirect to /404
	$urlRouterProvider
		// .when(/^\/?$/, '/login')
		.otherwise("/login");


	$stateProvider
		.state('login', {
			url: "/login",
			templateUrl: T_MAIN.MAIN_META,
			controller: 'MetaCtrl'
		})
	;


});