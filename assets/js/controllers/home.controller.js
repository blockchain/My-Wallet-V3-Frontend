angular
  .module('walletApp')
  .controller('HomeCtrl', HomeCtrl);

function HomeCtrl ($scope, MyWallet, Wallet, Ethereum, BitcoinCash, Env, tradeStatus, localStorageService, currency, modals, $state, sfox) {

  $scope.btc = {
    total: () => Wallet.total('') || 0,
    accounts: MyWallet.wallet.hdwallet && MyWallet.wallet.hdwallet.accounts
  };

  $scope.eth = {
    total: () => Ethereum.balance || 0
  };

  $scope.bch = {
    total: () => BitcoinCash.balance || 0,
    accounts: BitcoinCash.accounts
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

  $scope.toggleDisplayCurrency = Wallet.toggleDisplayCurrency;
  $scope.openRequest = modals.openRequest;

  // SFOX signup steps functionality
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

  $scope.steps = enumify('create', 'verify', 'upload', 'link');
  $scope.displaySteps = ['create', 'verify', 'upload', 'link'];
  $scope.onOrAfterStep = (s) => $scope.afterStep(s) || $scope.onStep(s);
  $scope.afterStep = (s) => $scope.step > $scope.steps[s];
  $scope.onStep = (s) => $scope.steps[s] === $scope.step;
  $scope.goTo = (s) => { $scope.step = $scope.steps[s]; };

  Env.then((env) => {
    let accountInfo = MyWallet.wallet.accountInfo;
    let sfoxAvailableToUser = env.partners.sfox.countries.indexOf(accountInfo.countryCodeGuess) > -1 && env.partners.sfox.states.indexOf(accountInfo.stateCodeGuess) > -1;

    tradeStatus.canTrade().then(canTrade => {
      $scope.canBuy = canTrade && !sfoxAvailableToUser;

      let sfoxRegCompleted = sfox.profile && sfox.verified;

      if (!sfoxRegCompleted && canTrade && sfoxAvailableToUser) {
          $scope.showSfoxRegistration = true;
          // determine setup step
          $scope.goTo(sfox.determineStep(MyWallet.wallet.external.sfox));
      }
    });
  });
}
