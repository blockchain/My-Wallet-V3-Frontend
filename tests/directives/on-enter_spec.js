describe('Watch Only Address Directive', () => {
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
    element = $compile("<div on-enter></div>")($rootScope);
    return $rootScope.$digest();
  });

  it("should be defined with an element", () => expect(element).toBeDefined());
});