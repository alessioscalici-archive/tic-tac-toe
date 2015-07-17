angular.module('Test').service('TestInstance', function(){
    'use strict';
    var TestInstance = function (name){
        this.name = name;
        this.errors = [];
    };

    TestInstance.prototype.error = function(text){
        this.errors.push(text);
    };

    return TestInstance;

});