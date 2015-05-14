/**
 * @ngdoc controller
 * @name sample.controller:MetaCtrl
 *
 * @requires $scope
 * @requires M
 *
 * @description
 *
 * This is the mata data view controller
 *
 */
angular.module('sample').controller('MetaCtrl', function ($scope, M){
	"use strict";

	$scope = angular.extend($scope, M);
});