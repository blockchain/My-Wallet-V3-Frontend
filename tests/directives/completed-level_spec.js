describe('Completed Level directive', () => {
  let $compile;
  let $rootScope;
  let element;
  let isoScope;

  beforeEach(module('walletApp'));
  
  beforeEach(inject(function (_$compile_, _$rootScope_) {

    $compile = _$compile_;
    $rootScope = _$rootScope_;

  })
  );

  beforeEach(function () {
    element = $compile("<completed-level></completed-level>")($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    return isoScope.$digest();
  });

  it('has a templateUrl', () => expect(isoScope.tooltip.templateUrl).toBeTruthy());

  it('has a placement', () => expect(isoScope.tooltip.placement).toBeTruthy());
});
