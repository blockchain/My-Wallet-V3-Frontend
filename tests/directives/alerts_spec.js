describe('Alerts Directive', () => {
  var element, isoScope;

  beforeEach(module('walletDirectives'));

  beforeEach(module('walletApp'));

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

  it('should close an alert', inject((Alerts) => {
    let msg = 'error_msg';
    let alert = Alerts.displayError(msg, false, isoScope.alerts);

    Alerts.close(isoScope.alerts[0], isoScope.alerts)
    expect(isoScope.alerts.length).toBe(0)
  }));

  it('should clear multiple alerts', inject((Alerts) => {
    for (var i = 0; i<10; i++) {
      let msg = 'error_msg' + i;
      Alerts.displayError(msg, false, isoScope.alerts)
    }

    Alerts.clear(isoScope.alerts)
    expect(isoScope.alerts.length).toBe(0)
  }));

  it('should open a modal on for confirms', inject((Alerts, $uibModal) => {
    spyOn($uibModal, 'open').and.callThrough()

    Alerts.confirm('error')

    expect($uibModal.open).toHaveBeenCalled()
  }))

});
