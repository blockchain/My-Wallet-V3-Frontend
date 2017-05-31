angular
  .module('walletApp')
  .controller('UnocoinCheckoutController', UnocoinCheckoutController);

function UnocoinCheckoutController ($scope, $timeout, $stateParams, $q, Wallet, MyWalletHelpers, Alerts, currency, modals, unocoin, exchangeRate, $rootScope, showCheckout, buyMobile) {
  let exchange = $scope.vm.external.unocoin;

  $scope.rupees = currency.currencies.filter(c => c.code === 'INR')[0];

  $scope.openUnocoinSignup = (quote) => {
    $scope.modalOpen = true;
    return modals.openUnocoinSignup(exchange, quote).finally(() => { $scope.modalOpen = false; });
  };

  $scope.state = {
    trades: exchange.trades,
    buyLimit: exchange.profile && exchange.profile.currentLimits.bank.inRemaining * -exchangeRate.quoteAmount
  };

  $scope.setState = () => {
    $scope.state.trades = exchange.trades;
    $scope.state.buyLimit = exchange.profile && exchange.profile.currentLimits.bank.inRemaining * -exchangeRate.quoteAmount;
  };

  $scope.stepDescription = () => {
    let stepDescriptions = {
      'verify': { text: 'Verify Identity', i: 'ti-id-badge' },
      'link': { text: 'Link Payment', i: 'ti-credit-card bank bank-lrg' }
    };
    let step = unocoin.determineStep(exchange);
    return stepDescriptions[step];
  };

  $scope.userId = exchange.user;
  $scope.siftScienceEnabled = false;

  $scope.signupCompleted = exchange.profile.level > 1;
  $scope.showCheckout = $scope.signupCompleted || (showCheckout && !$scope.userId);

  $scope.inspectTrade = modals.openTradeSummary;

  $scope.tabs = {
    selectedTab: $stateParams.selectedTab || 'BUY_BITCOIN',
    options: ['BUY_BITCOIN', 'ORDER_HISTORY'],
    select (tab) { this.selectedTab = this.selectedTab ? tab : null; }
  };

  $scope.trades = exchange.trades;
  $scope.buyHandler = (...args) => unocoin.buy(...args);
  $scope.quoteHandler = unocoin.fetchQuote.bind(null, exchange);

  $scope.buySuccess = (trade) => {
    $scope.tabs.select('ORDER_HISTORY');
    modals.openTradeSummary(trade, 'initiated');
    exchange.fetchProfile().then($scope.setState);
    buyMobile.callMobileInterface(buyMobile.BUY_COMPLETED);
  };

  $scope.buyError = () => {
    Alerts.displayError('EXCHANGE_CONNECT_ERROR');
  };
}
