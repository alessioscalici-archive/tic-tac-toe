/**
 *
 * This is a sample unit test for services.
 * For services making http calls, use the mock $httpBackend (see Angular docs)
 * 
 */
describe('SampleService', function () {
  'use strict';


  beforeEach(module('sample'));


  /*
    Inject the needed services into the s object
   */
  var s = {}, toInject = ['SampleService'];
  
  beforeEach(inject(function ($injector) {
    for (var i=0; i<toInject.length; ++i)
      s[toInject[i]] = $injector.get(toInject[i]);
  }));




  //---------------------------------------------------------------------------------
  //                                  TESTS
  //---------------------------------------------------------------------------------


  describe('.sampleMethod()', function(){


    it('should return a promise fulfilled with the parameters', function(){

        var testString = 'hello',
            testObject = {
                id : 9
            };

        var promise = s.SampleService.sampleMethod(testString, testObject);

        promise.then(function(resp){

            expect(resp.expectedString).toBe(testString);

            expect(resp.expectedObject.id).toBeDefined();
            expect(resp.expectedObject.id).toBe(testObject.id);

        });
      
    });

  });


});