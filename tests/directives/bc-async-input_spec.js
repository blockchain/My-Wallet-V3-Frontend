describe('bcAsyncInput Directive', function () {
  let $compile;
  let scope;
  let isoScope;

  beforeEach(module('walletDirectives'));
  
  let compileElement = function (attrs) {
    if (attrs != null) { attrs = attrs.join(' '); }

    let element = $compile(`<bc-async-input ${attrs} ng-model="testModal"></bc-async-input>`)(scope);
    scope.$digest();

    isoScope = element.isolateScope();
    isoScope.$digest();

    isoScope.$root = { $safeApply() {} };

    return isoScope;
  };

  beforeEach(module('walletApp'));

  beforeEach(inject(function (_$compile_, $rootScope, Wallet) {

    $compile = _$compile_;

    scope = $rootScope.$new();
    scope.testModal = 'oldValue';

    return scope.testValidator = function (value) {
      if (value === 'invalidValue') { return false; }
      return true;
    };

  })
  );

  describe('initialization', function () {

    beforeEach(() => isoScope = compileElement());

    it('should have a user', () => expect(isoScope.status).toBeDefined());

    it('should have a status', () => expect(isoScope.status).toEqual({ edit: false, saving: false }));

    it('should have access to the model value', () => expect(isoScope.form.newValue).toBe('oldValue'));

    it('should have buttonClass', () => expect(isoScope.buttonClass).toBe('button-primary button-sm'));

    it('should have inline attribute set to false', () => expect(isoScope.inline).toBe(false));

    it('should have type "text" by default', () => expect(isoScope.type).toBe('text'));
  });

  describe('inline attributes', function () {

    it('should get passed buttonClass', function () {
      isoScope = compileElement(['button-class="button-success button-lg"']);
      expect(isoScope.buttonClass).toBe('button-success button-lg');
    });

    it('should get passed inline attribute', function () {
      isoScope = compileElement(['inline']);
      expect(isoScope.inline).toBe(true);
    });

    it('should get passed isRequired attribute', function () {
      isoScope = compileElement(['is-required']);
      expect(isoScope.isRequired).toBe(true);
    });

    it('should get passed type attribute', function () {
      isoScope = compileElement(['type="email"']);
      expect(isoScope.type).toBe('email');
    });

    it('should get passed validator', function () {
      isoScope = compileElement(['validator="testValidator"']);
      expect(typeof isoScope.validator).toBe('function');
    });
  });

  describe('edit', function () {

    beforeEach(() => isoScope = compileElement());

    it('should edit when edit() is called', function () {
      isoScope.edit();
      expect(isoScope.status.edit).toBe(1);
    });

    it('should edit when focus() is called', function () {
      isoScope.focus();
      expect(isoScope.status.edit).toBe(1);
    });
  });

  describe('validation', function () {

    beforeEach(() =>
      isoScope = compileElement([
        'validator="testValidator"',
        'is-required'
      ])
    );

    it('should be valid', function () {
      isoScope.bcAsyncForm.input.$setViewValue('newValue');
      expect(isoScope.bcAsyncForm.$valid).toBe(true);
    });

    it('should be invalid if empty', function () {
      isoScope.bcAsyncForm.input.$setViewValue('');
      expect(isoScope.bcAsyncForm.$valid).toBe(false);
    });

    it('should be invalid if validator function returns false', function () {
      isoScope.bcAsyncForm.input.$setViewValue('invalidValue');
      expect(isoScope.bcAsyncForm.$valid).toBe(false);
    });

    // it 'should be invalid if email type requirement is not met', ->
    //   isoScope = compileElement(['type="email"'])
    //   isoScope.bcAsyncForm.input.$setViewValue('test@test.')
    //   expect(isoScope.bcAsyncForm.$valid).toBe(false)

    it('should return true if the view is equal to the model', function () {
      isoScope.bcAsyncForm.input.$setViewValue('oldValue');
      expect(isoScope.bcAsyncForm.$valid).toBe(false);
    });
  });

  describe('cancel', function () {

    beforeEach(function () {
      isoScope = compileElement();
      isoScope.bcAsyncForm.input.$setViewValue('newValue');
      return isoScope.cancel();
    });

    it('should not save if cancelled', () => expect(isoScope.form.newValue).toBe('oldValue'));

    it('should be pristine', () => expect(isoScope.bcAsyncForm.$pristine).toBe(true));
  });

  describe('save', function () {

    beforeEach(() =>
      isoScope.onSave = (newValue, success, error) => success()
    );

    it('should validate when save() is called', function () {
      spyOn(isoScope, 'validate').and.callThrough();
      isoScope.save();
      expect(isoScope.validate).toHaveBeenCalled();
    });
  });
});
