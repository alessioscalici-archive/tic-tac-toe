angular.module('test').config(function ($stateProvider, $urlRouterProvider, T_TEST) {
	'use strict';
	

	$urlRouterProvider
		.otherwise("/");

	$stateProvider
		.state('root', {
			url: "/",
			templateUrl: T_TEST.TEST_TEMPL,
			controller: 'IntegrationTestCtrl'
		})
	;

});