angular
  .module('walletApp')
  .controller('HomeCtrl', HomeCtrl);

let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

function HomeCtrl ($rootScope, $scope, MyWallet, Wallet, Ethereum, BitcoinCash, Env, tradeStatus, localStorageService, currency, modals, $state, sfox, accounts) {
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

  // ensure all recent transactions are reflected in activity widget
  $rootScope.$emit('updateActivityFeed');

  $scope.exchange = MyWallet.wallet && MyWallet.wallet.external && MyWallet.wallet.external.sfox;

  // SFOX signup
  $scope.steps = enumify('create', 'verify', 'upload', 'link');
  $scope.displaySteps = ['create', 'verify', 'upload', 'link'];
  $scope.onOrAfterStep = (s) => $scope.afterStep(s) || $scope.onStep(s);
  $scope.afterStep = (s) => $scope.step > $scope.steps[s];
  $scope.onStep = (s) => $scope.steps[s] === $scope.step;
  $scope.goTo = (s) => {
    $scope.step = $scope.steps[s];
  };

  sfox.accounts = accounts;

  let calcSfoxStep = () => {
    if (!$scope.sfoxAvailable || (sfox.activeAccount && sfox.profile.verificationStatus.level === 'pending' && !sfox.profile.verificationStatus.required_docs.length)) {
      $scope.showSfoxRegistration = false;
    } else {
      $scope.showSfoxRegistration = true;
      $scope.goTo(sfox.determineStep($scope.exchange));
    }
  };

  calcSfoxStep();

  Env.then((env) => {
    let accountInfo = MyWallet.wallet.accountInfo;
    let sfoxAvailableToUser = env.partners.sfox.countries.indexOf(accountInfo.countryCodeGuess) > -1 && env.partners.sfox.states.indexOf(accountInfo.stateCodeGuess) > -1;

    tradeStatus.canTrade().then(canTrade => {
      $scope.canBuy = canTrade && !sfoxAvailableToUser;
      $scope.sfoxAvailable = canTrade && sfoxAvailableToUser;

      if ($scope.sfoxAvailable) {
        calcSfoxStep();
      }
    });
  });
}
