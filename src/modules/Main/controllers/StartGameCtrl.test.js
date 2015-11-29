
describe('StartGameCtrl', function () {
  'use strict';

  beforeEach(module('Main'));

  /*
   Inject the needed services into the s object
   */
  var s = {}, toInject = ['GameStatus', '$state'];

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

    $controller('StartGameCtrl', angular.extend(s, {
      $scope: $scope
    }));
  }));

  describe('when instantiated', function () {
    it('should initialize the form with the last player names', function(){
      expect($scope.formData).toBe(s.GameStatus.playerData);
    });
  });



  // ---------------------- METHODS --------------------- //

  describe('.startGame()', function () {
    it('should call GameStatus.reset to initialize the game', function(){
      spyOn(s.GameStatus, 'reset').and.callThrough();
      $scope.startGame();
      expect(s.GameStatus.reset).toHaveBeenCalledWith($scope.formData);
    });

    it('should go to the game view', function(){
      spyOn(s.$state, 'go');
      $scope.startGame();
      expect(s.$state.go).toHaveBeenCalled();
    });
  });


});
