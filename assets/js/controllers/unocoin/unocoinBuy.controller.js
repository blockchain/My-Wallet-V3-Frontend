angular
  .module('walletApp')
  .controller('UnocoinBuyController', UnocoinBuyController);

function UnocoinBuyController ($scope, Wallet, Alerts, unocoin, formatTrade, buyMobile, currency, $q) {
  let exchange = $scope.vm.exchange;

  $scope.user = Wallet.user;
  $scope.userId = exchange.user;
  $scope.summaryCollapsed = false;
  $scope.quote = $scope.vm.quote;
  $scope.rupees = currency.currencies.filter(c => c.code === 'INR')[0];
  $scope.buyHandler = (...args) => unocoin.buy(...args);
  $scope.quoteHandler = (...args) => unocoin.fetchQuote(exchange, ...args);

  $scope.state = { buyLimit: exchange.profile.currentLimits.bank.inRemaining };

  $scope.setState = () => {
    $scope.state.buyLimit = exchange.profile.currentLimits.bank.inRemaining;
  };

  $scope.buySuccess = (trade) => {
    exchange.fetchProfile().then($scope.setState);
    $scope.trade = formatTrade.initiated(trade);
    buyMobile.callMobileInterface(buyMobile.BUY_COMPLETED);
  };

  $scope.buyError = () => {
    Alerts.displayError('EXCHANGE_CONNECT_ERROR');
  };
}
