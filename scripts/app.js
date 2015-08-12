var app = angular.module('CrystalApp', [
  'ngMaterial',
  'schemaForm',
  'ui.codemirror'
]);

 app.controller('AppCtrl', ['$mdDialog','$mdSidenav','$scope','$window','schemaForm', function($mdDialog,$mdSidenav,$scope,$window,schemaForm) {
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
  $scope.runningModules = [];
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
  $scope.loadModule = function(folder) {
  $mdSidenav('left').toggle();
  
  var fs = require('fs'),
    path = require('path'),
    userHome = require('user-home');
  var workspace = path.join(userHome, '.crystal/dev');
  var module_path = path.join(workspace, folder);
  
  $scope.dir = module_path;
  $scope.project = new crystal();
  $scope.selectedFolder = folder;
  
  $scope.config = $scope.project.config($scope.dir);
  console.log($scope.config);
  
  if ($scope.runningModules.indexOf(folder) !== -1) {
    $scope.runIcon = 'images/stop.svg';
  } else { 
    $scope.runIcon = 'images/run.svg';
  }
  
  var yaml = fs.readFileSync($scope.dir + '/.crystal/config.yml', 'utf-8');
  var editor = document.getElementsByClassName('CodeMirror')[0].CodeMirror;
  editor.setValue(yaml);
  
  angular.element($window).trigger('resize');
};
;
  $scope.openFile = function() {
  $mdSidenav('left').toggle();
  return;
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
  $scope.runningModules.push($scope.selectedFolder);
  
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
  
  var config = document.getElementsByClassName('CodeMirror')[0].CodeMirror.getDoc().getValue();
  fs.writeFileSync($scope.dir + '/.crystal/config.yml', config);
}
;
}]); 

 app.directive('resize', function($window) {
  return function (scope, element) {
    var w = angular.element($window);
    
    w.bind('resize', function () {
      var editor = document.getElementsByClassName('CodeMirror')[0];
      editor.style.height = w[0].outerHeight - 86;
    });
  };
}
); 
