angular.module('edudocApp').config(function ($stateProvider, $urlRouterProvider, T_EDUDOCAPP) {
	'use strict';
	
	// For any unmatched url, redirect to /404
	$urlRouterProvider
		// .when(/^\/?$/, '/login')
		.otherwise("/login");


	$stateProvider
		.state('login', {
			url: "/login",
			templateUrl: T_EDUDOCAPP.LANDING_LANDING,
			controller: 'LandingCtrl'
		})
	;


});