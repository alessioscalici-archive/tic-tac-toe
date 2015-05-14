/**
 * @ngdoc service
 * @name sample.service:SampleService
 *
 * @requires $log
 * @requires $q
 *
 * @description
 *
 * This is a sample service to show documentation comments, unit-test and integration-test
 */

angular.module('sample').service('SampleService', function($log, $q){
  "use strict";
  var me = {


    /**
     * @ngdoc property
     * @name aProperty
     * @propertyOf sample.service:SampleService
     *
     * @type {string}
     *
     * @description
     *
     *  Just a sample property to show how to document properties in ngdocs
     *  
     */
    aProperty : null,


    /**
     * @ngdoc method
     * @name sampleMethod
     * @methodOf sample.service:SampleService
     * 
     * @description
     * 
     *     Returns the same string passed as parameter
     * 
     * @param {string} stringParam            a string to be returned
     * @param {object} objectParam            this object is returned in the expectedObject property
     * @param {number} objectParam.id         a number property
     * @param {string} [objectParam.name]     this is an optional object property
     * 
     * @return {promise}       a promise, fulfilled with an object { expectedString : stringParam , expectedObject : objectParam}
     */
    sampleMethod : function(stringParam, objectParam) {

        var deferred = $q.defer();
        deferred.resolve({
            expectedString : stringParam,
            expectedObject : objectParam
        });
        return deferred.promise;
    }
  };
  return me;
});