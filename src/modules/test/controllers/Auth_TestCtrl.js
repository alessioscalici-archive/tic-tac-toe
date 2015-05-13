
angular.module('test').controller('Auth_TestCtrl', function ($scope, TestInstance, Auth){
  "use strict";


  $scope.tests = [];

  /**
   * Starts a new test
   * @param  {string} name the name of the new test (usually the method name)
   * @return {TestInstance}      a TestInstance object
   */
  var newTest = function (name) {
    var test = new TestInstance(name);
    $scope.tests.push(test);
    return test;
  };
  var test, formData;


  // ------------------------ service = the name of the tested service
  // 
  $scope.service = 'Auth';

  // ===================================================================== //
  //                                  TESTS
  // ===================================================================== //




  test = newTest('Auth.login'); //--------------------------------------------

  
  try {
    formData = {
        email : 'ppp@ppp.pp',
        password : 'pppppppp'
    };

    Auth.login(formData).then(function(resp){

        if (!resp.data['access_token']) {
            test.error('access_token is not defined');
        }

        if (!resp.data['refresh_token']) {
            test.error('refresh_token is not defined');
        }

        
      }, function(err){
        test.error('Call failed: '+ err);
      });

  } catch (err) {
    test.error('Exception: '+ err);
  }

  


  test = newTest('Auth.login error'); //--------------------------------------------

  
  try {
    formData = {
      email : 'ppp@ppp.pp',
      password : 'some wrong password'
    };

    Auth.login(formData).then(function(resp){

        test.error('Error expected');

        
      }, function(resp){

        if (!resp.data['error']) {
            test.error('error is not defined');
        }

        if (resp.data['error'] !== 'invalid_grant') {
            test.error('error is not "invalid_grant"');
        }

        if (!resp.data['error_description']) {
            test.error('error_description is not defined');
        }

      });

  } catch (err) {
    test.error('Exception: '+ err);
  }
  

  

  
});  