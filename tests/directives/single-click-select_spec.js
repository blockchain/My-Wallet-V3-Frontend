describe('Click to highlight directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let $scope;
  let $window;

  beforeEach(module('walletDirectives'));
  
  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$window_) {

    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $window = _$window_;
    $scope = $rootScope.$new();

  })
  );

  beforeEach(function () {
    element = $compile("<span single-click-select>some copy</span>")($rootScope);
    $rootScope.$digest();
    $scope.$apply();
    return $scope.browser = {canExecCommand: false};});

  it('will check a browser version', () => expect($scope.browser.canExecCommand).toBeDefined());

  it('can fire the select function', () => {
    spyOn($scope, "select").and.callThrough();
    $scope.select();
    expect($scope.select).toHaveBeenCalled();
  });

  beforeEach(function () {
    $scope.browser = {canExecCommand: true};

    it('has a browser that can copy to clipboard', () => {
      spyOn($scope, "select").and.callThrough();
      $scope.select();
      expect($window.document.execCommand).toHaveBeenCalled();
    });
  });
});
