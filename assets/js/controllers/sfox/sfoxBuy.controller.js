angular
  .module('walletApp')
  .controller('SfoxBuyController', SfoxBuyController);

function SfoxBuyController ($scope, Wallet, Alerts, sfox, formatTrade) {
  let exchange = $scope.vm.exchange;
  let profile = exchange.profile;

  $scope.user = Wallet.user;
  $scope.summaryCollapsed = false;
  $scope.fiatAmount = $scope.vm.fiatAmount;
  $scope.quoteHandler = (...args) => sfox.fetchQuote(exchange, ...args);

  $scope.state = {
    buyReady: false,
    buyLimit: profile ? profile.limits.buy : 100,
    buyLevel: profile && profile.verificationStatus.level
  };

  $scope.setState = () => {
    $scope.state.buyLimit = profile.limits.buy;
    $scope.state.buyLevel = profile.verificationStatus.level;
  };

  $scope.buyHandler = (...args) => {
    if (profile) {
      return sfox.buy($scope.account, ...args)
      .then(trade => {
        sfox.watchTrade(trade);
        $scope.trade = formatTrade.initiated(trade, [$scope.account]);
      })
      .then(() => exchange.fetchProfile())
      .then(() => $scope.setState())
      .catch(() => {
        Alerts.displayError('Error connecting to our exchange partner');
      });
    } else {
      return $scope.vm.goTo('create');
    }
  };

  exchange.getBuyMethods()
    .then(methods => methods.ach.getAccounts())
    .then(accounts => { $scope.account = accounts[0]; });

  $scope.buyReady = (ready) => $scope.state.buyReady = profile && ready;
  $scope.updateAmount = (amount) => amount && ($scope.vm.fiatAmount = amount);
}
