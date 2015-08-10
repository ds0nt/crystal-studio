var app = angular.module('CrystalApp', [
  'ngMaterial'
]);

app.controller('AppCtrl', ['$mdDialog','$scope', function($mdDialog,$scope) {
  $scope.getFolders = function() {
  var fs = require('fs'),
    path = require('path'),
    userHome = require('user-home');
  var workspace = path.join(userHome, '.crystal/dev');
  var folders = fs.readdirSync(workspace).filter(function(file) {
    return fs.statSync(path.join(workspace, file)).isDirectory();
  });
  return folders;
}
;
  $scope.folders = $scope.getFolders();
  $scope.dir = process.cwd();
  $scope.runIcon = 'images/run.svg';
  $scope.buildProject = function(ev) {
  $scope.alert = $mdDialog.alert()
    .parent(angular.element(document.body))
    .title('Building...')
    .targetEvent(ev);
  $mdDialog.show($scope.alert);
  
  $scope.project.build({ path: $scope.dir }, function() {
    $mdDialog.hide($scope.alert, 'finish');
  });
}
;
  $scope.openFile = function() {
  dialog.showOpenDialog({ properties: ['openDirectory'] }, function(files) {
    var dir = files[0];
    $scope.dir = dir;
    $scope.project = new crystal();
    
    $scope.config = $scope.project.config(dir);
    
    var code = document.getElementById('code');
    if (code) {
      if (!$scope.editor) {
        $scope.editor = CodeMirror.fromTextArea(code, {
          mode: 'yaml',
          lineNumbers: true
        });
      }
      var yaml = jsyaml.safeDump($scope.config);
      $scope.editor.getDoc().setValue(yaml);
    }
    
    $scope.$apply();
  });
};
;
  $scope.runProject = function(ev) {
  if ($scope.running) {
    $scope.running = false;
    $scope.runIcon = 'images/run.svg';
    $scope.project.stop();
  } else {
    $scope.running = true;
    $scope.runIcon = 'images/stop.svg';
    
    $scope.project.run({ path: $scope.dir });
  }
}
;
  $scope.saveProject = function() {
  var fs = require('fs');
  
  var config = $scope.editor.getDoc().getValue();
  fs.writeFileSync($scope.dir + '/.crystal/config.yml', config);
}
;
}]);
