describe('Alerts Directive', () => {
  var element, isoScope;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() => {
    inject(($compile, $rootScope) => {
      let $scope = $rootScope.$new();
      $scope.alerts = [];

      element = $compile('<alerts context="alerts"></alerts>')($scope);

      $scope.$digest();
      isoScope = element.isolateScope();
      isoScope.$digest();
    });
  });

  it('should have access to wallet alerts', inject(() => {
    expect(isoScope.alerts).toBeDefined();
  }));

  it('should display a new alert', inject((Alerts) => {
    let msg = 'error_msg';
    Alerts.displayError(msg, false, isoScope.alerts);
    expect(isoScope.alerts[0].type).toEqual('danger');
    expect(isoScope.alerts[0].msg).toEqual(msg);
  }));

});
