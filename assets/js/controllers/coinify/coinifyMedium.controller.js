angular
  .module('walletApp')
  .controller('CoinifyMediumController', CoinifyMediumController);

function CoinifyMediumController ($scope, Alerts, buySell) {
  $scope.installLock();
  let { quote, getMaxMin, fiatCurrency } = $scope.vm;

  $scope.submit = () => {
    $scope.lock();
    let { medium } = $scope.vm;

    $scope.mediums[medium].getAccounts()
                          .then((accounts) => buySell.accounts = accounts)
                          .then(() => $scope.vm.goTo('summary'))
                          .then($scope.free).catch((err) => console.log(err));
  };

  $scope.lock();

  quote.getPaymentMediums()
       .then((mediums) => $scope.mediums = mediums)
       .then(() => getMaxMin(fiatCurrency()))
       .then($scope.free).catch((err) => console.log(err));
}
