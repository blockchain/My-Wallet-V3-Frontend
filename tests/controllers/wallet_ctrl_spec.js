describe('WalletCtrl', () => {
  let scope;
  let callbacks;
  let mockModalInstance;
  let $httpBackend;
  let $rootScope;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(() =>
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      let Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');
      let buyStatus = $injector.get('buyStatus');
      $httpBackend = $injector.get('$httpBackend');
      $rootScope.rootURL = "https://blockchain.info/";
      $rootScope.karma = true;

      Wallet.accounts = () => [{},{}];

      mockModalInstance = {
        result: { then(confirmCallback, cancelCallback) {
          //Store the callbacks for later when the user clicks on the OK or Cancel button of the dialog
          this.confirmCallBack = confirmCallback;
          this.cancelCallback = cancelCallback;
        }
      },
        close(item) {
          //The user clicked OK on the modal dialog, call the stored confirm callback with the selected item
          this.result.confirmCallBack(item);
        },
        dismiss(type) {
          //The user clicked cancel on the modal dialog, call the stored cancel callback
          this.result.cancelCallback(type);
        }
      };

      scope = $rootScope.$new();

      return $controller('WalletCtrl', {
        $scope: scope,
        $stateParams: {}
      });}));



  it('should redirect to login if not logged in',  inject(function (Wallet, $state) {
    expect(scope.status.isLoggedIn).toBe(false);
    spyOn($state, "go");
    scope.$broadcast("$stateChangeSuccess", {name: "home"});
    expect($state.go).toHaveBeenCalledWith("public.login-no-uid");
  })
  );

  it('should not redirect to login if logged in',  inject(function (Wallet, $state) {
    Wallet.status.isLoggedIn = true;
    expect(scope.status.isLoggedIn).toBe(true);
    spyOn($state, "go");
    scope.$broadcast("$stateChangeSuccess", {name: "home"});
    expect($state.go).not.toHaveBeenCalled();

  })
  );

  it('should dismiss all modals on state change', inject(function ($state, $uibModalStack) {
    spyOn($uibModalStack, "dismissAll");
    scope.$broadcast("$stateChangeSuccess", {name: "home"});
    expect($uibModalStack.dismissAll).toHaveBeenCalled();
  })
  );

  it('should open a popup to send',  inject(function ($uibModal) {
    spyOn($uibModal, "open").and.callThrough();
    scope.send();
    expect($uibModal.open).toHaveBeenCalled();
  })
  );

  it('should open a popup to request',  inject(function ($uibModal) {
    spyOn($uibModal, "open").and.callThrough();
    scope.request();
    expect($uibModal.open).toHaveBeenCalled();
  })
  );

  describe('auto logout', () => {
    it('should reset the inactivity time', () => {
      spyOn(Date, 'now').and.returnValue(100);
      scope.inactivityTimeSeconds = 1;
      scope.onAction();
      expect(scope.lastAction).toEqual(100);
    });

    it('should show the logout warning modal', inject(function (Wallet, Alerts) {
      spyOn(Date, 'now').and.returnValue(690000);
      Wallet.status.isLoggedIn = true;
      Wallet.settings.logoutTimeMinutes = 10;
      scope.lastAction = 100000;
      spyOn(Alerts, 'confirm').and.callThrough();
      scope.inactivityCheck();
      expect(Alerts.confirm).toHaveBeenCalled();
    })
    );

    it('should clear the interval when the controller is destroyed', inject(function ($interval) {
      spyOn($interval, "cancel");
      scope.$broadcast("$destroy");
      expect($interval.cancel).toHaveBeenCalledWith(scope.inactivityInterval);
    })
    );
  });

  describe('HD upgrade', () =>
    it('should show modal if HD upgrade is needed', inject(function (Wallet, $uibModal) {
      Wallet.status.isLoggedIn = true;
      Wallet.goal.upgrade = true;
      spyOn($uibModal, "open").and.callThrough();
      scope.checkGoals();
      expect($uibModal.open).toHaveBeenCalled();
    })
    )
  );

  describe('welcome modal', () =>
    it('should open when firstTime goal is set', inject(function (Wallet, $rootScope, $timeout, $uibModal, buyStatus, $q) {
      buyStatus.canBuy = () => $q.resolve().then($uibModal.open);
      spyOn($uibModal, 'open').and.returnValue(mockModalInstance);
      spyOn(buyStatus, 'canBuy').and.callThrough();

      $httpBackend.expectGET('/Resources/wallet-options.json').respond({showBuySellTab: true});

      Wallet.status.isLoggedIn = true;
      Wallet.goal.firstTime = true;

      $rootScope.$digest();
      $timeout.flush();

      expect($uibModal.open).toHaveBeenCalled();
    })
    )
  );
});
