describe('SignupCtrl', () => {
  let scope;
  let modalInstance = {
    close () {},
    dismiss () {}
  };
  let $httpBackend;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller, $compile, $templateCache) {
      let Wallet = $injector.get('Wallet');

      $httpBackend = $injector.get('$httpBackend');
      $httpBackend.expectGET('https://blockchain.info/wallet/browser-info').respond({country_code: 'NL'});

      Wallet.my.browserCheck = () => true;
      Wallet.my.browserCheckFast = () => true;

      let $state = $injector.get('$state'); // This is a mock
      $state.params = {email: ''};

      Wallet.login = (uid, pass, code, twoFactor, success, error) => success();
      Wallet.create = (password, email, currency, language, success) => success('new_guid');
      Wallet.settings_api = {
        changeLanguage (code, success) { return success(); },
        changeLocalCurrency () {}
      };
      Wallet.changeCurrency = function () {};

      scope = $rootScope.$new();
      let template = $templateCache.get('partials/signup.pug');

      $controller('SignupCtrl', {
        $scope: scope,
        $stateParams: {},
        $uibModalInstance: modalInstance
      }
      );

      scope.model = { fields: { email: '', password: '', confirmation: '', acceptedAgreement: false } };
      $compile(template)(scope);

      scope.$digest();
    });
  });

  it('should have initial values', () => {
    expect(scope.fields.email).toBeDefined();
    expect(scope.fields.password).toBeDefined();
    expect(scope.fields.confirmation).toBeDefined();
    expect(scope.fields.acceptedAgreement).toBe(false);
  });

  it('should not register when invalid', () => {
    spyOn(scope, 'createWallet');
    scope.signupForm.password.$setViewValue('');
    scope.$digest();

    scope.signup();
    scope.$digest();
    expect(scope.createWallet).not.toHaveBeenCalled();
  });

  describe('password', () => {
    beforeEach(function () {
      let form = scope.signupForm;
      form.email.$setViewValue('a@b.com');
      form.agreement.$setViewValue(true);
      return scope.$digest();
    });

    it('should not have an error if password confirmation matches', () => {
      scope.signupForm.password.$setViewValue('testing');
      scope.signupForm.confirmation.$setViewValue('testing');
      scope.$digest();
      expect(scope.signupForm.confirmation.$valid).toBe(true);
    });

    it('should have an error if password confirmation does not match', () => {
      scope.signupForm.password.$setViewValue('testing');
      scope.signupForm.confirmation.$setViewValue('wrong');
      scope.$digest();
      expect(scope.signupForm.confirmation.$valid).toBe(false);
    });
  });

  describe('agreement', () => {
    beforeEach(function () {
      let form = scope.signupForm;
      form.email.$setViewValue('a@b.com');
      form.password.$setViewValue('my_password12345');
      form.confirmation.$setViewValue('my_password12345');
      return scope.$digest();
    });

    it('should not be signed by default', () => expect(scope.fields.acceptedAgreement).toBe(false));

    it('should be signed by the user to register', () => {
      expect(scope.signupForm.$valid).toBe(false);
      scope.signupForm.agreement.$setViewValue(true);
      scope.$digest();
      expect(scope.signupForm.$valid).toBe(true);
    });
  });

  describe('signup()', () => {
    beforeEach(function () {
      let form = scope.signupForm;
      form.email.$setViewValue('a@b.com');
      form.password.$setViewValue('my_password12345');
      form.confirmation.$setViewValue('my_password12345');
      form.agreement.$setViewValue(true);
      return scope.$digest();
    });

    it("should call createWallet()", inject(function ($timeout) {
      spyOn(scope, "createWallet");
      scope.signup();
      scope.$digest();
      $timeout.flush();

      expect(scope.createWallet).toHaveBeenCalled();
    })
    );

    it('should not call createWallet() if validation failed', () => {
      spyOn(scope, "createWallet");

      scope.signupForm.password.$setViewValue('weak');
      scope.$digest();

      scope.signup();
      expect(scope.createWallet).not.toHaveBeenCalled();
    });

    it("should create a new wallet", inject(function (Wallet) {
      spyOn(Wallet, 'create');
      scope.createWallet((function () { }));
      expect(Wallet.create).toHaveBeenCalled();
    })
    );

    it("should add password to local storage in dev mode", inject(function (localStorageService) {
      spyOn(localStorageService, 'set');
      scope.autoReload = true;
      scope.fields.password = "testing";

      scope.signup();
      scope.$digest();
      expect(localStorageService.set).toHaveBeenCalledWith('password', "testing");
    })
    );

    it("should not add password to local storage in production mode", inject(function (localStorageService) {
      spyOn(localStorageService, 'set');
      scope.autoReload = false;
      scope.fields.password = "testing";

      scope.signup();
      expect(localStorageService.set).not.toHaveBeenCalledWith('password', "testing");
    })
    );
  });

  describe('language', () => {
    it("should guess the correct language", () => expect(scope.language_guess.code).toBe("en"));

    it("should switch interface language to guessed language", inject(function ($translate, languages) {
      spyOn($translate, "use");
      expect(scope.language_guess.code).not.toBe(languages.languages[0].code);
      scope.language_guess = languages.languages[0];
      scope.$digest();
      expect($translate.use).toHaveBeenCalledWith(languages.languages[0].code);
    })
    );
  });

  describe("currency", () =>
    it('should guess the correct currency', () => {
      $httpBackend.flush();
      expect(scope.currency_guess.code).toBe("EUR");
    })
  );
});
