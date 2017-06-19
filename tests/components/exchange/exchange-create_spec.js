describe('exchange-create.component', () => {
  let scope;
  let $rootScope;
  $rootScope = undefined;
  let $compile;
  let $templateCache;
  let $componentController;
  let Wallet;
  let $q;

  let views = ['email', 'summary'];
  let onCreate = () => { return true; };
  let ToS = 'http://unocoin.com';
  let privacyAgreement = 'http://unocoin.com/privacy';
  let exchange = {
    constructor: {
      name: 'Unocoin'
    },
    signup () { return $q.resolve(); },
    fetchProfile () { return $q.resolve(); }
  };

  let handlers = {
    views,
    onCreate,
    ToS,
    privacyAgreement,
    exchange
  };

  let getController = function (bindings) {
    scope = $rootScope.$new();
    let ctrl = $componentController('exchangeCreate', {$scope: scope}, bindings);
    let template = $templateCache.get('templates/exchange/create.pug');
    $compile(template)(scope);
    return ctrl;
  };

  beforeEach(module('walletApp'));
  beforeEach(() =>
    angular.mock.inject(function ($injector, _$rootScope_, _$compile_, _$templateCache_, _$componentController_, $httpBackend, _$q_) {
      $rootScope = _$rootScope_;
      $compile = _$compile_;
      $templateCache = _$templateCache_;
      $componentController = _$componentController_;
      $httpBackend.whenGET('/Resources/wallet-options.json').respond();

      $q = _$q_;

      Wallet = $injector.get('Wallet');
      // Wallet.user = {
      //   email: 'sn@blockchain.com',
      //   mobileNumber: '123-456-7891'
      // };

      Wallet.changeEmail = () => $q.resolve();
      Wallet.verifyEmail = () => $q.resolve();
      Wallet.changeMobile = () => $q.resolve();
    })
  );

  describe('view()', () => {
    it('should set state.view', () => {
      let ctrl = getController(handlers);
      ctrl.view('summary');
      expect(ctrl.state.view).toBe('summary');
    });
  });

  describe('viewing()', () => {
    it('should check for equality with state.view', () => {
      let ctrl = getController(handlers);
      ctrl.state.view = 'email';
      ctrl.viewing('email');
      expect(ctrl.viewing('email')).toBe(true);
    });
  });

  describe('emailCodeSent()', () => {
    it('should set state', () => {
      let ctrl = getController(handlers);
      ctrl.emailCodeSent();
      scope.$digest();
      expect(ctrl.state.sentEmailCode).toBe(true);
    });
  });

  describe('mobileCodeSent()', () => {
    it('should set state', () => {
      let ctrl = getController(handlers);
      ctrl.mobileCodeSent();
      scope.$digest();
      expect(ctrl.state.sentMobileCode).toBe(true);
    });
  });

  describe('sendMobileCode()', () => {
    it('should call changeMobile()', () => {
      let ctrl = getController(handlers);
      spyOn(ctrl, 'changeMobile');
      ctrl.sendMobileCode();
      expect(ctrl.changeMobile).toHaveBeenCalled();
    });
  });

  describe('verifyMobile()', () => {
    it('should call Wallet.verifyMobile', () => {
      let ctrl = getController(handlers);
      spyOn(Wallet, 'verifyMobile');
      ctrl.verifyMobile();
      expect(Wallet.verifyMobile).toHaveBeenCalled();
    });
  });

  describe('changeMobile()', () => {
    it('should call Wallet.changeMobile', () => {
      let ctrl = getController(handlers);
      spyOn(Wallet, 'changeMobile');
      ctrl.changeMobile();
      expect(Wallet.changeMobile).toHaveBeenCalled();
    });
  });

  describe('verifyEmail()', () => {
    it('should call Wallet.verifyEmail', () => {
      let ctrl = getController(handlers);
      spyOn(Wallet, 'verifyEmail');
      ctrl.verifyEmail();
      expect(Wallet.verifyEmail).toHaveBeenCalled();
    });
  });

  describe('sendEmailCode()', () => {
    it('should call Wallet.sendConfirmationCode', () => {
      let ctrl = getController(handlers);
      spyOn(Wallet, 'sendConfirmationCode');
      ctrl.sendEmailCode();
      expect(Wallet.sendConfirmationCode).toHaveBeenCalled();
    });
  });

  describe('createAccount()', () => {
    it('should call exchange.signup', () => {
      let ctrl = getController(handlers);
      spyOn(ctrl.exchange, 'signup');
      spyOn(ctrl.exchange, 'fetchProfile');
      ctrl.createAccount();
      $rootScope.$digest();
      expect(ctrl.exchange.signup).toHaveBeenCalled();
      expect(ctrl.exchange.fetchProfile).toHaveBeenCalled();
    });
  });
});
