/**
 * @ngdoc service
 * @name edudocApp.service:Auth
 *
 * @requires $log
 * @requires $q
 * @requires $injector
 * @requires $localStorage
 * @requires edudocApp.constant:URL
 * @requires edudocApp.constant:KEY
 *
 * @description
 * This service manages the authentication.
 * The workflow is:
 * 
 * - First of all, login using the login() method. An authorization token will be returned (if the login was successful)
 * - When a request receives a "token expired" response:
 *   - Queue the request with the queueRequest() method
 *   - Make a refresh token request calling the refreshToken() method
 * - The refreshToken method automatically re-sends the pending requests when a new Access Token is available
 */

angular.module('eduServices').service('Auth', function($log, $q, $injector, $localStorage, URL, KEY){
  "use strict";
  var me = {

    /**
     * The oAuth token
     * @type {object}
     */
    token : null,


    /**
     * Returns true if the token is valid, false otherwise
     * @return {boolean} true if the token is valid, false otherwise
     */
    isTokenValid : function(){
      return !!$localStorage.token;
    },


    /**
     * @ngdoc method
     * @name login
     * @methodOf edudocApp.service:Auth
     * 
     * @description
     * Performs a login request
     * 
     * @param  {object} data                  the login form data
     * @param  {string} data.email            the user email
     * @param  {string} data.password         the user password
     * 
     * @return {promise}                      a promise resolved when the Access Token is ready, fulfilled with the login call response
     */
    login : function(data) {

      return $injector.get('$http').post(URL.oauthToken, {
          'email' : data.email,
          'password': data.password,
          'grant_type':'password',
          'client_id': KEY.applicationId,
          'client_secret': KEY.secretKey
      }).then(function(response){
        me.setToken(response.data);
        return response;
      });
    },


    /**
     * @ngdoc method
     * @name logout
     * @methodOf edudocApp.service:Auth
     * @description
     * 
     * Performs a logout request
     * 
     * @return {promise}          a promise resolved at the call response
     */
    logout : function() {

      return $injector.get('$http').post( URL.oauthRevokeToken, {
        token : me.getAccessToken()
      }).then(function(response){
        $log.debug('Logout successful: ', response);
        $localStorage.token = false;
        return response;
      });
    },


    /**
     * @ngdoc method
     * @name signup
     * @methodOf edudocApp.service:Auth
     * @description
     * 
     * Performs a signup request
     * 
     * @param  {object} data                  the signup form data
     * @param  {string} data.email            the user email
     * @param  {string} data.firstName        the user first name
     * @param  {string} data.lastName         the user last name
     * @param  {string} data.userType         the user type (User::GroupMember, User::groupManager, User::Headmaster)
     * @param  {string} data.password         the user password
     * @param  {string} data.confirmPassword  the user password confirmation
     * 
     * @return {promise}                      a promise resolved when the Access Token is ready, fulfilled with the signup call response
     */
    signup : function(data) {

      return $injector.get('$http').post(URL.apiSignup, {
          'email' : data.email,
          'first_name' : data.firstName,
          'last_name' : data.lastName,
          'default_user_class_name' : data.userType,
          'password': data.password,
          'password_confirmation': data.confirmPassword,
          'grant_type':'password',
          'client_id': KEY.applicationId,
          'client_secret': KEY.secretKey
      }).then(function(response){
        me.setToken(response.data);
        return response;
      });
    },

    /**
     * Sets the new authorization Token
     * @return {string} the Refresh Token
     */
    setToken : function(token){

      $log.debug('Login token: ', token);

      if (!token || !token['access_token'] || !token['refresh_token']) {
        $log.error('Unexpected authentication token format: ', token);
      } else {
        $localStorage.token = token;
      }

      return;
    },

    /**
     * Returns the Refresh Token
     * @return {string} the Refresh Token
     */
    getRefreshToken : function(){
      return $localStorage.token['refresh_token'];
    },


    /**
     * Returns the Access Token
     * @return {string} the Access Token
     */
    getAccessToken : function(){
      return $localStorage.token['access_token'];
    },


    /**
     * Performs a Refresh Token request to get a new Access Token, and then re-sends the queued requests.
     * @return {promise} a promise resolved when the new Access Token is ready, fulfilled with an array of
     *                     responses of the pending requests, or with the rejection if one of them is rejected
     */
    refreshToken : function(){


      var promise = $injector.get('$http').post(URL.oauthToken, {
              'grant_type' : 'refresh_token',
              'refresh_token' : me.getRefreshToken()
            }).then(function(response){

              $log.debug('New access token: ', response.data);
              me.setToken(response.data);

              return me.sendPendingRequests();
            });

      $log.debug('Auth.refreshToken: discarding token', $localStorage.token);
      $localStorage.token = false;

      return promise;
    },


    /**
     * The pending requests queue
     * @type {Array}
     */
    queue : [],

    /**
     *
     * Put a request in the queue
     *
     * @param {object} req - an $http request configuration.
     * @return {promise} a pending promise, resolved in the 'sendPendingRequests' method
     *                     when the server returns the response for the request.
     */
    queueRequest : function(req){

      $log.debug('Auth: queuing request', req);

      var defer = $q.defer();

      this.queue.push({
        request : req,
        deferred : defer
      });
      return defer.promise;

    },


    /**
     * Re-send all the request previously queued, and clears the queue
     * @return {promise} a promise fulfilled with an array of responses of every pending request, or with the rejection if one of them is rejected
     */
    sendPendingRequests : function(){

      $log.debug('Auth: re-sending ' + this.queue.length + ' requests');

      var promiseArray = [];

      angular.forEach(this.queue, function(item){

        $log.debug('Auth: re-sending request', item.request.url, item);

        var promise = $injector.get('$http')(item.request).then(function(resp){
          item.deferred.resolve(resp);
          return item.deferred.promise;
        });

        promiseArray.push(promise);
      });

      this.queue = [];

      return $q.all(promiseArray);

    }
  };
  return me;
});