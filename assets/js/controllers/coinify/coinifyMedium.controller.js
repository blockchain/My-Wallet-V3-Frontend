angular
  .module('walletApp')
  .controller('CoinifyMediumController', CoinifyMediumController);

function CoinifyMediumController ($scope, Alerts, buySell) {
  let quote = $scope.vm.quote;

  $scope.showNote = (medium) => {
    let isMedium = $scope.vm.medium === medium;

    let trades = $scope.vm.exchange.trades || [];
    let tradesOfTypeMedium = trades.filter((t) => t.medium === medium).length > 0;

    return isMedium && !tradesOfTypeMedium;
  };

  $scope.submit = () => {
    $scope.lock();
    let { medium } = $scope.vm;

    $scope.mediums[medium].getAccounts()
                          .then((accounts) => buySell.accounts = accounts)
                          .then(() => $scope.vm.goTo('summary'))
                          .then($scope.free).catch((err) => console.log(err));
  };

  quote.getPaymentMediums()
       .then((mediums) => $scope.mediums = mediums)
       .catch((err) => console.log(err));

  $scope.installLock();
}
