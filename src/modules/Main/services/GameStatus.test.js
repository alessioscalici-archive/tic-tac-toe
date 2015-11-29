
describe('GameStatus', function () {
  'use strict';

  beforeEach(module('Main'));


  /*
   Initializes tests
   */
  var $rootScope, GameStatus;

  beforeEach(inject(function (_GameStatus_, _$rootScope_) {
    $rootScope = _$rootScope_;
    GameStatus = _GameStatus_;


  }));



  describe('when instantiated', function () {
    it('should have a set of predefined values', function(){
      expect(GameStatus.playerData).toBeDefined();
      expect(GameStatus.matrix).toBeDefined();
      expect(GameStatus.turn).toBeDefined();
    });
  });


  describe('.reset()', function () {

    var data;
    beforeEach(function () {
      data = {
        X: { name: 'PlayerX'},
        O: { name: 'PlayerO'}
      };
    });

    it('should broadcast TTT-RESET', function(){
      spyOn($rootScope, '$broadcast');
      GameStatus.reset(data);
      expect($rootScope.$broadcast).toHaveBeenCalled();
    });
  });


  describe('.switchPlayer()', function () {
    it('should set the current player to O if the current player is X', function(){
      GameStatus.currentPlayer = 'X';
      GameStatus.switchPlayer();
      expect(GameStatus.currentPlayer).toBe('O');
    });

    it('should set the current player to X if the current player is O', function(){
      GameStatus.currentPlayer = 'O';
      GameStatus.switchPlayer();
      expect(GameStatus.currentPlayer).toBe('X');
    });
  });



  describe('.play()', function () {



    it('should detect a win by row', function(){

      GameStatus.matrix = [['X','X',''],['','O','O'],['','','']];
      spyOn($rootScope, '$broadcast');

      GameStatus.play({ row: 0, col: 2, player: 'X' });

      expect($rootScope.$broadcast).toHaveBeenCalledWith('TTT-WIN', jasmine.any(Object));
    });


    it('should detect a win by column', function(){

      GameStatus.matrix = [['X','',''],['X','O','O'],['','','']];
      spyOn($rootScope, '$broadcast');

      GameStatus.play({ row: 2, col: 0, player: 'X' });

      expect($rootScope.$broadcast).toHaveBeenCalledWith('TTT-WIN', jasmine.any(Object));
    });

    it('should detect a win by diagonal 1', function(){

      GameStatus.matrix = [['X','',''],['O','X','O'],['','','']];
      spyOn($rootScope, '$broadcast');

      GameStatus.play({ row: 2, col: 2, player: 'X' });

      expect($rootScope.$broadcast).toHaveBeenCalledWith('TTT-WIN', jasmine.any(Object));
    });

    it('should detect a win by diagonal 2', function(){

      GameStatus.matrix = [['','','X'],['O','X','O'],['','','']];
      spyOn($rootScope, '$broadcast');

      GameStatus.play({ row: 2, col: 0, player: 'X' });

      expect($rootScope.$broadcast).toHaveBeenCalledWith('TTT-WIN', jasmine.any(Object));
    });



    it('should detect a draw', function(){

      GameStatus.turn = 8;
      spyOn($rootScope, '$broadcast');

      GameStatus.play({ row: 2, col: 0, player: 'X' });

      expect($rootScope.$broadcast).toHaveBeenCalledWith('TTT-DRAW');
    });


  });


});
