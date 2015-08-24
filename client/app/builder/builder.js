'use strict';

angular.module('capApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('builder', {
      	url: '/builder',
      	templateUrl: 'app/builder/builder.html',
      	controller: 'BuilderCtrl'
      })

      .state('index', {
        url: '^/builder/index',
        templateUrl: 'app/builder/index.html',
        controller: 'BuilderCtrl'
      })
      
      .state('risk', {
      	url: '^/builder/risk/:root',
      	templateUrl: 'app/builder/risk.html',
      	controller: 'BuilderCtrl'
      })

      .state('risk.edit', {
      	templateUrl: 'app/builder/risk-edit.html'
      })

      .state('risk.view', {
      	templateUrl: 'app/builder/risk-view.html'
      })

      .state('issue', {
        url: '^/builder/issue/:root',
        templateUrl: 'app/builder/builder.html',
        controller: 'BuilderCtrl'
      })

      .state('issue.view', {
        templateUrl: 'app/builder/issue-view.html'
      })

      .state('issue.edit', {
        templateUrl: 'app/builder/issue-edit.html'
      });

  });