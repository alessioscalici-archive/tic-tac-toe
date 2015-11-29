describe('tic-tac-toe-spot', function () {
  'use strict';



  beforeEach(module('Main'));



  var $scope, $rootScope, elem, GameStatus;



  var compileDirective = inject(function (_$rootScope_, _GameStatus_) {

    GameStatus = _GameStatus_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    var tpl = '<div tic-tac-toe-spot></div>';

    inject(function ($compile) {
      elem = $compile(tpl)($scope);
    });


    $scope.$digest();

  });


  beforeEach(function(){
    compileDirective();
  });





  describe('when the spot is playable', function(){

    describe('on click', function(){


      it('should show the X symbol if the current player is X', function(){

        GameStatus.currentPlayer = 'X';

        elem.click();

        expect(elem.find('.symbol-o').hasClass('ng-hide')).toBe(true);
        expect(elem.find('.symbol-x').hasClass('ng-hide')).toBe(false);
        expect(elem.find('.symbol-x').hasClass('transparent')).toBe(false);

      });

      it('should show the O symbol if the current player is O', function(){

        GameStatus.currentPlayer = 'O';

        elem.click();

        expect(elem.find('.symbol-x').hasClass('ng-hide')).toBe(true);
        expect(elem.find('.symbol-o').hasClass('ng-hide')).toBe(false);
        expect(elem.find('.symbol-o').hasClass('transparent')).toBe(false);

      });

    });



    describe('on mouse over', function(){


      it('should show a semi-transparent X symbol if the current player is X', function(){

        GameStatus.currentPlayer = 'X';

        elem.trigger('mouseover');

        expect(elem.find('.symbol-o').hasClass('ng-hide')).toBe(true);
        expect(elem.find('.symbol-x').hasClass('ng-hide')).toBe(false);
        expect(elem.find('.symbol-x').hasClass('transparent')).toBe(true);

      });

      it('should show a semi-transparent O symbol if the current player is O', function(){

        GameStatus.currentPlayer = 'O';

        elem.trigger('mouseover');

        expect(elem.find('.symbol-x').hasClass('ng-hide')).toBe(true);
        expect(elem.find('.symbol-o').hasClass('ng-hide')).toBe(false);
        expect(elem.find('.symbol-o').hasClass('transparent')).toBe(true);

      });

    });


    describe('on mouse out', function(){

      it('should hide the semi-transparent symbols', function(){

        elem.trigger('mouseout');

        expect(elem.find('.symbol-o').hasClass('ng-hide')).toBe(true);
        expect(elem.find('.symbol-x').hasClass('ng-hide')).toBe(true);

      });

    });



    describe('on TTT-WIN', function(){

      var data;

      beforeEach(function () {
        data = {
          direction: 'diag1',
          row: 0,
          col: 0
        };
      });

      it('should set the spot as played', function(){
        $rootScope.$broadcast('TTT-WIN', data);
        expect(elem.hasClass('highlight')).toBe(false);
      });

    });


    describe('on TTT-RESET', function(){

      it('should hide the symbols and highlights', function(){

        $rootScope.$broadcast('TTT-RESET');

        expect(elem.find('.symbol-o').hasClass('ng-hide')).toBe(true);
        expect(elem.find('.symbol-x').hasClass('ng-hide')).toBe(true);
        expect(elem.hasClass('highlight')).toBe(false);

      });

    });


  });





});