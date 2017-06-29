angular
  .module('walletApp')
  .controller('UnocoinCheckoutController', UnocoinCheckoutController);

function UnocoinCheckoutController ($scope, $timeout, $stateParams, $q, Wallet, MyWalletHelpers, Alerts, currency, modals, unocoin, exchangeRate, mediums, $rootScope, showCheckout, buyMobile) {
  let exchange = $scope.vm.external.unocoin;

  $scope.rupees = currency.currencies.filter(c => c.code === 'INR')[0];

  $scope.openUnocoinSignup = (quote) => {
    $scope.modalOpen = true;
    return modals.openUnocoinSignup(exchange, quote).finally(() => { $scope.modalOpen = false; });
  };

  $scope.state = {
    trades: exchange.trades,
    limits: {
      min: mediums && mediums.bank.minimumInAmounts[$scope.rupees.code],
      max: mediums && mediums.bank.limitInAmounts['BTC'] * exchangeRate.quoteAmount
    }
  };

  $scope.stepDescription = () => {
    let stepDescriptions = {
      'verify': { text: 'Setup Profile', i: 'ti-id-badge' },
      'upload': { text: 'Upload Documents', i: 'ti-id-badge' },
      'pending': { text: 'Identity Verification Pending', i: 'icon-phone' }
    };
    let step = unocoin.determineStep(exchange);
    return stepDescriptions[step];
  };

  $scope.userId = exchange.user;
  $scope.siftScienceEnabled = false;

  $scope.signupCompleted = exchange.profile.level > 2;
  $scope.showCheckout = $scope.signupCompleted || (showCheckout && !$scope.userId);
  $scope.inspectTrade = (quote, trade) => trade.state === 'awaiting_reference_number' ? modals.openBankTransfer(trade) : modals.openTradeSummary(trade);

  $scope.tabs = {
    selectedTab: $stateParams.selectedTab || 'BUY_BITCOIN',
    options: ['BUY_BITCOIN', 'ORDER_HISTORY'],
    select (tab) { this.selectedTab = this.selectedTab ? tab : null; }
  };

  $scope.trades = exchange.trades;
  $scope.buyHandler = (...args) => unocoin.buy(...args);
  $scope.quoteHandler = unocoin.fetchQuote.bind(null, exchange);

  $scope.buySuccess = (trade) => {
    modals.openBankTransfer(trade);
  };

  $scope.buyError = () => {
    Alerts.displayError('EXCHANGE_CONNECT_ERROR');
  };
}
