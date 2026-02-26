describe('Scroll To Top Directive', () => {
  let $compile;
  let $rootScope;
  let $scope;
  let element;

  beforeEach(module('walletDirectives'));
  
  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {

    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

  })
  );

  beforeEach(function () {
    element = $compile("<div scroll-to-top></div>")($rootScope);
    $rootScope.$digest();
    return $scope.$apply();
  });

  it('has an element that is defined', () =>
    // $apply runs the watch function, just making sure element exists
    expect(element).toBeDefined()
  );
});
