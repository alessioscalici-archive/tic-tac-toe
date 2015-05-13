/**
 * @ngdoc object
 * @name edudocApp.constant:MOCK
 *
 * @description
 * 
 * Only injected in test files, contains mock HTTP responses
 * 
 */
angular.module('edudocApp').constant('MOCK', {

  genericError : {
    error_code : 'ERROR_CODE',
    error_message : 'ERROR_MESSAGE',
  },


  loginSuccess : {
      access_token : 'ACCESS_TOKEN_HASH',
      refresh_token : 'REFRESH_TOKEN_HASH',
  }
  

  
});