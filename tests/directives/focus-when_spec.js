describe('Focus when directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let $scope;

  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$window_) {

    $compile = _$compile_;
    $rootScope = _$rootScope_;
    let $window = _$window_;
    $scope = $rootScope.$new();

  })
  );

  beforeEach(function () {
    element = $compile("<span focus-when='true'>some copy</span>")($rootScope);
    $rootScope.$digest();
    return $scope.$apply();
  });

  it('can be focused', () => {
    spyOn(element[0], 'focus').and.callThrough();
    element[0].focus();
    expect(element[0].focus).toHaveBeenCalled();
  });
});