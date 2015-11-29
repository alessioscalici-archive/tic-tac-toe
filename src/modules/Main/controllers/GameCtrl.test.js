
describe('GameCtrl', function () {
  'use strict';

  beforeEach(module('Main'));

  /*
   Inject the needed services into the s object
   */
  var s = {}, toInject = ['GameStatus'];

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

    spyOn(s.GameStatus, 'getCurrentPlayer').and.callThrough();
    $controller('GameCtrl', {
      $scope: $scope
    });
  }));

  describe('when instantiated', function () {
    it('should call GameStatus.getCurrentPlayer to initialize the label', function(){
      expect(s.GameStatus.getCurrentPlayer).toHaveBeenCalled();
    });
  });


  // --------------------------- EVENTS ------------------------- //

  describe('on event', function () {
    describe('TTT-PLAYED', function () {

      var move;

      beforeEach(function () {
        move = { row: 1, col: 1, player: 'X' };
      });

      it('should call GameStatus.play to perform the checks', function(){

        spyOn(s.GameStatus, 'play').and.callThrough();

        $rootScope.$broadcast('TTT-PLAYED', move);

        expect(s.GameStatus.play).toHaveBeenCalledWith(move);
      });
    });



    describe('TTT-WIN', function () {

      var data;

      beforeEach(function () {
        data = { playerName: 'Player X' };
      });

      it('should show the menu buttons', function(){
        $rootScope.$broadcast('TTT-WIN', data);
        expect($scope.showMenu).toBe(true);
      });

      it('should set a wins status', function(){
        $rootScope.$broadcast('TTT-WIN', data);
        expect($scope.statusMessage.indexOf('wins') > -1).toBe(true);
      });

    });


    describe('TTT-DRAW', function () {

      var data;

      beforeEach(function () {
        data = { playerName: 'Player X' };
      });

      it('should show the menu buttons', function(){
        $rootScope.$broadcast('TTT-DRAW', data);
        expect($scope.showMenu).toBe(true);
      });

      it('should set a draw status', function(){
        $rootScope.$broadcast('TTT-DRAW', data);
        expect($scope.statusMessage).toBe('Draw!');
      });

    });


    describe('TTT-SWITCH-PLAYER', function () {

      var player;

      beforeEach(function () {
        player = { name: 'Player X', symbol: 'X' };
      });

      it('should show the menu buttons', function(){
        $rootScope.$broadcast('TTT-SWITCH-PLAYER', player);
        expect($scope.currentPlayer).toBe(player);
      });


    });



  });

});
