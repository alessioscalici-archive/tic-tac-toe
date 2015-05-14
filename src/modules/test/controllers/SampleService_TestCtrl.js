
angular.module('test').controller('SampleService_TestCtrl', function ($scope, TestInstance, SampleService){
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
  var test;


  // ------------------------ service = the name of the tested service
  // 
  $scope.serviceName = 'SampleService';

  // ===================================================================== //
  //                                  TESTS
  // ===================================================================== //




  test = newTest('SampleService.sampleMethod'); //--------------------------------------------

  
  try {

    var testString = 'hello',
      testObject = {
        id : 9
      };


    SampleService.sampleMethod(testString, testObject).then(function(resp){

        if (!resp.expectedString) {
            test.error('expectedString is not defined');
        }

        if (!resp.expectedObject) {
            test.error('expectedObject is not defined');
        }

        
      }, function(err){
        test.error('Call failed: '+ err);
      });

  } catch (err) {
    test.error('Exception: '+ err);
  }

  

    test = newTest('SampleService.sampleMethod (will fail)'); //--------------------------------------------

  
  try {



    SampleService.sampleMethod('', {}).then(function(resp){

        if (!resp.unexpectedString) {
            test.error('unexpectedString is not defined');
        }

        if (!resp.unexpectedObject) {
            test.error('unexpectedObject is not defined');
        }

        
      }, function(err){
        test.error('Call failed: '+ err);
      });

  } catch (err) {
    test.error('Exception: '+ err);
  }

  
});  