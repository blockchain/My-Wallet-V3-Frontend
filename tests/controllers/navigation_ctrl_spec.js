describe('NavigationCtrl', () => {
  let scope;
  let Wallet;
  let $timeout;
  let mockFailure;

  let whatsNew = [
    { date: 1, title: 'feat1' },
    { date: 4, title: 'feat2' }
  ];

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function (localStorageService, $injector, $rootScope, $controller, $q) {
      $timeout = $injector.get('$timeout');
      Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');
      let Alerts = $injector.get('Alerts');
      let buyStatus = $injector.get('buyStatus');
      mockFailure = false;

      buyStatus.canBuy = () => $q.resolve(true);

      Alerts.confirm = msg => $q.resolve();

      Wallet.status = {
        isLoggedIn: true,
        didUpgradeToHd: true
      };

      Wallet.settings = {
        secondPassword: false
      };

      let mocked = function (value) {
        if (mockFailure) { return $q.reject(); } else { return $q.resolve(value); }
      };

      MyWallet.wallet = {
        metadata(n) {
          return {
            fetch () { return mocked({lastViewed: 3}); },
            update () { return mocked(); },
            create () { return mocked(); }
          };
        }
      };

      MyWallet.logout = () => Wallet.status.isLoggedIn = false;

      MyWallet.sync = () => Wallet.store.setIsSynchronizedWithServer(false);

      Wallet.isSynchronizedWithServer = () => Wallet.store.isSynchronizedWithServer();

      Wallet.store.setIsSynchronizedWithServer(true);

      spyOn(Date, 'now').and.returnValue(4);
      spyOn(localStorageService, 'get').and.returnValue(2);

      scope = $rootScope.$new();

      $rootScope.mock = true;

      $controller('NavigationCtrl', {
        $scope: scope,
        whatsNew
      }
      );

    });

  });

  it('should have access to login status',  inject(() => expect(scope.status.isLoggedIn).toBe(true))
  );

  it('should logout',  inject(function (Wallet, $stateParams, $state, $uibModal) {
    spyOn(Wallet, 'logout').and.callThrough();
    spyOn($state, "go");

    scope.logout();
    scope.$digest();

    expect(Wallet.logout).toHaveBeenCalled();
    expect(scope.status.isLoggedIn).toBe(false);
  })
  );

  it('should not logout if save is in progress',  inject(function (Wallet, MyWallet, $stateParams) {
    spyOn(Wallet, 'logout').and.callThrough();

    MyWallet.sync();
    scope.logout();

    expect(Wallet.logout).not.toHaveBeenCalled();
    expect(scope.status.isLoggedIn).toBe(true);
  })
  );

  describe('whats new', () => {
    it('should have the whats new template', () => expect(scope.whatsNewTemplate).toEqual('templates/whats-new.pug'));

    it('should have the feature array injected', () => {
      scope.$digest();
      expect(scope.feats.length).toEqual(2);
    });

    describe('without 2nd password', () => {
      beforeEach(() => scope.$digest());

      it('should get the last viewed time from metadata service', () => expect(scope.lastViewedWhatsNew).toEqual(3));

      it('should calculate the correct number of latest feats', () => {
        $timeout.flush();
        expect(scope.nLatestFeats).toEqual(1);
      });

      it('should update metadata service when new is viewed', inject(function ($timeout) {
        spyOn(scope.metaData, 'update');
        $timeout.flush();
        expect(scope.nLatestFeats).toEqual(1);
        scope.viewedWhatsNew();
        $timeout.flush();
        expect(scope.metaData.update).toHaveBeenCalledWith({lastViewed: 4});
        expect(scope.nLatestFeats).toEqual(0);
      })
      );
    });

    describe('without 2nd password if metadata service is down', () => {
      beforeEach(function () {
        mockFailure = true;
        return scope.$digest();
      });

      it('should get the last viewed time from localstorage', () => expect(scope.lastViewedWhatsNew).toEqual(2));

      it('should calculate the correct number of latest feats', () => {
        $timeout.flush();
        expect(scope.nLatestFeats).toEqual(1);
      });

      it('should store in localstorage when whats new is viewed', inject(function (localStorageService, $timeout) {
        spyOn(localStorageService, 'set');
        $timeout.flush();
        expect(scope.nLatestFeats).toEqual(1);
        scope.viewedWhatsNew();
        scope.$digest();
        expect(localStorageService.set).toHaveBeenCalledWith('whatsNewViewed', 4);
        $timeout.flush();
        expect(scope.nLatestFeats).toEqual(0);
      })
      );
    });

    describe('when 2nd password is enabled', () => {
      beforeEach(function () {
        Wallet.settings.secondPassword = true;
        return scope.$digest();
      });

      it('should get the last viewed time from a cookie', () => expect(scope.lastViewedWhatsNew).toEqual(2));

      it('should calculate the correct number of latest feats', () => {
        $timeout.flush();
        expect(scope.nLatestFeats).toEqual(1);
      });

      it('should store in localstorage when whats new is viewed', inject(function (localStorageService, $timeout) {
        spyOn(localStorageService, 'set');
        $timeout.flush();
        expect(scope.nLatestFeats).toEqual(1);
        scope.viewedWhatsNew();
        scope.$digest();
        expect(localStorageService.set).toHaveBeenCalledWith('whatsNewViewed', 4);
        $timeout.flush();
        expect(scope.nLatestFeats).toEqual(0);
      })
      );
    });

    describe('for a v2 wallet', () => {
      beforeEach(function () {
        scope.status.didUpgradeToHd = false;
        return scope.$digest();
      });

      it('should not fetch', () => expect(scope.lastViewedWhatsNew).toEqual(null));

      it('should fetch after upgrade', () => {
        scope.status.didUpgradeToHd = true;
        scope.$digest();
        expect(scope.lastViewedWhatsNew).toEqual(3);
      });
    });
  });
});
