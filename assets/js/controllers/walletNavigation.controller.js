angular
  .module('walletApp')
  .controller('WalletNavigationCtrl', WalletNavigationCtrl);

function WalletNavigationCtrl ($rootScope, $scope, Wallet, MyWallet, Options, Alerts, SecurityCenter, $state, $uibModal, filterFilter, $location) {
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.security = SecurityCenter.security;

  let accountInfo = MyWallet.wallet && MyWallet.wallet.accountInfo;
  $scope.userHasAccount = () => MyWallet.wallet.external && MyWallet.wallet.external.coinify.hasAccount;
  $scope.isUserInvited = accountInfo && accountInfo.invited;

  $scope.isCountryWhitelisted = null;

  $scope.setIsCountryWhitelisted = (options) => {
    let whitelist = options.showBuySellTab || [];
    let countryInWhitelist = whitelist.indexOf(accountInfo.countryCodeGuess) > -1;
    $scope.isCountryWhitelisted = accountInfo && countryInWhitelist;
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

  $scope.setIsCountryWhitelisted(Options.options);
  Options.get().then($scope.setIsCountryWhitelisted);
}
