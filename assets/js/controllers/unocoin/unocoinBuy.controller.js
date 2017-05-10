angular
  .module('walletApp')
  .controller('UnocoinBuyController', UnocoinBuyController);

function UnocoinBuyController ($scope, Wallet, Alerts, sfox, formatTrade, buyMobile) {
  let exchange = $scope.vm.exchange;

  $scope.user = Wallet.user;
  $scope.userId = exchange.user;
  $scope.summaryCollapsed = false;
  $scope.quote = $scope.vm.quote;
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
    exchange.fetchProfile().then($scope.setState);
    $scope.trade = formatTrade.initiated(trade, [$scope.account]);
    buyMobile.callMobileInterface(buyMobile.BUY_COMPLETED);
  };

  $scope.buyError = () => {
    Alerts.displayError('EXCHANGE_CONNECT_ERROR');
  };

  exchange.getBuyMethods()
    .then(methods => methods.ach.getAccounts())
    .then(accounts => { $scope.account = accounts[0]; });
}
