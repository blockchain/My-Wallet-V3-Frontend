describe('passwordEntropy', () => {
  let $scope;
  let isoScope;
  let MyWalletHelpers;

  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, $injector) {
    let $compile = _$compile_;
    let $rootScope = _$rootScope_;
    let scope = $rootScope.$new();
    MyWalletHelpers = $injector.get('MyWalletHelpers');

    $scope = $rootScope.$new();
    $scope.fields = { password: '' };
    let element = $compile('<password-entropy password="fields.password"></password-entropy>')($scope);
    $scope.$digest();
    return isoScope = element.isolateScope();
  })
  );

  beforeEach(function () {
    expect(isoScope.score).toEqual(0);
    expect(isoScope.barColor).toEqual('progress-bar-danger');
    expect(isoScope.strength).toEqual('weak');
  });

  it('should update the score when the password changes', () => {
    $scope.fields.password = 'a';
    $scope.$digest();
    expect(isoScope.score).toEqual(25);
  });

  it('should never set the score to above 100', () => {
    $scope.fields.password = 'asdfasdfasdfasdfasdfasdfasdf';
    $scope.$digest();
    expect(isoScope.score).toEqual(100);
  });

  it('should set the display values correctly', () => {
    $scope.fields.password = 'ab';
    $scope.$digest();
    expect(isoScope.barColor).toEqual('progress-bar-info');
    expect(isoScope.strength).toEqual('normal');
  });
});
