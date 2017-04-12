angular
  .module('walletApp')
  .controller('CoinifyMediumController', CoinifyMediumController);

function CoinifyMediumController ($scope, Alerts, buySell) {
  $scope.installLock();
  let { quote } = $scope.vm;
  $scope.limits = buySell.limits;

  $scope.submit = () => {
    $scope.lock();
    let { medium } = $scope.vm;

    // cache accounts in My-Wallet-V3 instead
    $scope.mediums[medium].getAccounts()
                          .then((accounts) => buySell.accounts = accounts)
                          .then(() => $scope.vm.goTo('summary'))
                          .then($scope.free).catch((err) => console.log(err));
  };

  $scope.lock();

  quote.getPaymentMediums()
       .then((mediums) => $scope.mediums = mediums)
       .then($scope.free).catch((err) => console.log(err));
}
