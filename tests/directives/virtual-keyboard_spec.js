describe('VirtualKeyboard', () => {
  let Wallet;
  let scope;
  let isoScope;
  let mockKeyPress;

  beforeEach(module('walletApp'));

  beforeEach(() =>
    inject(function ($rootScope, $compile, $injector) {
      Wallet = $injector.get('Wallet');

      scope = $rootScope.$new();
      scope.input = '';

      let template = '<virtual-keyboard ng-model="input"></virtual-keyboard>';
      let element = $compile(template)(scope);
      scope.$digest();

      isoScope = element.isolateScope();
      return isoScope.$digest();
    })
  );

  describe('keyboard', () => {
    it('should have the correct number of rows lower case', () => {
      expect(isoScope.keysLowerCase.length).toBe(4);
    });

    it('should have the correct number of rows upper case', () => {
      expect(isoScope.keysUpperCase.length).toBe(4);
    });
  });

  describe('case', () => {
    it('should be lower at first', () => {
      expect(isoScope.caps).toBe(false);
    });

    it('should be able to switch to upper', () => {
      expect(isoScope.caps).toBe(false);
      isoScope.toggleCaps();
      expect(isoScope.caps).toBe(true);
    });

    it('should be able to switch back to lower', () => {
      isoScope.caps = true;
      isoScope.toggleCaps();
      expect(isoScope.caps).toBe(false);
    });
  });

  describe('press', () => {
    beforeEach(function () {
      mockKeyPress = key =>
        isoScope.backspaceEventHandler({
          preventDefault () {},
          which: key
        })
      ;

      scope.input = "abcde";
      scope.$digest();
      expect(scope.input).toEqual("abcde");
    });

    it('should set the viewValue on key press', () => {
      isoScope.press("f");
      expect(scope.input).toEqual("abcdef");
    });

    it('should handle backspace events', () => {
      mockKeyPress(8); // key 8 is the "delete" key
      expect(scope.input).toEqual("abcd");
    });

    it('shold backspace all if there is a selection', inject(function ($window) {
      spyOn($window, "getSelection").and.returnValue("cde");
      mockKeyPress(8);
      expect(scope.input).toEqual("");
    })
    );

    it('should not handle events that are not a backspace', () => {
      mockKeyPress(42);
      expect(scope.input).toEqual("abcde");
    });
  });

  describe('on destroy scope', () =>

    it('should unbind keydown keypress handler', inject(function ($document) {
      spyOn($document, "unbind");
      isoScope.$destroy();
      expect($document.unbind).toHaveBeenCalledWith(
        "keydown keypress", isoScope.backspaceEventHandler
      );
    })
    )
  );
});
