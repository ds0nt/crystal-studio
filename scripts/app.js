var app = angular.module('CrystalApp', [
  'ngMaterial',
  'ngRoute',
  'schemaForm',
  'ui.codemirror'
]);

app.config(function($routeProvider,$locationProvider) {
  $routeProvider
    .when('/app', {
      templateUrl: 'app.html',
      controller: 'AppCtrl'
    })
    .when('/login', {
      templateUrl: 'login.html',
      controller: 'LoginCtrl'
    });
    
    $locationProvider.html5Mode(
      {
        requireBase: false,
        enabled: true
      }
    );
})

 app.controller('AddProjectCtrl', ['$rootScope','$scope', function($rootScope,$scope) {
  $scope.add = function() {
  var request = require('request');
  
  request({
    headers: {
      'User-Agent': 'Crystal Studio <support@crystal.sh> (https://crystal.sh)'
    },
    body: {
      name: 'test1',
      description: 'this is a test'
    },
    json: true,
    method: 'POST',
    uri: 'https://api.github.com/user/repos?access_token=' + window.localStorage.getItem('accessToken')
  }, function(err, httpResponse, body) {
    var body = JSON.parse(body);
  });
};
;
  $scope.cancel = function() {
  $mdDialog.cancel();
};
;
}]);  app.controller('AddWorkspaceCtrl', ['$mdDialog','$mdSidenav','$rootScope','$scope', function($mdDialog,$mdSidenav,$rootScope,$scope) {
  $scope.add = function() {
  $mdDialog.cancel();
  $mdSidenav('workspace-sidebar').toggle();
  
  $rootScope.loadingWorkspaces = true;

  var BrowserWindow = remote.require('browser-window');
  var query = require('query-string');
  var request = require('request');
  
  // Create the browser window.
  var loginWindow = new BrowserWindow({
    'always-on-top': true,
    width: 800,
    height: 600,
    title: ''
  });

  loginWindow.webContents.on('will-navigate', function(event, url) {
    var config = {
      client_id: process.env.CRYSTAL_STUDIO_GITHUB_CLIENT_ID,
      client_secret: process.env.CRYSTAL_STUDIO_GITHUB_CLIENT_SECRET
    };
    
    var raw_code = /code=([^&]*)/.exec(url) || null,
      code = (raw_code && raw_code.length > 1) ? raw_code[1] : null,
      error = /\?error=(.+)$/.exec(url);
    
    if (code || error) {
      // Close the browser if code found or error
      loginWindow.close();
    }
    
    // If there is a code in the callback, proceed to get token from github
    if (code) {
      console.log({
        client_id: config.client_id,
        client_secret: config.client_secret,
        code: code
      });
      request({
        method: 'POST',
        uri: 'https://github.com/login/oauth/access_token',
        form: {
          client_id: config.client_id,
          client_secret: config.client_secret,
          code: code
        },
      }, function(err, httpResponse, body) {
        var body = query.parse(body);
        var accessToken = body.access_token;
        
        request({
          headers: {
            'User-Agent': 'Crystal Studio <support@crystal.sh> (https://crystal.sh)'
          },
          method: 'GET',
          uri: 'https://api.github.com/user?access_token=' + accessToken
        }, function(err, httpResponse, body) {
          var body = JSON.parse(body);
          
          $rootScope.workspaces.push({
            icon: 'github',
            name: body.login
          })
          
          window.localStorage.setItem('accessToken', accessToken);
          
          $rootScope.loadingWorkspaces = false;
        });
      });
    } else if (error) {
      alert("Oops! Something went wrong and we couldn't log you in using Github. Please try again.");
    }
  });

  loginWindow.loadUrl('https://github.com/login/oauth/authorize?client_id=4fa99694428b1b3ea68f&scope=user,repo');
};
;
  $scope.cancel = function() {
  $mdDialog.cancel();
};
;
}]);  app.controller('AppCtrl', ['$http','$mdDialog','$mdSidenav','$rootScope','$route','$scope','$window','schemaForm', function($http,$mdDialog,$mdSidenav,$rootScope,$route,$scope,$window,schemaForm) {
  $scope.load = function() {
  $rootScope.loadingWorkspaces = false;

  $rootScope.workspaces = window.localStorage.getItem('workspaces');
  $rootScope.selectedWorkspace = window.localStorage.getItem('selectedWorkspace');
  if (!$rootScope.workspaces) {
    $rootScope.workspaces = [{
      icon: 'folder',
      name: '/Users/ctate/.crystal/studio'
    }];
  }
  if (!$rootScope.selectedWorkspace) {
    $rootScope.selectedWorkspace = $rootScope.workspaces[0];
  }
  
  $rootScope.projects = window.localStorage.getItem('projects');
  $rootScope.selectedProject = window.localStorage.getItem('selectedProject');
  if (!$rootScope.projects) {
    $rootScope.projects = [];
  }
  if ($rootScope.projects.length && !$rootScope.selectedProject) {
    $rootScope.selectedProject = $rootScope.projects[0];
  }
  
  console.log($rootScope.workspaces);
  console.log($rootScope.selectedWorkspace);
  console.log($rootScope.projects);
  console.log($rootScope.selectedProject);
  
  return;
  
  var request = require('request');
  
  request({
    headers: {
      'User-Agent': 'Crystal Studio <support@crystal.sh> (https://crystal.sh)'
    },
    method: 'GET',
    uri: 'https://api.github.com/user?access_token=' + window.localStorage.getItem('accessToken')
  }, function(err, httpResponse, body) {
    var body = JSON.parse(body);
    $rootScope.workspaces = [{
      icon: 'github',
      name: body.login,
      type: 'user'
    }];
    $rootScope.selectedWorkspace = $rootScope.workspaces[0];
    
    request({
      headers: {
        'User-Agent': 'Crystal Studio <support@crystal.sh> (https://crystal.sh)'
      },
      method: 'GET',
      uri: 'https://api.github.com/user/orgs?access_token=' + window.localStorage.getItem('accessToken')
    }, function(err, httpResponse, body) {
      var body = JSON.parse(body);
      for (var i = 0; i < body.length; i++) {
        $rootScope.workspaces.push({
          icon: 'github',
          name: body[i].login,
          type: 'org'
        });
      }
      
      request({
        headers: {
          'User-Agent': 'Crystal Studio <support@crystal.sh> (https://crystal.sh)'
        },
        method: 'GET',
        uri: 'https://api.github.com/user/repos?access_token=' + window.localStorage.getItem('accessToken')
      }, function(err, httpResponse, body) {
        var body = JSON.parse(body);
        for (var i = 0; i < body.length; i++) {
          $rootScope.projects.push({
            name: body[i].login,
            type: 'org'
          });
        }
        
        $rootScope.selectedProject = $rootScope.projects[0];
      });
    });
  });
  
  return true;
}
;
  $scope.loaded = $scope.load();
  $scope.branch = 'master';
  $scope.dir = process.cwd();
  $scope.runIcon = 'images/run.svg';
  $scope.runningModules = [];
  $scope.username = 'Login with GitHub';
  $scope.login = function(ev) {
  $mdDialog.show(
    $mdDialog.alert()
      .parent(angular.element(document.querySelector('#popupContainer')))
      .clickOutsideToClose(true)
      .title('Crystal')
      .content('Login to Crystal with your GitHub account.')
      .ok('Login')
      .targetEvent(ev)
  ).then(function() {
    window.location.href = 'https://github.com/login/oauth/authorize?client_id=b15727baac5a27dcec10&redirect_uri=https://crystal.sh/accounts/connect/github&scope=user,repo';
  });
};
;
  $scope.addWorkspace = function(ev) {
  $mdSidenav('workspace-sidebar').toggle();
  
  $mdDialog.show({
    controller: 'AddWorkspaceCtrl',
    templateUrl: 'partials/addWorkspace.tmpl.html',
    parent: angular.element(document.body),
    targetEvent: ev,
    clickOutsideToClose: true
  })
  .then(function(answer) {
    
  }, function() {
    
  });
}
;
  $scope.loadWorkspace = function(workspace) {
  $rootScope.selectedWorkspace = workspace;
  window.localStorage.setItem('workspace', workspace.name);
  $mdSidenav('workspace-sidebar').toggle();
}
;
  $scope.switchWorkspace = function() {
  $mdSidenav('workspace-sidebar').toggle();
};
;
  $scope.addProject = function(ev) {
  $mdSidenav('project-sidebar').toggle();
  
  $mdDialog.show({
    controller: 'AddProjectCtrl',
    templateUrl: 'partials/addRepo.tmpl.html',
    parent: angular.element(document.body),
    targetEvent: ev,
    clickOutsideToClose: true
  })
  .then(function(answer) {
    
  }, function() {
    
  });
}
;
  $scope.buildProject = function(ev) {
  $scope.alert = $mdDialog.alert()
    .parent(angular.element(document.body))
    .title('Building...')
    .targetEvent(ev);
  $mdDialog.show($scope.alert);
  
  $scope.project.build({
    complete: function() {
      $mdDialog.hide($scope.alert, 'finish');
    }
  });
}
;
  $scope.loadProject = function(folder) {
  $mdSidenav('left').toggle();
  
  window.localStorage.setItem('project', folder);
  
  var fs = require('fs'),
    git = require('gift'),
    path = require('path'),
    userHome = require('user-home');
  var workspace = path.join(userHome, '.crystal/studio');
  var module_path = path.join(workspace, $rootScope.selectedAccount.name, folder, 'master');
  
  function load() {
    $scope.dir = folder;
    $scope.path = module_path;
    $scope.project = new crystal(module_path);
    $scope.selectedFolder = folder;
    
    $scope.config = $scope.project.config;
    console.log($scope.config);
    
    if ($scope.runningModules.indexOf(folder) !== -1) {
      $scope.runIcon = 'images/stop.svg';
    } else { 
      $scope.runIcon = 'images/run.svg';
    }
    
    var yaml = fs.readFileSync(module_path + '/.crystal/config.yml', 'utf-8');
    var editor = document.getElementsByClassName('CodeMirror')[0].CodeMirror;
    editor.setValue(yaml);
    
    angular.element($window).trigger('resize');
  };
  
  if (!fs.existsSync(module_path)) {
    git.clone('https://github.com/' + folder, module_path, function(err, _repo) {
      load();
    });
  } else {
    load();
  }
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
    
    $scope.project.run();
  }
}
;
  $scope.saveProject = function() {
  var fs = require('fs');
  
  var config = document.getElementsByClassName('CodeMirror')[0].CodeMirror.getDoc().getValue();
  fs.writeFileSync($scope.path + '/.crystal/config.yml', config);
}
;
  $scope.switchProject = function() {
  $mdSidenav('project-sidebar').toggle();
};
;
  $scope.uploadProject = function(ev) {
  $mdDialog.show({
    controller: 'AddRepoCtrl',
    templateUrl: 'partials/upload.tmpl.html',
    parent: angular.element(document.body),
    targetEvent: ev,
    clickOutsideToClose: true
  })
  .then(function(answer) {
    
  }, function() {
    
  });
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
