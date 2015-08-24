'use strict';

describe('Controller: BuilderCtrl', function () {

  // load the controller's module
  beforeEach(module('capApp'));
  beforeEach(module('socketMock'));
  beforeEach(module('stateMock'));

  var BuilderCtrl, 
      scope,
      state,
      $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, $state) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/issues')
      .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);
    // $httpBackend.expectGET('/api/risks')
    //   .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);
    // $httpBackend.expectGET('/api/issuegraphs/')
    //   .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);
    state = $state;
    scope = $rootScope.$new();
    BuilderCtrl = $controller('BuilderCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of risks and issuegraphs and issues to the scope', function () {
    $httpBackend.flush();
    expect(scope.issues.length).toBe(4);
    // expect(scope.risks.length).toBe(4);
    // expect(scope.graphs.length).toBe(4);
    state.expectTransitionTo('builder');
    state.expectTransitionTo('index');
    state.expectTransitionTo('risk');
    state.expectTransitionTo('risk.edit');

  });
});
