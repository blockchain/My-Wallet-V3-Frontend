describe('Helper Text Directive', () => {
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
    element = $compile("<helper-button></helper-button>")($rootScope);
    $rootScope.$digest();
    isoScope = element.isolateScope();
    return isoScope.$digest();
  });

  it('has a templateUrl', () => expect(isoScope.helperText.templateUrl).toBeTruthy());
});
