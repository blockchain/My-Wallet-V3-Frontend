angular
  .module('walletApp')
  .controller('SfoxBuyController', SfoxBuyController);

function SfoxBuyController ($scope, Wallet, Alerts, sfox, formatTrade, buyMobile, currency) {
  let exchange = $scope.vm.exchange;

  $scope.user = Wallet.user;
  $scope.userId = exchange.user;
  $scope.summaryCollapsed = false;
  $scope.quote = $scope.vm.quote;
  $scope.dollars = currency.currencies.filter(c => c.code === 'USD')[0];
  $scope.quoteHandler = (...args) => sfox.fetchQuote(exchange, ...args);

  $scope.state = {
    buyLimit: exchange.profile.limits.buy,
    buyLevel: exchange.profile.verificationStatus.level
  };

  $scope.setState = () => {
    $scope.state.buyLimit = exchange.profile.limits.buy;
    $scope.state.buyLevel = exchange.profile.verificationStatus.level;
  };

  $scope.buySuccess = (trade) => {
    sfox.watchTrade(trade);
    exchange.fetchProfile().then($scope.setState);
    $scope.trade = formatTrade.initiated(trade, [$scope.account]);
    buyMobile.callMobileInterface(buyMobile.BUY_COMPLETED);
    // Send SFOX user identifier and trade id to Sift Science, inside an iframe:
    if ($scope.buySellDebug) {
      console.info('Load Sift Science iframe');
    }
    $scope.tradeId = trade.id;
    $scope.siftScienceEnabled = true;
  };

  $scope.buyError = () => {
    Alerts.displayError('EXCHANGE_CONNECT_ERROR');
  };

  exchange.getBuyMethods()
    .then(methods => methods.ach.getAccounts())
    .then(accounts => { $scope.account = accounts[0]; });
}
