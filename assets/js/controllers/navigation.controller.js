angular
  .module('walletApp')
  .controller('NavigationCtrl', NavigationCtrl);

function NavigationCtrl ($rootScope, $scope, Wallet, currency, SecurityCenter, $translate, $cookies, $state, filterFilter, $interval, $timeout, Alerts) {
  $scope.status = Wallet.status;
  $scope.security = SecurityCenter.security;
  $scope.settings = Wallet.settings;

  $scope.logout = () => {
    if (!Wallet.isSynchronizedWithServer()) {
      Alerts.confirm('CHANGES_BEING_SAVED', {}, 'top').then($scope.doLogout);
    } else {
      $scope.doLogout();
    }
  };

  $scope.openZeroBlock = () => {
    const win = window.open('https://zeroblock.com', '_blank');
    win.focus();
  };

  $scope.openBCmarkets = () => {
    const win = window.open('https://markets.blockchain.info/', '_blank');
    win.focus();
  };

//  #################################
//  #           Private             #
//  #################################

  $scope.doLogout = () => {
    Alerts.confirm('ARE_YOU_SURE_LOGOUT', {}, 'top').then(() => {
      $scope.uid = null;
      $scope.password = null;
      $cookies.remove('password');
      let sessionToken = $cookies.get('session');
      $cookies.remove('session');
//      $cookies.remove("uid") // Pending a "Forget Me feature"

      $state.go('wallet.common.transactions', {
        accountIndex: ''
      });
      Wallet.logout(sessionToken);  // Refreshes the browser, so won't return
    });
  };

  const intervalTime = 15 * 60 * 1000;
  $interval(() => {
    if (Wallet.status.isLoggedIn) currency.fetchExchangeRate();
  }, intervalTime);
}
