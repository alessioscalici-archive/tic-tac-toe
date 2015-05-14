/*jshint strict: false */
/**
 * @ngdoc overview
 * @name main
 *
 * @description
 * The main app module, it defines application-wide configurations as routes, translations, constants etc.
 *
 * @requires _meta
 * @requires ui.router
 * @requires sample
 * 
 */
angular.module('main', [
    '_meta', // auto-generated constant with development metadata
    'ui.router',

    'sample' // the sample module
]);

