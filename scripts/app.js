var app = angular.module('CrystalApp', [
  'ngMaterial'
]);

app.controller('AppCtrl', ['$scope', function($scope) {
  $scope.openFile = function() {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, function(files) {
      var dir = files[0];
      
      var crystal = require('crystal');
      var project = new crystal();
      project.build({ path: dir });
    });
  };
}]);
