/**
 * @ngdoc object
 * @name edudocApp.constant:URL
 *
 * @description
 * 
 * Contains the API URLs
 * 
 */
angular.module('edudocApp').constant('URL', {

  apiBase :    'http://localhost:3000/api/v1/',
  apiSignup :  'http://localhost:3000/api/v1/registrations/new',
  oauthToken : 'http://localhost:3000/oauth/token',
  oauthRevokeToken : 'http://localhost:3000/oauth/revoke'

});