describe('LoginCtrl', () => {
  let scope;
  let Alerts;
  let localStorageService;

  let modal = {
   open(args) {
     return {
       result: {
         then () {}
       }
     };
   }
 };

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
   angular.mock.inject(function ($injector, $rootScope, $controller, $httpBackend) {
     // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
     $httpBackend.whenGET('/Resources/wallet-options.json').respond();

     let Wallet = $injector.get('Wallet');
     let WalletNetwork = $injector.get('WalletNetwork');
     Alerts = $injector.get('Alerts');

     spyOn(WalletNetwork, 'resendTwoFactorSms').and.callThrough();

     let MyWallet = $injector.get('MyWallet');

     $rootScope.loginFormUID = {
       then(cb) {
         cb("1234");
         return {
           catch () {}
         };
       }
     };

     scope = $rootScope.$new();

     return $controller('LoginCtrl', {
       $scope: scope,
       $stateParams: {},
       $uibModal: modal
     }
     );
   })
  );

  it('should login',  inject(function (Wallet) {
    scope.uid = "user";
    scope.password = "pass";

    spyOn(Wallet, 'login');

    return scope.login();
  })
  );

  it('should resend two factor sms', inject(function (Wallet, WalletNetwork, localStorageService) {
    spyOn(localStorageService, 'get').and.callFake(function (name) {
      if (name === "session") {
        return "token";
      }
    });
    Wallet.settings.twoFactorMethod = 5;
    scope.uid = "user";

    scope.resend();

    expect(WalletNetwork.resendTwoFactorSms).toHaveBeenCalled();
    expect(WalletNetwork.resendTwoFactorSms).toHaveBeenCalledWith("user", "token");
  })
  );
});
