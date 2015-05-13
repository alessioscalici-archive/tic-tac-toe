describe('Auth', function () {
  'use strict';


  beforeEach(module('edudocApp'));


  /*
    Inject the needed services into the s object
   */
  var s = {}, toInject = ['Auth', 'URL', 'MOCK'];
  
  beforeEach(inject(function ($injector) {
    for (var i=0; i<toInject.length; ++i)
      s[toInject[i]] = $injector.get(toInject[i]);
  }));


  /*
    Initializes tests
   */
  var httpBackend;

  beforeEach(inject(function ($httpBackend) {

    httpBackend = $httpBackend;

  }));



  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });



  //---------------------------------------------------------------------------------
  //                                  TESTS
  //---------------------------------------------------------------------------------


  describe('.setToken()', function(){

    it('should set the token if the token has the correct format', function(){
      s.Auth.setToken(s.MOCK.loginSuccess);
      expect(s.Auth.isTokenValid()).toBe(true);
    });

    it('should NOT set the token if the token has the incorrect format', function(){
      s.Auth.setToken({something : 123});
      expect(s.Auth.isTokenValid()).toBe(false);
    });

  });





  describe('.refreshToken()', function(){

    beforeEach(function(){
      s.Auth.setToken(s.MOCK.loginSuccess);
      httpBackend.whenPOST(s.URL.oauthToken).respond(200, {});
    });


    it('should send a refresh token request', function(){

      httpBackend.expectPOST(s.URL.oauthToken).respond(200, s.MOCK.loginSuccess);

      s.Auth.refreshToken();

      httpBackend.flush();

    });

    

  });






  describe('.queueRequest()', function(){

    it('should add a request to the request queue', function(){
      var prevQueueLength = s.Auth.queue.length;

      s.Auth.queueRequest({requestdata : 'somedata'});

      expect(s.Auth.queue.length).toBe( prevQueueLength + 1 );
    });


  });



  describe('.sendPendingRequests()', function(){


    var requestData = {
        url : 'http://localhost:3000/test', 
        method:'GET'
      };



    beforeEach(function(){
      s.Auth.queueRequest(requestData);
      httpBackend.whenGET(requestData.url).respond(200, {});
    });



    it('should send a request in the pending queue', function(){

      httpBackend.expectGET(requestData.url).respond(200, {});

      s.Auth.sendPendingRequests();

      httpBackend.flush();

    });



  });



  describe('.logout()', function(){


    beforeEach(function(){
      httpBackend.whenPOST(s.URL.oauthRevokeToken).respond(200, {});

      s.Auth.setToken(s.MOCK.loginSuccess);

    });


    it('should POST to the logout API', function(){

      httpBackend.expectPOST(s.URL.oauthRevokeToken).respond(200, {});

      s.Auth.logout();

      httpBackend.flush();
    });



    it('should invalidate token on success', function(){

      s.Auth.logout()
        .then(function(){
          expect(s.Auth.isTokenValid()).toBe(false);
        });

      httpBackend.flush();
    });

  });



  describe('.signup()', function(){

    var data = {
      email : 'sample@email.com',
      firstName : 'John',
      lastName : 'Smith',
      userType : 'User::GroupManager',
      password : 'pppppppp',
      confirmPassword : 'pppppppp'
    };

    beforeEach(function(){
      httpBackend.whenPOST(s.URL.apiSignup).respond(200, s.MOCK.loginSuccess);
    });


    it('should POST to the signup API', function(){

      httpBackend.expectPOST(s.URL.apiSignup).respond(200, s.MOCK.loginSuccess);

      s.Auth.signup(data);

      httpBackend.flush();
    });



    it('should set a valid token on success', function(){

      s.Auth.signup(data)
        .then(function(){
          expect(s.Auth.isTokenValid()).toBe(true);
        });

      httpBackend.flush();
    });


    it('should NOT set a valid token on failure', function(){

      httpBackend.expectPOST(s.URL.apiSignup).respond(500, s.MOCK.genericError);

      s.Auth.signup(data)
        .then(function(){
          expect(s.Auth.isTokenValid()).toBe(false);
        });

      httpBackend.flush();
    });

  });




  describe('.login()', function(){

    var data = {
      email : 'sample@email.com',
      password : 'pppppppp'
    };

    beforeEach(function(){
      httpBackend.whenPOST(s.URL.oauthToken).respond(200, s.MOCK.loginSuccess);
    });


    it('should POST to the login API', function(){

      httpBackend.expectPOST(s.URL.oauthToken).respond(200, s.MOCK.loginSuccess);

      s.Auth.login(data);

      httpBackend.flush();
    });



    it('should set a valid token on success', function(){

      s.Auth.login(data)
        .then(function(){
          expect(s.Auth.isTokenValid()).toBe(true);
        });

      httpBackend.flush();
    });


    it('should NOT set a valid token on failure', function(){

      httpBackend.expectPOST(s.URL.oauthToken).respond(500, s.MOCK.genericError);

      s.Auth.login(data)
        .then(function(){
          expect(s.Auth.isTokenValid()).toBe(false);
        });

      httpBackend.flush();
    });

  });
  


});