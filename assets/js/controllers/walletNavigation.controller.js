angular
  .module('walletApp')
  .controller('WalletNavigationCtrl', WalletNavigationCtrl);

function WalletNavigationCtrl ($rootScope, $scope, Wallet, MyWallet, Options, Alerts, SecurityCenter, $state, $uibModal, filterFilter, $location) {
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.security = SecurityCenter.security;

  $scope.accountInfo = MyWallet.wallet && MyWallet.wallet.accountInfo;
  $scope.userHasAccount = () => MyWallet.wallet.external && MyWallet.wallet.external.coinify && MyWallet.wallet.external.coinify.hasAccount;
  $scope.isUserInvited = $scope.accountInfo && $scope.accountInfo.invited;

  $scope.isCountryWhitelisted = null;

  $scope.setIsCountryWhitelisted = (options) => {
    let whitelist = options.showBuySellTab || [];
    $scope.isCountryWhitelisted = $scope.accountInfo && whitelist.indexOf($scope.accountInfo.countryCodeGuess) > -1;
  };

  // Debug:
  // $scope.isUserInvited = false;

  // debug invited user and whitelisted
  // $scope.isUserInvited = true;
  // $scope.isCountryWhitelisted = true;

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
    templateUrl: 'partials/support.jade',
    windowClass: 'bc-modal auto'
  });

  // .then() waits for the next digest, which causes a flicker.
  if (Options.didFetch) {
    $scope.setIsCountryWhitelisted(Options.options);
  } else {
    Options.get().then($scope.setIsCountryWhitelisted);
  }
}
