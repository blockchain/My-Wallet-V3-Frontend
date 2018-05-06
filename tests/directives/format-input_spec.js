describe('format-input directive', () => {
  let $rootScope;
  let $compile;

  beforeEach(module('walletDirectives'));
  
  beforeEach(module('walletApp'));

  beforeEach(() =>
    inject(function (_$rootScope_, _$compile_) {
      $rootScope = _$rootScope_;
      return $compile = _$compile_;
    })
  );

  let createDirectiveScope = function (format) {
    let scope = $rootScope.$new(true);
    scope.formatted = "";
    let template = `<input ng-model="formatted" format-input="${format}"></fiat>`;
    let element = $compile(template)(scope);
    scope.$digest();
    return scope;
  };

  describe('reformat()', () => {
    let scope;
    beforeEach(() => scope = createDirectiveScope());

    it('should handle a single value', () => expect(scope.reformat("x", "1")).toEqual("1"));

    it('should handle a basic sequence', () => expect(scope.reformat("xxx", "123")).toEqual("123"));

    it('should add all punctuation', () => expect(scope.reformat("x.x.xx-xxx", "1234567")).toEqual("1.2.34-567"));

    it('should handle all existing punctuation', () => expect(scope.reformat("x.x.xx-xxx", "1.2.34-567")).toEqual("1.2.34-567"));

    it('should handle trailing digits', () => expect(scope.reformat("xxx", "1234")).toEqual("123"));
  });

  describe('isValid()', () => {
    it('should validate a single value', () => expect(createDirectiveScope("x").isValid("1")).toEqual(true));

    it('should invalidate when the input is short', () => expect(createDirectiveScope("xx").isValid("1")).toEqual(false));

    it('should invalidate when the input is long', () => expect(createDirectiveScope("x").isValid("11")).toEqual(false));

    it('should validate when punctuation matches', () => expect(createDirectiveScope("x.x.x").isValid("1.2.3")).toEqual(true));

    it('should invalidate when punctuation does not match', () => expect(createDirectiveScope("x.x.x").isValid("1-2-3")).toEqual(false));
  });
});
