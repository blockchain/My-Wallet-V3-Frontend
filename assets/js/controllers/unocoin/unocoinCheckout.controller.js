angular
  .module('walletApp')
  .controller('UnocoinCheckoutController', UnocoinCheckoutController);

function UnocoinCheckoutController ($scope, $stateParams, Wallet, MyWalletHelpers, AngularHelper, Alerts, currency, modals, unocoin, exchangeRate, mediums, showCheckout) {
  let exchange = $scope.vm.external.unocoin;
  $scope.exchange = unocoin.exchange;

  $scope.buying = unocoin.buying;
  $scope.rupees = currency.currencies.filter(c => c.code === 'INR')[0];

  $scope.openUnocoinSignup = (quote) => {
    $scope.modalOpen = true;
    return modals.openUnocoinSignup(exchange, quote).finally(() => { $scope.modalOpen = false; });
  };

  $scope.state = {
    trades: exchange.trades,
    limits: () => ({
      min: mediums && mediums.bank.minimumInAmounts[$scope.rupees.code],
      max: mediums && mediums.bank.limitInAmounts['BTC'] * exchangeRate.quoteAmount
    })
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

  $scope.signupCompleted = () => $scope.exchange.profile.level > 2;
  $scope.showCheckout = () => $scope.signupCompleted() || (showCheckout && !$scope.userId);
  $scope.inspectTrade = (quote, trade) => trade.state === 'awaiting_reference_number' ? modals.openBankTransfer(trade) : modals.openTradeDetails(trade);

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

  if (exchange.profile && exchange.profile.level === 2) unocoin.pollLevel();
}
