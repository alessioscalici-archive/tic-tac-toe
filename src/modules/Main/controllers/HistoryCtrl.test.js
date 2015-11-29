
describe('HistoryCtrl', function () {
  'use strict';

  beforeEach(module('Main'));

  /*
   Inject the needed services into the s object
   */
  var s = {}, toInject = ['$localStorage'];

  beforeEach(inject(function ($injector) {
    for (var i=0; i<toInject.length; ++i)
      s[toInject[i]] = $injector.get(toInject[i]);
  }));

  /*
   Initializes tests
   */
  var $rootScope, $scope;

  beforeEach(inject(function ($controller, _$rootScope_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    s.$localStorage.history = [];

    $controller('HistoryCtrl', angular.extend(s, {
      $scope: $scope
    }));
  }));

  describe('when instantiated', function () {
    it('should set the history property', function(){
      expect($scope.history).toBe(s.$localStorage.history);
    });
  });


});
