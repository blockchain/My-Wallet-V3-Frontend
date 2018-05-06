describe('SettingsCtrl', () => {
  let scope;

  beforeEach(angular.mock.module('walletApp'));

  beforeEach(function () {
    angular.mock.inject(function ($injector, $rootScope, $controller) {
      let Wallet = $injector.get('Wallet');
      let MyWallet = $injector.get('MyWallet');

      scope = $rootScope.$new();

      $controller('SettingsCtrl', {
        $scope: scope,
        $stateParams: {}
      });

    });

  });
});
