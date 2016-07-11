angular
  .module('walletApp')
  .controller('NavigationCtrl', NavigationCtrl);

function NavigationCtrl ($scope, $interval, $timeout, $cookies, Wallet, Alerts, currency, whatsNew) {
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;

  $scope.whatsNewTemplate = 'templates/whats-new.jade';
  $scope.lastViewedWhatsNew = $cookies.get('whatsNewViewed') || 0;
  $scope.feats = whatsNew;
  $scope.nLatestFeats = whatsNew.filter(({ date }) => date > $scope.lastViewedWhatsNew).length;

  $scope.viewedWhatsNew = () => $timeout(() => {
    $scope.nLatestFeats = 0;
    $scope.lastViewedWhatsNew = Date.now();
    $cookies.put('whatsNewViewed', Date.now());
  });

  $scope.logout = () => {
    let isSynced = Wallet.isSynchronizedWithServer();
    let message = isSynced ? 'CONFIRM_LOGOUT' : 'CONFIRM_FORCE_LOGOUT';
    Alerts.confirm(message, { modalClass: 'top' }).then(() => {
      Wallet.logout();  // Refreshes the browser, so won't return
    });
  };

  if ($scope.status.firstTime) {
    $scope.viewedWhatsNew();
  }

  $interval(() => {
    if (Wallet.status.isLoggedIn) currency.fetchExchangeRate();
  }, 15 * 60000);
}
