angular
  .module('walletApp')
  .controller('WalletNavigationCtrl', WalletNavigationCtrl);

function WalletNavigationCtrl ($rootScope, $scope, Wallet, SecurityCenter, $state, $uibModal, filterFilter, $location, buyStatus, cta) {
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.security = SecurityCenter.security;
  $scope.userHasAccount = buyStatus.userHasAccount();

  $scope.shouldShowBuyCta = cta.shouldShowBuyCta;
  $scope.setBuyCtaDismissed = cta.setBuyCtaDismissed;
  $scope.shouldShowSecurityWarning = cta.shouldShowSecurityWarning;
  $scope.setSecurityWarningDismissed = cta.setSecurityWarningDismissed;
  $scope.getSecurityWarningMessage = cta.getSecurityWarningMessage;

  $scope.dismissBuyCta = () => {
    if ($scope.shouldShowBuyCta()) $scope.setBuyCtaDismissed();
  };

  buyStatus.canBuy().then((res) => $scope.canBuy = res);
  buyStatus.shouldShowInviteForm().then((res) => $scope.shouldShowInviteForm = res);

  $scope.showInviteForm = () => {
    $uibModal.open({
      templateUrl: 'partials/buy-subscribe-modal.pug',
      windowClass: 'bc-modal xs',
      controller: 'SubscribeCtrl'
    });
  };

  $scope.numberOfActiveLegacyAddresses = () => {
    if (!Wallet.status.isLoggedIn) return null;

    return filterFilter(Wallet.legacyAddresses(), {
      archived: false
    }).length;
  };

  $scope.numberOfActiveAccounts = () => {
    return filterFilter(Wallet.accounts(), {
      archived: false
    }).length;
  };

  $scope.accountsRoute = () => [
    'wallet.common.settings.accounts_index',
    'wallet.common.settings.accounts_addresses',
    'wallet.common.settings.imported_addresses'
  ].indexOf($state.current.name) > -1;

  $scope.showOrHide = (path) => $location.url().indexOf(path) !== -1;

  $rootScope.supportModal = () => $uibModal.open({
    templateUrl: 'partials/support.pug',
    windowClass: 'bc-modal auto'
  });
}
