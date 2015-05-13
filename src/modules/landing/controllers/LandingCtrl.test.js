describe('LandingCtrl', function () {
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
  var $scope, httpBackend;

  beforeEach(inject(function ($controller, $rootScope, $httpBackend) {

    httpBackend = $httpBackend;

    $scope = $rootScope.$new();

    $controller('LandingCtrl', {
      $scope: $scope,
      Auth : s.Auth
    });
    

  }));



  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });




  describe('.signup()', function(){

    // before executing the tests in the .signup() section
    beforeEach(function(){
      httpBackend.whenPOST(s.URL.apiSignup).respond(200, s.MOCK.loginSuccess);
    });



    it('should call the Auth.login method', function(){

      spyOn(s.Auth, 'signup').andCallThrough();

      $scope.signup();
      
      expect(s.Auth.signup).toHaveBeenCalledWith($scope.formData);

      httpBackend.flush();
    });



    it('should send a registration request', function(){

      // success case
      httpBackend.expectPOST(s.URL.apiSignup).respond(200, s.MOCK.loginSuccess);

      $scope.signup();

      httpBackend.flush();
    });


    it('should send a registration request', function(){

      // error case
      httpBackend.expectPOST(s.URL.apiSignup).respond(500, s.MOCK.genericError);

      $scope.signup();

      httpBackend.flush();
    });


  });




  describe('.login()', function(){


    // before executing the tests in the .signup() section
    beforeEach(function(){
      httpBackend.whenPOST(s.URL.oauthToken).respond(200, s.MOCK.loginSuccess);
    });


    it('should call the Auth.login method', function(){

      spyOn(s.Auth, 'login').andCallThrough();

      $scope.login();

      expect(s.Auth.login).toHaveBeenCalledWith($scope.formData);

      httpBackend.flush();
    });


    it('should send a login request', function(){

      // success case
      httpBackend.expectPOST(s.URL.oauthToken).respond(200, s.MOCK.loginSuccess);

      $scope.login();

      httpBackend.flush();
    });


    it('should send a login request', function(){

      // error case
      httpBackend.expectPOST(s.URL.oauthToken).respond(500, s.MOCK.genericError);

      $scope.login();

      httpBackend.flush();
    });

  });


});