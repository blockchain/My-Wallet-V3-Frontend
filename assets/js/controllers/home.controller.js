angular
  .module('walletApp')
  .controller('HomeCtrl', HomeCtrl);

function HomeCtrl ($scope, MyWallet, Wallet, Ethereum, BitcoinCash, Env, tradeStatus, localStorageService, currency, modals, $state) {
  $scope.btc = {
    total: () => Wallet.total(''),
    accounts: MyWallet.wallet.hdwallet.accounts
  };

  $scope.eth = {
    total: () => Ethereum.balance
  };

  $scope.bch = {
    total: () => BitcoinCash.balance,
    accounts: MyWallet.wallet.bch.accounts
  };

  $scope.hasBalance = (currencies) => {
    let total = 0;
    currencies.forEach((currency) => total += parseFloat($scope[currency].total()));
    return total > 0;
  };

  $scope.isWalletInitialized = () => {
    let { isLoggedIn, didLoadSettings, didLoadTransactions } = Wallet.status;
    return isLoggedIn && didLoadSettings && (didLoadTransactions || !Wallet.isUpgradedToHD);
  };

  $scope.activeLegacyAddresses = () => (
    Wallet.status.isLoggedIn
      ? Wallet.legacyAddresses().filter(a => !a.archived)
      : null
  );

  $scope.activeAccounts = () => (
    Wallet.status.isLoggedIn
      ? Wallet.accounts().filter(a => !a.archived)
      : null
  );

  $scope.showMobileConversion = () => {
    const showMobileConversion = localStorageService.get('showMobileConversion');
    if (showMobileConversion === false) {
      return false;
    } else {
      return true;
    }
  };

  $scope.goToShiftWithDestination = (dest) => {
    $state.go('wallet.common.shift', { destination: dest });
  };

  Env.then((env) => {
    let accountInfo = MyWallet.wallet.accountInfo;
    let sfox = env.partners.sfox.countries.indexOf(accountInfo.countryCodeGuess) > -1 && env.partners.sfox.states.indexOf(accountInfo.stateCodeGuess) > -1;
    $scope.canBuy = tradeStatus.canTrade() && !sfox;
  });

  $scope.openRequest = modals.openRequest;
}
